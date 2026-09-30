"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/common/form-dialog";
import { FormAlert } from "@/components/form/form-alert";
import { SlotPicker } from "./slot-picker";
import { useCreateFollowUp } from "@/lib/queries/visits";
import { ApiError } from "@/lib/api";
import type { Booking, SlotOption } from "@/lib/types";

type Props = { booking: Booking; open: boolean; onOpenChange: (o: boolean) => void; staff?: boolean };

// A second visit for the same repair: same customer, appliance, address and service, linked to this booking.
// The manager can also pick the technician; a technician just picks the time.
export function FollowUpDialog({ booking, open, onOpenChange, staff = false }: Props) {
  const router = useRouter();
  const create = useCreateFollowUp(booking.id);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<SlotOption>();
  const [technicianId, setTechnicianId] = useState<string>();
  const [note, setNote] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const needsOverride = error?.code === "OVERRIDE_REASON_REQUIRED";

  function submit() {
    if (!slot) return;
    setError(null);
    create.mutate(
      {
        startAt: slot.startAt,
        problemDescription: note.trim() || undefined,
        ...(staff && { technicianId, overrideReason: needsOverride ? overrideReason.trim() : undefined }),
      },
      {
        onSuccess: (next) => {
          toast.success(`Follow-up booked: ${next.bookingNumber}`);
          onOpenChange(false);
          if (staff) router.push(`/staff/bookings/${next.id}`);
        },
        onError: (err) => {
          setError(err as ApiError);
          if ((err as ApiError).status === 409) setSlot(undefined); // that time is gone: choose again
        },
      },
    );
  }

  const techs = slot?.technicians ?? [];

  return (
    <FormDialog open={open} onOpenChange={(o) => !create.isPending && onOpenChange(o)} title="Book a follow-up visit" description={`Continues ${booking.bookingNumber}: ${booking.service.name} for ${booking.customer.name}.`}>
      <div className="flex flex-col gap-4">
        <FormAlert message={error?.message} />
        <SlotPicker
          serviceId={booking.service.id}
          area={booking.address.area}
          date={date}
          slot={slot}
          onChange={(d, s) => {
            setDate(d);
            setSlot(s);
            setTechnicianId(undefined);
          }}
        />
        {staff && techs.length > 0 && (
          <Field>
            <FieldLabel htmlFor="fu-tech">Technician</FieldLabel>
            <Select
              items={[{ value: "auto", label: "Assign automatically" }, ...techs.map((t) => ({ value: t.id, label: t.name }))]}
              value={technicianId ?? "auto"}
              onValueChange={(v) => setTechnicianId(!v || v === "auto" ? undefined : v)}
            >
              <SelectTrigger id="fu-tech" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Assign automatically</SelectItem>
                {techs.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="fu-note">What is the follow-up for? (optional)</FieldLabel>
          <Textarea id="fu-note" rows={2} maxLength={1000} placeholder="e.g. Fit the new relay once it arrives" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        {needsOverride && (
          <Field>
            <FieldLabel htmlFor="fu-override">Reason for booking inside the cutoff</FieldLabel>
            <Textarea id="fu-override" rows={2} maxLength={300} value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} />
            <FieldDescription>Saved in the audit log.</FieldDescription>
          </Field>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={create.isPending} onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled={!slot || create.isPending || (needsOverride && overrideReason.trim().length < 3)} aria-busy={create.isPending} onClick={submit}>
            {create.isPending && <Spinner />}
            Book follow-up
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
