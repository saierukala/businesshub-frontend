"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { FormDialog } from "@/components/common/form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { TimeOffForm } from "./time-off-form";
import { useRemoveTimeOff, useTimeOff } from "@/lib/queries/technicians";
import { formatDayRange } from "@/lib/format";
import type { TimeOff } from "@/lib/types";

const REASON_LABEL = { SICK: "Sick", LEAVE: "Leave", OTHER: "Other" };

export function TimeOffSection({ technicianId }: { technicianId: string }) {
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<TimeOff | null>(null);
  const timeOff = useTimeOff(technicianId, false); // upcoming and current only
  const remove = useRemoveTimeOff(technicianId);

  const addButton = (
    <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
      <Plus /> Add time off
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time off</CardTitle>
        <CardDescription>Sick days and leave. No bookings are offered to this technician on these days.</CardDescription>
        {timeOff.data && timeOff.data.items.length > 0 && <CardAction>{addButton}</CardAction>}
      </CardHeader>
      <CardContent>
        {timeOff.isPending ? (
          <ListSkeleton rows={2} />
        ) : timeOff.isError ? (
          <ErrorState error={timeOff.error} onRetry={() => timeOff.refetch()} />
        ) : timeOff.data.items.length === 0 ? (
          <EmptyState title="No upcoming time off" description="Add days when this technician is away." action={addButton} />
        ) : (
          <ul className="flex flex-col divide-y">
            {timeOff.data.items.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{formatDayRange(t.startAt, t.endAt)}</div>
                  {t.note && <div className="truncate text-xs text-muted-foreground">{t.note}</div>}
                </div>
                <Badge variant="secondary">{REASON_LABEL[t.reason]}</Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove time off ${formatDayRange(t.startAt, t.endAt)}`}
                  onClick={() => setRemoving(t)}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <FormDialog open={adding} onOpenChange={setAdding} title="Add time off" description="Whole days, India time.">
        <TimeOffForm technicianId={technicianId} onDone={() => setAdding(false)} />
      </FormDialog>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="Remove this time off?"
        description={removing ? `${formatDayRange(removing.startAt, removing.endAt)} becomes a normal working day again.` : ""}
        confirmLabel="Remove"
        destructive
        onConfirm={() =>
          remove.mutateAsync(removing!.id).then(
            () => toast.success("Time off removed"),
            (err: Error) => {
              toast.error(err.message);
              throw err;
            },
          )
        }
      />
    </Card>
  );
}
