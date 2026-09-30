"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Option = { value: string; label: string };

type Props<T extends FieldValues> = {
  control: Control<T, unknown, FieldValues>;
  name: Path<T>;
  label: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
};

export function SelectField<T extends FieldValues>({ control, name, label, options, placeholder, disabled }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          {/* `items` lets the trigger show the label (not the id) of the chosen option */}
          <Select
            items={options}
            value={field.value || null}
            onValueChange={(v) => field.onChange(v ?? "")}
            disabled={disabled}
          >
            <SelectTrigger id={name} className="w-full" aria-invalid={fieldState.invalid} onBlur={field.onBlur}>
              <SelectValue placeholder={placeholder ?? "Choose…"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
