import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { MissingToken, tokenFrom } from "@/components/auth/missing-token";

export const metadata = { title: "Set up your account" };

export default async function AcceptInvitePage({ searchParams }: PageProps<"/accept-invite">) {
  const token = tokenFrom(await searchParams);
  return (
    <AuthCard
      title="Set up your HomeFix account"
      description="Choose a password to see your bookings and service history online."
    >
      {token ? (
        <SetPasswordForm token={token} kind="invite" />
      ) : (
        <MissingToken hint={<Link href="/forgot-password" className="underline">use Forgot password</Link>} />
      )}
    </AuthCard>
  );
}
