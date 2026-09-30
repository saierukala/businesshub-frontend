import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmail } from "@/components/auth/verify-email";
import { MissingToken, tokenFrom } from "@/components/auth/missing-token";

export const metadata = { title: "Verify email" };

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  const token = tokenFrom(await searchParams);
  return (
    <AuthCard title="Verify your email">
      {token ? <VerifyEmail token={token} /> : <MissingToken hint="log in and resend the email" />}
    </AuthCard>
  );
}
