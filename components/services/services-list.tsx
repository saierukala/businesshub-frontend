"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { FormDialog } from "@/components/common/form-dialog";
import { ServiceForm } from "./service-form";
import { useServices, useSetServiceActive } from "@/lib/queries/catalog";
import { useListParams } from "@/hooks/use-list-params";
import { formatDuration, formatINR } from "@/lib/format";
import type { Service } from "@/lib/types";

export function ServicesList() {
  const { page, set } = useListParams();
  const services = useServices({ page, includeInactive: true });
  const setActive = useSetServiceActive();
  const [editing, setEditing] = useState<Service | "new" | null>(null);

  const addButton = (
    <Button onClick={() => setEditing("new")}>
      <Plus /> New service
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">{addButton}</div>

      {services.isPending ? (
        <ListSkeleton />
      ) : services.isError ? (
        <ErrorState error={services.error} onRetry={() => services.refetch()} />
      ) : services.data.items.length === 0 ? (
        <EmptyState title="No services yet" description="Add the repairs customers can book." action={addButton} />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="hidden sm:table-cell">Duration</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Bookable</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Edit</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.data.items.map((s) => (
                  <TableRow key={s.id} className={s.active ? undefined : "text-muted-foreground"}>
                    <TableCell>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.category.name}
                        {!s.category.active && " · appliance type turned off (not bookable)"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{formatDuration(s.durationMinutes)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatINR(s.basePrice)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={s.active}
                        aria-label={`${s.name} bookable`}
                        disabled={setActive.isPending && setActive.variables?.id === s.id}
                        onCheckedChange={(active) =>
                          setActive.mutate(
                            { id: s.id, active },
                            {
                              onSuccess: () => toast.success(active ? `${s.name} is bookable` : `${s.name} hidden from customers`),
                              onError: (err) => toast.error(err.message),
                            },
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" aria-label={`Edit ${s.name}`} onClick={() => setEditing(s)}>
                        <Pencil />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationBar {...services.data} onPageChange={(p) => set({ page: p })} />
        </>
      )}

      <FormDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "New service" : "Edit service"}
      >
        {editing !== null && <ServiceForm service={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />}
      </FormDialog>
    </div>
  );
}
