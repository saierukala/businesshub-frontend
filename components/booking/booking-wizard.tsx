"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/common/form-dialog";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { FormAlert } from "@/components/form/form-alert";
import { ApplianceForm } from "@/components/records/appliance-form";
import { AddressForm } from "@/components/records/address-form";
import { ChoiceList } from "./choice-list";
import { SlotPicker } from "./slot-picker";
import { ReviewStep } from "./review-step";
import { useServices } from "@/lib/queries/catalog";
import { useCustomerRecords } from "@/lib/queries/customer-records";
import { useCreateBooking } from "@/lib/queries/bookings";
import { ApiError } from "@/lib/api";
import { formatDuration, formatINR } from "@/lib/format";
import type { SlotOption } from "@/lib/types";

const STEPS = ["Appliance", "Problem and service", "Address", "Date and time", "Review"];
const SOURCES = [
  { value: "PHONE", label: "Phone call" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "WALK_IN", label: "Walk-in" },
];

type Draft = {
  applianceId?: string;
  problem: string;
  serviceId?: string;
  addressId?: string;
  date: string;
  slot?: SlotOption;
  // staff only
  technicianId?: string;
  source?: string;
  overrideReason: string;
};

// The booking flow (spec §9a for customers, §9b for staff). Both use this same component and the same API.
// customerId undefined = the logged-in customer books for themselves.
// customerId set = staff booking on behalf of that customer.
// Every choice is validated again by the backend when you confirm.
export function BookingWizard({ customerId }: { customerId?: string }) {
  const staff = customerId !== undefined;
  const router = useRouter();
  const create = useCreateBooking();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({ problem: "", date: "", overrideReason: "" });
  const [adding, setAdding] = useState<"appliance" | "address" | null>(null);
  const [needsOverride, setNeedsOverride] = useState<string | null>(null); // the API's message, when staff must give a reason

  const appliances = useCustomerRecords("appliances", customerId);
  const addresses = useCustomerRecords("addresses", customerId);
  const appliance = appliances.data?.items.find((a) => a.id === draft.applianceId);
  const address = addresses.data?.items.find((a) => a.id === draft.addressId);
  const services = useServices({ categoryId: appliance?.category.id });
  const service = services.data?.items.find((s) => s.id === draft.serviceId);

  // Changing an earlier choice clears the later ones that depended on it.
  const set = (patch: Partial<Draft>, clear: (keyof Draft)[] = []) =>
    setDraft((d) => ({ ...d, ...patch, ...Object.fromEntries(clear.map((k) => [k, k === "date" || k === "problem" ? "" : undefined])) }));

  const technicianName = draft.slot?.technicians?.find((t) => t.id === draft.technicianId)?.name;

  const canContinue = [
    Boolean(appliance),
    draft.problem.trim().length >= 3 && Boolean(service),
    Boolean(address),
    Boolean(draft.slot),
    true,
  ][step];
  const canConfirm = (!staff || Boolean(draft.source)) && (!needsOverride || draft.overrideReason.trim().length >= 3);

  function confirm() {
    if (!draft.slot || !draft.applianceId || !draft.serviceId || !draft.addressId) return;
    create.mutate(
      {
        applianceId: draft.applianceId,
        serviceId: draft.serviceId,
        addressId: draft.addressId,
        problemDescription: draft.problem.trim(),
        startAt: draft.slot.startAt,
        ...(staff && {
          customerId,
          source: draft.source,
          technicianId: draft.technicianId,
          overrideReason: needsOverride ? draft.overrideReason.trim() : undefined,
        }),
      },
      {
        onSuccess: (booking) => {
          toast.success(`Booked. Booking number ${booking.bookingNumber}`);
          router.push(staff ? `/staff/bookings/${booking.id}` : `/bookings/${booking.id}`);
        },
        onError: (err) => {
          const e = err as ApiError;
          if (e.code === "OVERRIDE_REASON_REQUIRED") {
            setNeedsOverride(e.message); // staff: show the reason field, keep everything else
            return;
          }
          toast.error(e.message);
          if (e.status === 409) {
            set({ slot: undefined, technicianId: undefined }); // that time is gone: pick again from the refreshed list
            setStep(3);
          }
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 className="text-xl font-semibold">{STEPS[step]}</h2>
        <div className="mt-2 flex gap-1" aria-hidden="true">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>

      {step === 0 &&
        (appliances.isPending ? (
          <ListSkeleton rows={2} />
        ) : appliances.isError ? (
          <ErrorState error={appliances.error} onRetry={() => appliances.refetch()} />
        ) : (
          <>
            {appliances.data.items.length === 0 && (
              <EmptyState title="No appliances yet" description="Add the appliance that needs repair. It is saved for next time." />
            )}
            <ChoiceList
              label="Appliance"
              items={appliances.data.items.map((a) => ({
                id: a.id,
                title: `${a.brand} ${a.category.name}`,
                subtitle: [a.model, a.purchaseYear && `bought ${a.purchaseYear}`].filter(Boolean).join(" · ") || undefined,
              }))}
              value={draft.applianceId}
              onChange={(id) => set({ applianceId: id }, ["serviceId", "slot", "date", "technicianId"])}
              addLabel="Add another appliance"
              onAdd={() => setAdding("appliance")}
            />
          </>
        ))}

      {step === 1 && (
        <div className="flex flex-col gap-6">
          <Field>
            <FieldLabel htmlFor="problem">What is wrong?</FieldLabel>
            <Textarea
              id="problem"
              rows={3}
              maxLength={1000}
              placeholder="e.g. Not cooling, makes a loud noise at night"
              value={draft.problem}
              onChange={(e) => set({ problem: e.target.value })}
            />
          </Field>
          {services.isPending ? (
            <ListSkeleton rows={2} />
          ) : services.isError ? (
            <ErrorState error={services.error} onRetry={() => services.refetch()} />
          ) : services.data.items.length === 0 ? (
            <EmptyState title="No repair service for this appliance yet" description="Add one on the Services page, or call to help with this booking." />
          ) : (
            <ChoiceList
              label="Service"
              items={services.data.items.map((s) => ({
                id: s.id,
                title: s.name,
                subtitle: `About ${formatDuration(s.durationMinutes)}`,
                aside: formatINR(s.basePrice),
              }))}
              value={draft.serviceId}
              onChange={(id) => set({ serviceId: id }, ["slot", "date", "technicianId"])}
            />
          )}
        </div>
      )}

      {step === 2 &&
        (addresses.isPending ? (
          <ListSkeleton rows={2} />
        ) : addresses.isError ? (
          <ErrorState error={addresses.error} onRetry={() => addresses.refetch()} />
        ) : (
          <>
            {addresses.data.items.length === 0 && <EmptyState title="No addresses yet" description="Add where the technician should come." />}
            <ChoiceList
              label="Address"
              items={addresses.data.items.map((a) => ({
                id: a.id,
                title: a.label,
                subtitle: [a.line1, a.area, a.city, a.pincode].filter(Boolean).join(", "),
              }))}
              value={draft.addressId}
              onChange={(id) => set({ addressId: id }, ["slot", "date", "technicianId"])}
              addLabel="Add another address"
              onAdd={() => setAdding("address")}
            />
          </>
        ))}

      {step === 3 && service && address && (
        <>
          <SlotPicker
            serviceId={service.id}
            area={address.area}
            date={draft.date}
            slot={draft.slot}
            onChange={(date, slot) => set({ date, slot, technicianId: undefined })}
          />
          {staff && draft.slot?.technicians && (
            <Field>
              <FieldLabel htmlFor="technician">Technician</FieldLabel>
              <Select
                items={[{ value: "auto", label: "Assign automatically" }, ...draft.slot.technicians.map((t) => ({ value: t.id, label: t.name }))]}
                value={draft.technicianId ?? "auto"}
                onValueChange={(v) => set({ technicianId: !v || v === "auto" ? undefined : v })}
              >
                <SelectTrigger id="technician" className="w-full sm:w-72">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Assign automatically</SelectItem>
                  {draft.slot.technicians.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Free at this time: {draft.slot.technicians.map((t) => t.name).join(", ")}. Choosing one assigns them now.
              </FieldDescription>
            </Field>
          )}
        </>
      )}

      {step === 4 && appliance && service && address && draft.slot && (
        <div className="flex flex-col gap-6">
          <ReviewStep
            appliance={appliance}
            service={service}
            address={address}
            problem={draft.problem.trim()}
            slot={draft.slot}
            extraRows={staff ? [["Technician", technicianName ?? "Assigned automatically"]] : []}
          />
          {staff && (
            <Field>
              <FieldLabel htmlFor="source">Where did this booking come from?</FieldLabel>
              <Select items={SOURCES} value={draft.source ?? null} onValueChange={(v) => set({ source: v ?? undefined })}>
                <SelectTrigger id="source" className="w-full sm:w-72">
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          {needsOverride && (
            <div className="flex flex-col gap-3">
              <FormAlert message={needsOverride} />
              <Field>
                <FieldLabel htmlFor="override">Reason for booking inside the cutoff</FieldLabel>
                <Textarea id="override" rows={2} maxLength={300} value={draft.overrideReason} onChange={(e) => set({ overrideReason: e.target.value })} />
                <FieldDescription>Saved in the audit log.</FieldDescription>
              </Field>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" size="lg" disabled={step === 0 || create.isPending} onClick={() => setStep(step - 1)}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" size="lg" disabled={!canContinue} onClick={() => setStep(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button type="button" size="lg" disabled={create.isPending || !canConfirm} aria-busy={create.isPending} onClick={confirm}>
            {create.isPending && <Spinner />}
            Confirm booking
          </Button>
        )}
      </div>

      <FormDialog open={adding !== null} onOpenChange={(o) => !o && setAdding(null)} title={adding === "appliance" ? "Add appliance" : "Add address"}>
        {adding === "appliance" && <ApplianceForm customerId={customerId} onDone={() => setAdding(null)} />}
        {adding === "address" && <AddressForm customerId={customerId} onDone={() => setAdding(null)} />}
      </FormDialog>
    </div>
  );
}
