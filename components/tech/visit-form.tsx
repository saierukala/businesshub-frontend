"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { FormAlert } from "@/components/form/form-alert";
import { TextareaField } from "@/components/form/textarea-field";
import { showApiError } from "@/lib/form";
import { useCompleteVisit, useSaveVisit } from "@/lib/queries/visits";
import { visitSchema, type VisitInput } from "@/lib/schemas/visit";
import type { BookingDetail } from "@/lib/types";

// What the technician found and did. "Save notes" keeps a draft; "Complete visit" needs the diagnosis and the
// work done, and finishes the booking. The Complete button sits in a bar fixed to the bottom of the screen
// so it is always under the thumb.
export function VisitForm({ booking }: { booking: BookingDetail }) {
  const save = useSaveVisit(booking.id);
  const complete = useCompleteVisit(booking.id);
  const visit = booking.visit;
  const waiting = visit?.extraCharge.status === "PROPOSED"; // the customer has not answered yet

  const form = useForm<VisitInput>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      diagnosis: visit?.diagnosis ?? "",
      workPerformed: visit?.workPerformed ?? "",
      partsNote: visit?.partsNote ?? "",
      notes: visit?.notes ?? "",
      result: visit?.result ?? "",
    },
    mode: "onTouched",
  });

  function saveDraft() {
    const v = form.getValues();
    save.mutate(
      { diagnosis: v.diagnosis.trim(), workPerformed: v.workPerformed.trim(), partsNote: v.partsNote.trim(), notes: v.notes.trim(), result: v.result.trim() },
      { onSuccess: () => toast.success("Notes saved"), onError: (err) => toast.error(err.message) },
    );
  }

  const onComplete = form.handleSubmit((v) =>
    complete.mutateAsync({ ...v, diagnosis: v.diagnosis.trim(), workPerformed: v.workPerformed.trim() }).then(
      () => toast.success("Visit completed"),
      (err) => showApiError(form, err),
    ),
  );

  return (
    <>
      <form id="visit-form" onSubmit={onComplete} noValidate>
        <FieldGroup>
          <FormAlert message={form.formState.errors.root?.server?.message} />
          <TextareaField control={form.control} name="diagnosis" label="What did you find?" rows={3} placeholder="e.g. Faulty start relay, compressor is fine" />
          <TextareaField control={form.control} name="workPerformed" label="What did you do?" rows={3} placeholder="e.g. Replaced the relay and tested for 20 minutes" />
          <TextareaField control={form.control} name="partsNote" label="Parts used (optional)" rows={2} placeholder="e.g. Start relay 250V" />
          <TextareaField control={form.control} name="result" label="Result (optional)" rows={2} placeholder="e.g. Cooling normally" />
          <TextareaField control={form.control} name="notes" label="Other notes (optional)" rows={2} />
          <Button type="button" variant="outline" size="lg" className="h-12 w-full sm:w-fit" disabled={save.isPending} onClick={saveDraft}>
            {save.isPending && <Spinner />}
            Save notes
          </Button>
        </FieldGroup>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-1">
          {waiting && <p className="text-center text-sm text-muted-foreground">Waiting for the customer to answer the extra charge.</p>}
          <Button type="submit" form="visit-form" size="lg" className="h-12 w-full text-base" disabled={complete.isPending || waiting} aria-busy={complete.isPending}>
            {complete.isPending && <Spinner />}
            Complete visit
          </Button>
        </div>
      </div>
    </>
  );
}
