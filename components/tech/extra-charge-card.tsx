"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormDialog } from "@/components/common/form-dialog";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { TextField } from "@/components/form/text-field";
import { TextareaField } from "@/components/form/textarea-field";
import { showApiError } from "@/lib/form";
import { useProposeExtraCharge } from "@/lib/queries/visits";
import { extraChargeSchema, type ExtraChargeInput } from "@/lib/schemas/visit";
import { formatINR } from "@/lib/format";
import type { BookingDetail } from "@/lib/types";

function ProposeForm({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
  const propose = useProposeExtraCharge(bookingId);
  const form = useForm<ExtraChargeInput>({ resolver: zodResolver(extraChargeSchema), defaultValues: { amount: "", reason: "" }, mode: "onTouched" });
  const onSubmit = form.handleSubmit((v) =>
    propose.mutateAsync({ amount: Number(v.amount), reason: v.reason.trim() }).then(
      () => {
        toast.success("Sent to the customer for approval");
        onDone();
      },
      (err) => showApiError(form, err),
    ),
  );
  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={form.formState.errors.root?.server?.message} />
        <TextField control={form.control} name="amount" label="Extra amount (₹)" inputMode="decimal" placeholder="250" />
        <TextareaField control={form.control} name="reason" label="What is the extra work?" rows={3} placeholder="e.g. Gas refill and leak sealing" />
        <SubmitButton pending={propose.isPending}>Ask the customer to approve</SubmitButton>
      </FieldGroup>
    </form>
  );
}

// The technician's side of the extra charge: ask, wait for the answer, see the result.
// The answer arrives on its own (the page refreshes every few seconds while the work is in progress).
export function ExtraChargeCard({ booking }: { booking: BookingDetail }) {
  const [open, setOpen] = useState(false);
  const extra = booking.visit?.extraCharge;
  if (!extra || booking.status !== "IN_PROGRESS") return null;

  const amount = extra.amount ? formatINR(extra.amount) : "";

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Extra work</h2>

      {extra.status === "PROPOSED" && (
        <Alert>
          <Clock />
          <AlertTitle>Waiting for the customer to approve {amount}</AlertTitle>
          <AlertDescription>{extra.reason}. Do not start the extra work until it is approved. You can finish the visit after they answer.</AlertDescription>
        </Alert>
      )}
      {extra.status === "APPROVED" && (
        <Alert>
          <CircleCheck />
          <AlertTitle>{amount} approved</AlertTitle>
          <AlertDescription>
            {extra.reason}. Total to collect: <span className="font-semibold">{formatINR(booking.visit!.finalAmount)}</span>.
          </AlertDescription>
        </Alert>
      )}
      {extra.status === "DECLINED" && (
        <Alert variant="destructive">
          <AlertTitle>The customer declined {amount}</AlertTitle>
          <AlertDescription>Do only the base service. You can offer a different amount if needed.</AlertDescription>
        </Alert>
      )}

      {(extra.status === "NONE" || extra.status === "DECLINED") && (
        <Button variant="outline" size="lg" className="h-12 w-full sm:w-fit" onClick={() => setOpen(true)}>
          <Plus /> {extra.status === "DECLINED" ? "Offer a different amount" : "Extra work needed"}
        </Button>
      )}

      <FormDialog open={open} onOpenChange={setOpen} title="Ask for an extra charge" description="The customer approves or declines in the app. Nothing beyond the base service happens until they approve.">
        {open && <ProposeForm bookingId={booking.id} onDone={() => setOpen(false)} />}
      </FormDialog>
    </section>
  );
}
