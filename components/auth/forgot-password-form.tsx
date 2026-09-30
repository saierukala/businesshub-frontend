"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/form/text-field";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useForgotPassword } from "@/lib/queries/auth";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/schemas/auth";
import { showApiError } from "@/lib/form";

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit((values) =>
    forgot.mutateAsync(values).catch((err) => showApiError(form, err)),
  );

  // Same message whether or not the email exists (the backend never tells us).
  if (forgot.isSuccess) {
    return (
      <Alert>
        <MailCheck />
        <AlertTitle>Check your email</AlertTitle>
        <AlertDescription>
          If an account exists for {forgot.variables?.email}, we sent a link to set a new password. It expires in 1
          hour.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={form.formState.errors.root?.server?.message} />
        <TextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <SubmitButton pending={forgot.isPending}>Send reset link</SubmitButton>
      </FieldGroup>
    </form>
  );
}
