"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/form/text-field";
import { PasswordField } from "@/components/form/password-field";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useLogin } from "@/lib/queries/auth";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { showApiError } from "@/lib/form";
import { homeFor, safeNext } from "@/lib/auth";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const login = useLogin();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit((values) =>
    login.mutateAsync(values).then(
      ({ user }) => {
        router.replace(safeNext(next) ?? homeFor(user.role));
        router.refresh(); // re-run server layouts with the new session cookie
      },
      (err) => showApiError(form, err),
    ),
  );

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
        <PasswordField control={form.control} name="password" label="Password" autoComplete="current-password" />
        <div className="-mt-3 text-right text-sm">
          <Link href="/forgot-password" className="text-muted-foreground underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>
        <SubmitButton pending={login.isPending || login.isSuccess}>Log in</SubmitButton>
      </FieldGroup>
    </form>
  );
}
