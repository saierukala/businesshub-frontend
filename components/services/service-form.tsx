"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { TextareaField } from "@/components/form/textarea-field";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { showApiError } from "@/lib/form";
import { useCategories, useSaveService } from "@/lib/queries/catalog";
import { serviceSchema, type ServiceInput, type ServiceOutput } from "@/lib/schemas/service";
import type { Service } from "@/lib/types";

export function ServiceForm({ service, onDone }: { service?: Service; onDone: () => void }) {
  const save = useSaveService();
  const categories = useCategories();
  const form = useForm<ServiceInput, unknown, ServiceOutput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      categoryId: service?.category.id ?? "",
      name: service?.name ?? "",
      description: service?.description ?? "",
      durationMinutes: String(service?.durationMinutes ?? 60),
      basePrice: service ? service.basePrice.replace(/\.00$/, "") : "",
      active: service?.active ?? true,
    },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit((values) =>
    save.mutateAsync({ ...values, id: service?.id }).then(
      () => {
        toast.success(service ? "Service updated" : "Service created");
        onDone();
      },
      (err) => showApiError(form, err),
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={form.formState.errors.root?.server?.message} />
        <SelectField
          control={form.control}
          name="categoryId"
          label="Category"
          options={categories.data?.items.map((c) => ({ value: c.id, label: c.name })) ?? []}
          disabled={categories.isPending}
        />
        <TextField control={form.control} name="name" label="Service name" placeholder="Washing Machine Repair" />
        <TextareaField control={form.control} name="description" label="Description (optional)" rows={2} />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            control={form.control}
            name="durationMinutes"
            label="Duration (minutes)"
            inputMode="numeric"
            description="Steps of 15"
          />
          <Controller
            control={form.control}
            name="basePrice"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="basePrice">Base price</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>₹</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput {...field} id="basePrice" inputMode="decimal" placeholder="499" aria-invalid={fieldState.invalid} />
                </InputGroup>
                <FieldDescription className={fieldState.error ? "text-destructive" : undefined}>
                  {fieldState.error?.message ?? "Visit charge"}
                </FieldDescription>
              </Field>
            )}
          />
        </div>
        <Controller
          control={form.control}
          name="active"
          render={({ field }) => (
            <Field orientation="horizontal">
              <Switch id="active" checked={field.value} onCheckedChange={field.onChange} />
              <FieldLabel htmlFor="active">Customers can book this service</FieldLabel>
            </Field>
          )}
        />
        <SubmitButton pending={save.isPending}>{service ? "Save service" : "Create service"}</SubmitButton>
      </FieldGroup>
    </form>
  );
}
