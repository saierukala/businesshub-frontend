"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/common/form-dialog";
import { FormAlert } from "@/components/form/form-alert";
import { SlotPicker } from "./slot-picker";
import { useRescheduleBooking } from "@/lib/queries/bookings";
import { ApiError } from "@/lib/api";
import { formatSlot } from "@/lib/format";
import type { Booking, SlotOption } from "@/lib/types";

type Props = { booking: Booking; open: boolean; onOpenChange: (o: boolean) => void };

export function RescheduleDialog({ booking, open, onOpenChange }: Props) {
  const reschedule = useRescheduleBooking(booking.id);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<SlotOption>();
  const [overrideReason, setOverrideReason] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  // Staff inside the window / past the limit: the API asks for a reason, then we show the field.
  const needsOverride = error?.code === "OVERRIDE_REASON_REQUIRED";

  function submit() {
    if (!slot) return;
    setError(null);
    reschedule.mutate(
      { startAt: slot.startAt, overrideReason: needsOverride ? overrideReason.trim() : undefined },
      {
        onSuccess: () => {
          toast.success("Booking rescheduled");
          onOpenChange(false);
        },
        onError: (err) => {
          setError(err as ApiError);
          if ((err as ApiError).status === 409) setSlot(undefined); // that time was taken: choose again
        },
      },
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => !reschedule.isPending && onOpenChange(o)}
      title="Reschedule"
      description={`${booking.bookingNumber} is now ${formatSlot(booking.startAt, booking.endAt)}.`}
    >
      <div className="flex flex-col gap-4">
        <FormAlert message={error?.message} />
        <SlotPicker serviceId={booking.service.id} area={booking.address.area} date={date} slot={slot} onChange={(d, s) => { setDate(d); setSlot(s); }} />
        {needsOverride && (
          <Field>
            <FieldLabel htmlFor="resched-override">Reason for the exception</FieldLabel>
            <Textarea id="resched-override" rows={2} maxLength={300} value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} />
            <FieldDescription>Saved in the audit log.</FieldDescription>
          </Field>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={reschedule.isPending} onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled={!slot || reschedule.isPending || (needsOverride && overrideReason.trim().length < 3)} onClick={submit}>
            {reschedule.isPending && <Spinner />}
            Move booking
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
