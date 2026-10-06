"use client";

import { useForm, useWatch } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/form/text-field";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { AREA_LIST_ID, AreaHint, AreaOptions } from "@/components/common/area-hint";
import { showApiError } from "@/lib/form";
import { useAreas } from "@/lib/queries/areas";
import { useSaveCustomerRecord } from "@/lib/queries/customer-records";
import { addressSchema, type AddressInput } from "@/lib/schemas/address";
import type { Address } from "@/lib/types";

type Props = { customerId?: string; address?: Address; onDone: () => void };

export function AddressForm({ customerId, address, onDone }: Props) {
  const save = useSaveCustomerRecord("addresses", customerId);
  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address?.label ?? "Home",
      line1: address?.line1 ?? "",
      area: address?.area ?? "",
      city: address?.city ?? "Hyderabad",
      pincode: address?.pincode ?? "",
    },
    mode: "onTouched",
  });
  const queryClient = useQueryClient();
  const knownAreas = useAreas().data?.items;
  const area = useWatch({ control: form.control, name: "area" });

  const onSubmit = form.handleSubmit((values) =>
    save.mutateAsync({ ...values, id: address?.id }).then(
      () => {
        toast.success(address ? "Address updated" : "Address added");
        queryClient.invalidateQueries({ queryKey: ["areas"] });
        onDone();
      },
      (err) => showApiError(form, err),
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={form.formState.errors.root?.server?.message} />
        <TextField control={form.control} name="label" label="Label" placeholder="Home, Office, Mom's place" />
        <TextField
          control={form.control}
          name="line1"
          label="House / flat and street"
          autoComplete="street-address"
          placeholder="Flat 302, Sunrise Apartments, Road No. 5"
          description={address ? "For a new home, add a new address instead: past visits keep this one." : undefined}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField control={form.control} name="area" label="Area" placeholder="Kondapur" list={AREA_LIST_ID} autoComplete="off" />
          <TextField control={form.control} name="city" label="City" autoComplete="address-level2" />
        </div>
        {knownAreas && <AreaOptions areas={knownAreas} />}
        {/* No customerId: the customer is editing their own address. */}
        <AreaHint value={area} areas={knownAreas} forCustomer={!customerId} />
        <TextField
          control={form.control}
          name="pincode"
          label="PIN code (optional)"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="500084"
        />
        <SubmitButton pending={save.isPending}>{address ? "Save address" : "Add address"}</SubmitButton>
      </FieldGroup>
    </form>
  );
}
