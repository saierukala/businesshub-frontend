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
import { useCategories } from "@/lib/queries/catalog";
import { useSaveCustomerRecord } from "@/lib/queries/customer-records";
import { applianceSchema, type ApplianceInput, type ApplianceOutput } from "@/lib/schemas/appliance";
import type { Appliance } from "@/lib/types";

type Props = { customerId?: string; appliance?: Appliance; onDone: () => void };

export function ApplianceForm({ customerId, appliance, onDone }: Props) {
  const save = useSaveCustomerRecord("appliances", customerId);
  const categories = useCategories();
  const form = useForm<ApplianceInput, unknown, ApplianceOutput>({
    resolver: zodResolver(applianceSchema),
    defaultValues: {
      categoryId: appliance?.category.id ?? "",
      brand: appliance?.brand ?? "",
      model: appliance?.model ?? "",
      serialNumber: appliance?.serialNumber ?? "",
      purchaseYear: appliance?.purchaseYear ? String(appliance.purchaseYear) : "",
      description: appliance?.description ?? "",
    },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit((values) =>
    save.mutateAsync({ ...values, id: appliance?.id }).then(
      () => {
        toast.success(appliance ? "Appliance updated" : "Appliance added");
        onDone();
      },
      (err) => showApiError(form, err),
    ),
  );

  const options = categories.data?.items.map((c) => ({ value: c.id, label: c.name })) ?? [];

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={form.formState.errors.root?.server?.message ?? categories.error?.message} />
        <SelectField
          control={form.control}
          name="categoryId"
          label="Appliance type"
          options={options}
          placeholder={categories.isPending ? "Loading…" : "Choose type"}
          disabled={categories.isPending}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField control={form.control} name="brand" label="Brand" placeholder="LG" />
          <TextField control={form.control} name="model" label="Model (optional)" placeholder="FHM1207" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField control={form.control} name="serialNumber" label="Serial no. (optional)" />
          <TextField
            control={form.control}
            name="purchaseYear"
            label="Year bought (optional)"
            inputMode="numeric"
            maxLength={4}
            placeholder="2021"
          />
        </div>
        <TextareaField
          control={form.control}
          name="description"
          label="Notes (optional)"
          placeholder="e.g. Front-load, 7 kg, kept on the balcony"
          rows={2}
        />
        <SubmitButton pending={save.isPending}>{appliance ? "Save appliance" : "Add appliance"}</SubmitButton>
      </FieldGroup>
    </form>
  );
}
