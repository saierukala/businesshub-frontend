import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { MissingToken, tokenFrom } from "@/components/auth/missing-token";

export const metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const token = tokenFrom(await searchParams);
  return (
    <AuthCard title="Set a new password" description="You'll be logged out of other devices.">
      {token ? (
        <SetPasswordForm token={token} kind="reset" />
      ) : (
        <MissingToken hint={<Link href="/forgot-password" className="underline">request a new one</Link>} />
      )}
    </AuthCard>
  );
}
