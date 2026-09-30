"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

type Props<T extends FieldValues> = {
  control: Control<T, unknown, FieldValues>;
  name: Path<T>;
  label: string;
} & Omit<React.ComponentProps<typeof Textarea>, "name">;

export function TextareaField<T extends FieldValues>({ control, name, label, ...textarea }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Textarea {...textarea} {...field} id={name} aria-invalid={fieldState.invalid} />
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
