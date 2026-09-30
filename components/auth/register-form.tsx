"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/form/text-field";
import { PasswordField } from "@/components/form/password-field";
import { PhoneField } from "@/components/form/phone-field";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useRegister } from "@/lib/queries/auth";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";
import { showApiError } from "@/lib/form";
import { homeFor } from "@/lib/auth";

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit((values) =>
    register.mutateAsync(values).then(
      ({ user }) => {
        toast.success("Account created. Check your email to verify your address.");
        router.replace(homeFor(user.role));
        router.refresh();
      },
      (err) => showApiError(form, err),
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={form.formState.errors.root?.server?.message} />
        <TextField control={form.control} name="name" label="Full name" autoComplete="name" placeholder="Ravi Kumar" />
        <TextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <PhoneField
          control={form.control}
          name="phone"
          label="Mobile number (optional)"
          description="So the technician can call you before a visit."
        />
        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          autoComplete="new-password"
          description="At least 8 characters."
        />
        <SubmitButton pending={register.isPending || register.isSuccess}>Create account</SubmitButton>
      </FieldGroup>
    </form>
  );
}
