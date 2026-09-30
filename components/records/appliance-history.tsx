"use client";

import Link from "next/link";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { useApplianceHistory } from "@/lib/queries/visits";
import { formatDate, formatINR } from "@/lib/format";

// Past visits of one appliance (completed only): when, what was done, who came and what it cost.
// A follow-up says which visit it continues, so a repair that took two visits reads as one story.
export function ApplianceHistory({ applianceId, staff = false }: { applianceId: string; staff?: boolean }) {
  const history = useApplianceHistory(applianceId, true);
  const base = staff ? "/staff/bookings" : "/bookings";

  if (history.isPending) return <ListSkeleton rows={2} />;
  if (history.isError) return <ErrorState error={history.error} onRetry={() => history.refetch()} />;
  if (history.data.items.length === 0) {
    return <EmptyState title="No completed visits yet" description="Finished repairs for this appliance will be listed here." />;
  }

  return (
    <ol className="flex flex-col gap-3">
      {history.data.items.map((h) => (
        <li key={h.bookingId} className="rounded-lg border p-3 text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium">{h.service.name}</span>
            <span className="font-semibold">{formatINR(h.amount)}</span>
          </div>
          <div className="text-muted-foreground">
            {formatDate(h.date)}
            {h.technician && ` · ${h.technician}`} ·{" "}
            <Link href={`${base}/${h.bookingId}`} className="underline underline-offset-2 hover:text-foreground">
              {h.bookingNumber}
            </Link>
          </div>
          {h.followUpOf && <div className="mt-1 text-muted-foreground">Follow-up to {h.followUpOf.bookingNumber}</div>}
          {h.workPerformed && <p className="mt-2">{h.workPerformed}</p>}
        </li>
      ))}
    </ol>
  );
}
