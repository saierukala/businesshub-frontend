"use client";

import { useState } from "react";
import { CalendarClock, Ban, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState } from "@/components/common/query-states";
import { StatusBadge } from "@/components/status-badge";
import { AssignDialog } from "./assign-dialog";
import { CancelDialog } from "./cancel-dialog";
import { RescheduleDialog } from "./reschedule-dialog";
import { useBooking, useMarkNoShow } from "@/lib/queries/bookings";
import { formatDuration, formatINR, formatPhone, formatSlot, formatDate, formatTime } from "@/lib/format";
import type { BookingDetail as Detail, BookingStatus } from "@/lib/types";

// Statuses where the visit can still be moved or cancelled. (The API enforces this and the time windows.)
const OPEN: BookingStatus[] = ["PENDING", "CONFIRMED", "ASSIGNED"];
// Staff can mark no-show once a technician is on the job.
const NO_SHOW_FROM: BookingStatus[] = ["ASSIGNED", "EN_ROUTE", "ARRIVED"];

export function BookingDetail({ id, staff = false }: { id: string; staff?: boolean }) {
  const query = useBooking(id);
  const noShow = useMarkNoShow(id);
  const [dialog, setDialog] = useState<"reschedule" | "cancel" | "noshow" | "assign" | null>(null);

  if (query.isPending) return <Skeleton className="h-64 w-full" aria-busy="true" aria-label="Loading" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const b: Detail = query.data;
  const isOpen = OPEN.includes(b.status);
  const rows: [string, React.ReactNode][] = [
    ["When", formatSlot(b.startAt, b.endAt)],
    ["Service", `${b.service.name}, about ${formatDuration(b.service.durationMinutes)}`],
    ["Visit charge", formatINR(b.service.basePrice)],
    ["Appliance", `${b.appliance.brand} ${b.appliance.category.name}${b.appliance.model ? ` (${b.appliance.model})` : ""}`],
    ["Problem", b.problemDescription],
    ["Address", [b.address.label, b.address.line1, b.address.area, b.address.city].filter(Boolean).join(", ")],
    ["Technician", b.technician?.name ?? "Not assigned yet"],
    ...(staff ? ([["Customer", `${b.customer.name} · ${formatPhone(b.customer.phone)}`], ["Source", b.source]] as [string, string][]) : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{b.bookingNumber}</h1>
        <StatusBadge status={b.status} />
        {b.needsReassignment && <span className="text-sm font-medium text-destructive">Needs a new technician</span>}
      </div>

      {(isOpen || (staff && NO_SHOW_FROM.includes(b.status))) && (
        <div className="flex flex-wrap gap-2">
          {staff && (b.status === "CONFIRMED" || b.status === "ASSIGNED") && (
            <Button size="lg" variant={b.needsReassignment || b.status === "CONFIRMED" ? "default" : "outline"} onClick={() => setDialog("assign")}>
              <UserCheck /> {b.status === "ASSIGNED" ? "Change technician" : "Assign technician"}
            </Button>
          )}
          {isOpen && (
            <>
              <Button variant="outline" size="lg" onClick={() => setDialog("reschedule")}>
                <CalendarClock /> Reschedule
              </Button>
              <Button variant="outline" size="lg" onClick={() => setDialog("cancel")}>
                <Ban /> Cancel booking
              </Button>
            </>
          )}
          {staff && NO_SHOW_FROM.includes(b.status) && (
            <Button variant="outline" size="lg" onClick={() => setDialog("noshow")}>
              <UserX /> Mark no-show
            </Button>
          )}
        </div>
      )}

      <dl className="divide-y rounded-lg border">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 p-3 sm:grid-cols-[9rem_1fr]">
            <dt className="text-sm text-muted-foreground">{k}</dt>
            <dd className="font-medium break-words">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">History</h2>
        <ol className="flex flex-col gap-3 border-l pl-4">
          {[...b.history].reverse().map((h, i) => (
            <li key={i} className="text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={h.toStatus} />
                <span className="text-muted-foreground">
                  {formatDate(h.createdAt)}, {formatTime(h.createdAt)}
                  {h.changedBy && ` · ${h.changedBy.name}`}
                </span>
              </div>
              {h.note && <p className="mt-1 text-muted-foreground">{h.note}</p>}
            </li>
          ))}
        </ol>
      </section>

      {/* key: a fresh dialog (empty fields, no old error) each time it opens */}
      <RescheduleDialog key={`r${dialog}`} booking={b} open={dialog === "reschedule"} onOpenChange={(o) => !o && setDialog(null)} />
      {staff && <AssignDialog key={`a${dialog}`} booking={b} open={dialog === "assign"} onOpenChange={(o) => !o && setDialog(null)} />}
      <CancelDialog key={`c${dialog}`} booking={b} open={dialog === "cancel"} onOpenChange={(o) => !o && setDialog(null)} />
      <ConfirmDialog
        open={dialog === "noshow"}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Mark as no-show?"
        description={`The customer was not there for ${b.bookingNumber}. The technician's time is not released.`}
        confirmLabel="Mark no-show"
        destructive
        onConfirm={() =>
          noShow.mutateAsync({}).then(
            () => toast.success("Marked as no-show"),
            (err: Error) => {
              toast.error(err.message);
              throw err;
            },
          )
        }
      />
    </div>
  );
}
