"use client";

import { useState } from "react";
import { Mail, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/common/query-states";
import { FormDialog } from "@/components/common/form-dialog";
import { CustomerForm } from "./customer-form";
import { DeviceConnect } from "./device-connect";
import { useCustomer, useInviteCustomer } from "@/lib/queries/customers";
import { formatDate, formatPhone } from "@/lib/format";

export function CustomerProfile({ id }: { id: string }) {
  const customer = useCustomer(id);
  const invite = useInviteCustomer();
  const [editing, setEditing] = useState(false);

  if (customer.isPending) return <Skeleton className="h-32 w-full" />;
  if (customer.isError) return <ErrorState error={customer.error} onRetry={() => customer.refetch()} />;
  const c = customer.data;

  // Invite only makes sense for a customer with an email and no password yet.
  const canInvite = c.email && !c.hasAccount && c.active;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
          {c.name}
          {!c.active && <Badge variant="secondary">Inactive</Badge>}
          {c.hasAccount ? <Badge variant="outline">Online account</Badge> : <Badge variant="secondary">Phone only</Badge>}
        </CardTitle>
        <CardDescription>Customer since {formatDate(c.createdAt)}</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil /> Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
          <dt className="text-muted-foreground">Phone</dt>
          <dd>
            <a href={`tel:+91${c.phone}`} className="hover:underline">
              {formatPhone(c.phone)}
            </a>
          </dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd>
            {c.email ?? "—"}
            {c.email && !c.emailVerified && <span className="text-muted-foreground"> (not verified)</span>}
          </dd>
        </dl>
        {canInvite && (
          <div>
            <Button
              variant="secondary"
              size="sm"
              disabled={invite.isPending}
              onClick={() =>
                invite.mutate(c.id, {
                  onSuccess: () => toast.success(`Invite sent to ${c.email}`),
                  onError: (err) => toast.error(err.message),
                })
              }
            >
              {invite.isPending ? <Spinner /> : <Mail />}
              Invite to online account
            </Button>
          </div>
        )}
        <DeviceConnect customer={c} />
      </CardContent>

      <FormDialog open={editing} onOpenChange={setEditing} title="Edit customer">
        <CustomerForm customer={c} onSaved={() => setEditing(false)} />
      </FormDialog>
    </Card>
  );
}
