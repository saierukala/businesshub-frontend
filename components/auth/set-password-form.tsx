"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FieldGroup } from "@/components/ui/field";
import { PasswordField } from "@/components/form/password-field";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useSetPassword } from "@/lib/queries/auth";
import { setPasswordSchema, type SetPasswordInput } from "@/lib/schemas/auth";
import { showApiError } from "@/lib/form";

// Used by /reset-password and /accept-invite: same form, different endpoint.
export function SetPasswordForm({ token, kind }: { token: string; kind: "reset" | "invite" }) {
  const router = useRouter();
  const setPassword = useSetPassword(kind);
  const form = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(({ password }) =>
    setPassword.mutateAsync({ token, password }).then(
      () => {
        toast.success(kind === "reset" ? "Password updated. Please log in." : "Account ready. Please log in.");
        router.replace("/login");
        router.refresh();
      },
      (err) => showApiError(form, err),
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={form.formState.errors.root?.server?.message} />
        <PasswordField
          control={form.control}
          name="password"
          label="New password"
          autoComplete="new-password"
          description="At least 8 characters."
        />
        <PasswordField control={form.control} name="confirmPassword" label="Confirm password" autoComplete="new-password" />
        <SubmitButton pending={setPassword.isPending || setPassword.isSuccess}>
          {kind === "reset" ? "Set new password" : "Create my account"}
        </SubmitButton>
      </FieldGroup>
    </form>
  );
}
