"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/form/text-field";
import { PhoneField } from "@/components/form/phone-field";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { ApiError } from "@/lib/api";
import { showApiError } from "@/lib/form";
import { formatPhone } from "@/lib/format";
import { useSaveCustomer } from "@/lib/queries/customers";
import { customerSchema, type CustomerInput, type CustomerOutput } from "@/lib/schemas/customer";
import type { Customer, PhoneMatch } from "@/lib/types";

type Props = { customer?: Customer; onSaved: (c: Customer) => void };

// Create or edit a customer. On a duplicate phone the API answers 409 with the matching
// customers: we show them, and staff either open the existing one or confirm "create anyway".
export function CustomerForm({ customer, onSaved }: Props) {
  const save = useSaveCustomer();
  const [duplicate, setDuplicate] = useState<{ phone: string; matches: PhoneMatch[] } | null>(null);
  const form = useForm<CustomerInput, unknown, CustomerOutput>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: customer?.name ?? "", phone: customer?.phone ?? "", email: customer?.email ?? "" },
    mode: "onTouched",
  });

  // The warning is about one specific number: once the phone field changes it disappears,
  // so "Save anyway" can't confirm a number staff never saw the warning for.
  const phone = useWatch({ control: form.control, name: "phone" });
  const matches = duplicate?.phone === phone ? duplicate.matches : null;

  async function submit(values: CustomerOutput, allowDuplicatePhone = false) {
    try {
      const saved = await save.mutateAsync({ ...values, id: customer?.id, allowDuplicatePhone });
      toast.success(customer ? "Customer updated" : "Customer created");
      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError && err.code === "DUPLICATE_PHONE") {
        setDuplicate({ phone: values.phone, matches: err.details as PhoneMatch[] });
      } else showApiError(form, err);
    }
  }

  return (
    <form onSubmit={form.handleSubmit((v) => submit(v))} noValidate>
      <FieldGroup>
        <FormAlert message={form.formState.errors.root?.server?.message} />
        <TextField control={form.control} name="name" label="Full name" autoComplete="off" placeholder="Priya Nair" />
        <PhoneField control={form.control} name="phone" label="Mobile number" />
        <TextField
          control={form.control}
          name="email"
          label="Email (optional)"
          type="email"
          autoComplete="off"
          placeholder="priya@example.com"
          description="Needed only if they want to see bookings online."
        />

        {matches ? (
          <Alert>
            <TriangleAlert />
            <AlertTitle>This phone number is already used</AlertTitle>
            <AlertDescription>
              <ul className="my-1 flex flex-col gap-1">
                {matches.map((m) => (
                  <li key={m.id}>
                    <Link href={`/staff/customers/${m.id}`} className="font-medium underline underline-offset-4">
                      {m.name}
                    </Link>{" "}
                    · {formatPhone(m.phone)}
                    {m.email ? ` · ${m.email}` : ""}
                  </li>
                ))}
              </ul>
              Is this the same person? Open their record instead. Different person (e.g. family member)? Save anyway.
            </AlertDescription>
            <div className="col-span-full mt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={save.isPending}
                onClick={form.handleSubmit((v) => submit(v, true))}
              >
                Save anyway
              </Button>
              <Button type="button" variant="ghost" onClick={() => setDuplicate(null)}>
                Change number
              </Button>
            </div>
          </Alert>
        ) : (
          // Stays disabled after success while we navigate away, so a second click can't create a duplicate.
          <SubmitButton pending={save.isPending || save.isSuccess}>{customer ? "Save changes" : "Create customer"}</SubmitButton>
        )}
      </FieldGroup>
    </form>
  );
}
