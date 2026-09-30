"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/form/text-field";
import { PhoneField } from "@/components/form/phone-field";
import { SelectField } from "@/components/form/select-field";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { showApiError } from "@/lib/form";
import { useCreateUser } from "@/lib/queries/users";
import { newUserSchema, type NewUserInput, type NewUserOutput } from "@/lib/schemas/user";

const ROLES = [
  { value: "TECHNICIAN", label: "Technician" },
  { value: "MANAGER", label: "Service Manager" },
];

// The owner never sets a password: the new person gets an invite email and chooses their own.
export function UserForm({ onDone }: { onDone: () => void }) {
  const create = useCreateUser();
  const form = useForm<NewUserInput, unknown, NewUserOutput>({
    resolver: zodResolver(newUserSchema),
    defaultValues: { name: "", email: "", phone: "", role: "TECHNICIAN" },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit((values) =>
    create.mutateAsync(values).then(
      (u) => {
        toast.success(`Invite sent to ${u.email}`);
        onDone();
      },
      (err) => showApiError(form, err),
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={form.formState.errors.root?.server?.message} />
        <SelectField control={form.control} name="role" label="Role" options={ROLES} />
        <TextField control={form.control} name="name" label="Full name" autoComplete="off" placeholder="Kiran Rao" />
        <TextField
          control={form.control}
          name="email"
          label="Work email"
          type="email"
          autoComplete="off"
          placeholder="kiran@homefix.in"
          description="They'll get a link here to set their password."
        />
        <PhoneField control={form.control} name="phone" label="Mobile number" />
        <SubmitButton pending={create.isPending}>Create and send invite</SubmitButton>
      </FieldGroup>
    </form>
  );
}
