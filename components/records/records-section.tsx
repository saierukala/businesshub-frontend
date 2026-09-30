"use client";

import { useState } from "react";
import { EllipsisVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { FormDialog } from "@/components/common/form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useCustomerRecords, useDeleteCustomerRecord } from "@/lib/queries/customer-records";
import type { Address, Appliance } from "@/lib/types";

type Kind = "addresses" | "appliances";
type Item<K extends Kind> = K extends "addresses" ? Address : Appliance;

type Props<K extends Kind> = {
  kind: K;
  customerId?: string; // undefined = the logged-in customer
  title: string;
  noun: string; // "address" / "appliance"
  emptyTitle: string;
  emptyDescription: string;
  describe: (item: Item<K>) => { title: string; subtitle: string };
  renderForm: (item: Item<K> | undefined, onDone: () => void) => React.ReactNode;
};

// List + add + edit + delete for a customer's addresses or appliances.
// Used on the customer's own account page and on the staff customer page.
export function RecordsSection<K extends Kind>(props: Props<K>) {
  const { kind, customerId, title, noun, emptyTitle, emptyDescription, describe, renderForm } = props;
  const records = useCustomerRecords(kind, customerId);
  const remove = useDeleteCustomerRecord(kind, customerId);
  const [editing, setEditing] = useState<Item<K> | "new" | null>(null);
  const [deleting, setDeleting] = useState<Item<K> | null>(null);

  const addButton = (
    <Button variant="outline" size="sm" onClick={() => setEditing("new")}>
      <Plus /> Add {noun}
    </Button>
  );

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {records.data && records.data.items.length > 0 && addButton}
      </div>

      {records.isPending ? (
        <ListSkeleton rows={2} />
      ) : records.isError ? (
        <ErrorState error={records.error} onRetry={() => records.refetch()} />
      ) : records.data.items.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={addButton} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(records.data.items as Item<K>[]).map((item) => {
            const d = describe(item);
            return (
              <Card key={item.id} size="sm">
                <CardHeader>
                  <CardTitle>{d.title}</CardTitle>
                  <CardDescription>{d.subtitle}</CardDescription>
                  <CardAction>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${d.title}`} />}
                      >
                        <EllipsisVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(item)}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleting(item)}>
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardAction>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      <FormDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? `Add ${noun}` : `Edit ${noun}`}
      >
        {editing !== null && renderForm(editing === "new" ? undefined : editing, () => setEditing(null))}
      </FormDialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete this ${noun}?`}
        description={deleting ? `"${describe(deleting).title}" will be removed. This can't be undone.` : ""}
        confirmLabel="Delete"
        destructive
        onConfirm={() =>
          remove.mutateAsync(deleting!.id).then(
            () => toast.success(`${noun[0].toUpperCase()}${noun.slice(1)} deleted`),
            (err: Error) => {
              toast.error(err.message); // e.g. "used by a booking"
              throw err;
            },
          )
        }
      />
    </section>
  );
}
