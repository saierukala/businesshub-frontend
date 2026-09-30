"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { TextareaField } from "@/components/form/textarea-field";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { showApiError } from "@/lib/form";
import { useAddTimeOff } from "@/lib/queries/technicians";
import { timeOffSchema, toTimeOffBody, type TimeOffInput } from "@/lib/schemas/time-off";

const REASONS = [
  { value: "SICK", label: "Sick" },
  { value: "LEAVE", label: "Leave" },
  { value: "OTHER", label: "Other" },
];

export function TimeOffForm({ technicianId, onDone }: { technicianId: string; onDone: () => void }) {
  const add = useAddTimeOff(technicianId);
  const form = useForm<TimeOffInput>({
    resolver: zodResolver(timeOffSchema),
    defaultValues: { startDate: "", endDate: "", reason: "LEAVE", note: "" },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit((values) =>
    add.mutateAsync(toTimeOffBody(values)).then(
      (row) => {
        toast.success("Time off added");
        // The API keeps those bookings and flags them; the manager has to reassign or reschedule them.
        if (row.bookingsNeedingReassignment > 0) {
          const n = row.bookingsNeedingReassignment;
          toast.warning(`${n} booking${n === 1 ? "" : "s"} in this period now need${n === 1 ? "s" : ""} reassignment`, { duration: 10000 });
        }
        onDone();
      },
      (err) => showApiError(form, err),
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={form.formState.errors.root?.server?.message} />
        <div className="grid grid-cols-2 gap-4">
          <TextField control={form.control} name="startDate" label="First day off" type="date" />
          <TextField control={form.control} name="endDate" label="Last day off" type="date" />
        </div>
        <SelectField control={form.control} name="reason" label="Reason" options={REASONS} />
        <TextareaField control={form.control} name="note" label="Note (optional)" rows={2} maxLength={300} />
        <SubmitButton pending={add.isPending}>Add time off</SubmitButton>
      </FieldGroup>
    </form>
  );
}
