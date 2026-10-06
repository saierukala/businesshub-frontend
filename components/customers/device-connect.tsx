"use client";

import { useState } from "react";
import { Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FormDialog } from "@/components/common/form-dialog";
import { useCreateAppCode, type AppCode } from "@/lib/queries/customers";
import { formatTime } from "@/lib/format";
import type { Customer } from "@/lib/types";

const WHAT = {
  ACCOUNT_INVITE: 'In the HomeFix app they tap "I have a code", then enter their email, this code and a new password.',
  EMAIL_VERIFY: 'They log in to the HomeFix app, open My account and enter this code under "Verify your email".',
};

// "Device connect": the office helps a customer set up the mobile app over the phone.
// The API only allows it for customers, only for an invite or an email-verification code, and logs who asked.
// The code is shown once here and never stored in the page or the audit log.
export function DeviceConnect({ customer: c }: { customer: Customer }) {
  const create = useCreateAppCode();
  const [shown, setShown] = useState<AppCode | null>(null);
  if (!c.email || !c.active || (c.hasAccount && c.emailVerified)) return null;

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Button
          variant="outline"
          size="sm"
          disabled={create.isPending}
          onClick={() => create.mutate(c.id, { onSuccess: setShown, onError: (err) => toast.error(err.message) })}
        >
          {create.isPending ? <Spinner /> : <Smartphone />}
          Create app code
        </Button>
      </div>
      <p className="text-muted-foreground">
        For a customer on the phone: a one-time code to {c.hasAccount ? "verify their email" : "set up their account"} in the mobile app.
      </p>

      <FormDialog open={shown !== null} onOpenChange={(o) => !o && setShown(null)} title="App code" description="Read it to the customer. It is shown only once.">
        {shown && (
          <div className="flex flex-col gap-4">
            <Alert>
              <AlertDescription>Make sure you are talking to {c.name} before you read it out.</AlertDescription>
            </Alert>
            <div className="rounded-lg border bg-muted/40 p-4 text-center">
              <div className="font-mono text-4xl font-semibold tracking-[0.3em]" aria-label={`Code ${shown.code.split("").join(" ")}`}>
                {shown.code}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">Valid until {formatTime(shown.expiresAt)} (15 minutes), once.</div>
            </div>
            <p className="text-sm">
              {WHAT[shown.type]} Email to use: <span className="font-medium">{shown.email}</span>.
            </p>
            <Button onClick={() => setShown(null)}>Done</Button>
          </div>
        )}
      </FormDialog>
    </div>
  );
}
