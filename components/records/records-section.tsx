"use client";

import { useState } from "react";
import { EllipsisVertical, History, Pencil, Plus, Trash2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { FormDialog } from "@/components/common/form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ApplianceHistory } from "./appliance-history";
import { useCustomerRecords, useDeleteCustomerRecord } from "@/lib/queries/customer-records";
import type { Address, Appliance } from "@/lib/types";

type Kind = "addresses" | "appliances";
type Item<K extends Kind> = K extends "addresses" ? Address : Appliance;

type Props<K extends Kind> = {
  kind: K;
  customerId?: string; // undefined = the logged-in customer
  title: string;
  icon: LucideIcon; // shown beside the section title
  description: string; // one line under the section title
  noun: string; // "address" / "appliance"
  emptyTitle: string;
  emptyDescription: string;
  describe: (item: Item<K>) => { title: string; subtitle: string; icon: LucideIcon };
  renderForm: (item: Item<K> | undefined, onDone: () => void) => React.ReactNode;
};

// List + add + edit + delete for a customer's addresses or appliances.
// Used on the customer's own account page and on the staff customer page.
export function RecordsSection<K extends Kind>(props: Props<K>) {
  const { kind, customerId, title, icon: SectionIcon, description, noun, emptyTitle, emptyDescription, describe, renderForm } = props;
  const records = useCustomerRecords(kind, customerId);
  const remove = useDeleteCustomerRecord(kind, customerId);
  const [editing, setEditing] = useState<Item<K> | "new" | null>(null);
  const [deleting, setDeleting] = useState<Item<K> | null>(null);
  const [historyOf, setHistoryOf] = useState<Item<K> | null>(null); // appliances only
  const staff = customerId !== undefined;

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/10 text-sidebar-primary" aria-hidden>
            <SectionIcon className="size-5" />
          </span>
          <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            {title}
            {records.data && records.data.total > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{records.data.total}</span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      {records.isPending ? (
        <ListSkeleton rows={2} />
      ) : records.isError ? (
        <ErrorState error={records.error} onRetry={() => records.refetch()} />
      ) : records.data.items.length === 0 ? (
        <EmptyState
          icon={SectionIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={
            <Button onClick={() => setEditing("new")}>
              <Plus /> Add {noun}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(records.data.items as Item<K>[]).map((item) => {
            const d = describe(item);
            return (
              <Card key={item.id} size="sm" className="transition-shadow hover:shadow-md hover:ring-foreground/20">
                <CardContent className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/70" aria-hidden>
                    <d.icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{d.title}</div>
                    <p className="text-sm whitespace-pre-line text-muted-foreground">{d.subtitle}</p>
                    {kind === "appliances" && (
                      <Button variant="link" size="sm" className="mt-1 h-auto px-0" onClick={() => setHistoryOf(item)}>
                        <History /> Service history
                      </Button>
                    )}
                  </div>
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
                </CardContent>
              </Card>
            );
          })}
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="flex min-h-20 items-center justify-center gap-2 rounded-xl border border-dashed text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Plus className="size-4" /> Add {noun}
          </button>
        </div>
      )}

      <FormDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? `Add ${noun}` : `Edit ${noun}`}
      >
        {editing !== null && renderForm(editing === "new" ? undefined : editing, () => setEditing(null))}
      </FormDialog>

      <FormDialog
        open={historyOf !== null}
        onOpenChange={(o) => !o && setHistoryOf(null)}
        title="Service history"
        description={historyOf ? describe(historyOf).title : undefined}
      >
        {historyOf && <ApplianceHistory applianceId={historyOf.id} staff={staff} />}
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
