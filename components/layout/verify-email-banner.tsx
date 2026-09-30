"use client";

import { MailWarning } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useResendVerification } from "@/lib/queries/auth";

export function VerifyEmailBanner({ email }: { email: string }) {
  const resend = useResendVerification();
  return (
    <Alert>
      <MailWarning />
      <AlertDescription>Please verify your email ({email}) using the link we sent you.</AlertDescription>
      <AlertAction>
        <Button
          size="sm"
          variant="outline"
          disabled={resend.isPending || resend.isSuccess}
          onClick={() =>
            resend.mutate(undefined, {
              onSuccess: () => toast.success("Verification email sent."),
              onError: (err) => toast.error(err.message),
            })
          }
        >
          {resend.isPending && <Spinner />}
          {resend.isSuccess ? "Sent" : "Resend email"}
        </Button>
      </AlertAction>
    </Alert>
  );
}
