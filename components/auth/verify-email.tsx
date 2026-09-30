"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useVerifyEmail } from "@/lib/queries/auth";

export function VerifyEmail({ token }: { token: string }) {
  const verify = useVerifyEmail();
  const started = useRef(false);

  // The link is single-use. React dev mode runs effects twice, which would send the token
  // twice and show "expired" on the second call, so the ref makes sure it runs once.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    verify.mutate(token);
  }, [token, verify]);

  if (verify.isError) {
    return (
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>Couldn&apos;t verify your email</AlertTitle>
        <AlertDescription>
          {verify.error.message} Log in and use &quot;Resend email&quot; to get a new link.
        </AlertDescription>
      </Alert>
    );
  }

  if (verify.isSuccess) {
    return (
      <div className="flex flex-col gap-4">
        <Alert>
          <CircleCheck />
          <AlertTitle>Email verified</AlertTitle>
          <AlertDescription>Thanks! Your email address is confirmed.</AlertDescription>
        </Alert>
        <Button render={<Link href="/" />} nativeButton={false}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
      <Spinner /> Verifying your email…
    </div>
  );
}
