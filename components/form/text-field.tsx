"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props<T extends FieldValues> = {
  control: Control<T, unknown, FieldValues>;
  name: Path<T>;
  label: string;
  description?: string;
} & Omit<React.ComponentProps<typeof Input>, "name">;

// Label + input + error, wired to React Hook Form (shadcn Field pattern).
export function TextField<T extends FieldValues>({ control, name, label, description, ...input }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input {...input} {...field} id={name} aria-invalid={fieldState.invalid} />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
