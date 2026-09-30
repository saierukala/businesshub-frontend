"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
};

// Indian mobile number: fixed +91 prefix, user types the 10 digits.
export function PhoneField<T extends FieldValues>({ control, name, label, description }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>+91</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              {...field}
              // Keep digits only, so pasting "98765 43210" still works.
              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
              id={name}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              aria-invalid={fieldState.invalid}
            />
          </InputGroup>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
