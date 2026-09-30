"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/common/form-dialog";
import { FormAlert } from "@/components/form/form-alert";
import { useCancelBooking } from "@/lib/queries/bookings";
import { ApiError } from "@/lib/api";
import type { Booking } from "@/lib/types";

type Props = { booking: Booking; open: boolean; onOpenChange: (o: boolean) => void };

export function CancelDialog({ booking, open, onOpenChange }: Props) {
  const cancel = useCancelBooking(booking.id);
  const [reason, setReason] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  // Staff inside the cancellation window: the API asks for a reason, then we show the field.
  const needsOverride = error?.code === "OVERRIDE_REASON_REQUIRED";

  function submit() {
    setError(null);
    cancel.mutate(
      { reason: reason.trim() || undefined, overrideReason: needsOverride ? overrideReason.trim() : undefined },
      {
        onSuccess: () => {
          toast.success("Booking cancelled");
          onOpenChange(false);
        },
        onError: (err) => setError(err as ApiError),
      },
    );
  }

  return (
    <FormDialog open={open} onOpenChange={(o) => !cancel.isPending && onOpenChange(o)} title="Cancel this booking?" description={`${booking.bookingNumber} will be cancelled and the time slot released.`}>
      <div className="flex flex-col gap-4">
        <FormAlert message={error?.message} />
        <Field>
          <FieldLabel htmlFor="cancel-reason">Reason (optional)</FieldLabel>
          <Textarea id="cancel-reason" rows={2} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        {needsOverride && (
          <Field>
            <FieldLabel htmlFor="cancel-override">Reason for cancelling late</FieldLabel>
            <Textarea id="cancel-override" rows={2} maxLength={300} value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} />
            <FieldDescription>Saved in the audit log.</FieldDescription>
          </Field>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={cancel.isPending} onClick={() => onOpenChange(false)}>
            Keep booking
          </Button>
          <Button variant="destructive" disabled={cancel.isPending || (needsOverride && overrideReason.trim().length < 3)} onClick={submit}>
            {cancel.isPending && <Spinner />}
            Cancel booking
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
