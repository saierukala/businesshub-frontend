"use client";

import Link from "next/link";
import { ErrorState, ListSkeleton } from "@/components/common/query-states";
import { BookingRows } from "@/components/dashboard/booking-rows";
import { Panel, StatCard } from "@/components/dashboard/stat-card";
import { STATUS_OPTIONS } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useManagerDashboard, type ManagerDashboard } from "@/lib/queries/dashboard";
import { formatINR } from "@/lib/format";

const SOURCE_LABEL = { ONLINE: "Online", PHONE: "Phone", WHATSAPP: "WhatsApp", WALK_IN: "Walk-in" } as const;

// Bars sized by count. Plain divs: no chart library needed for a few numbers.
function Bars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[9rem_1fr_2rem] items-center gap-2 text-sm">
          <span className="truncate text-muted-foreground">{r.label}</span>
          <div className="h-2 rounded-full bg-muted" role="presentation">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <span className="text-right tabular-nums">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

function Trend({ days }: { days: ManagerDashboard["bookingTrend"] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="flex h-24 items-end gap-1" role="img" aria-label={`Bookings made per day, last ${days.length} days`}>
      {days.map((d) => (
        <div key={d.date} className="flex h-full flex-1 flex-col justify-end" title={`${d.date}: ${d.count}`}>
          <div className="w-full rounded-sm bg-primary/80" style={{ height: `${Math.max(d.count ? 8 : 2, (d.count / max) * 100)}%` }} />
        </div>
      ))}
    </div>
  );
}

function Content({ d }: { d: ManagerDashboard }) {
  const todayTotal = Object.values(d.todayByStatus).reduce((a, b) => a + (b ?? 0), 0);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Bookings today" value={todayTotal} />
        <StatCard title="Revenue today" value={formatINR(d.revenue.today)} />
        <StatCard title="Revenue this month" value={formatINR(d.revenue.thisMonth)} />
        <StatCard title="Technicians free now" value={d.availableTechnicians.length} hint={d.availableTechnicians.map((t) => t.name).join(", ") || undefined} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Today by status">
          {todayTotal === 0 ? (
            <p className="text-sm text-muted-foreground">No visits scheduled today.</p>
          ) : (
            <Bars rows={STATUS_OPTIONS.map((s) => ({ label: s.label, value: d.todayByStatus[s.value as keyof typeof d.todayByStatus] ?? 0 })).filter((r) => r.value > 0)} />
          )}
        </Panel>
        <Panel title="Technician workload">
          {d.technicianWorkload.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active technicians.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="font-normal">Technician</th>
                  <th className="text-right font-normal">Today</th>
                  <th className="text-right font-normal">Next 7 days</th>
                </tr>
              </thead>
              <tbody>
                {d.technicianWorkload.map((t) => (
                  <tr key={t.technicianId}>
                    <td className="py-1">{t.name}</td>
                    <td className="text-right tabular-nums">{t.today}</td>
                    <td className="text-right tabular-nums">{t.next7Days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel
          title={`Waiting for assignment (${d.pendingAssignments.total})`}
          action={d.pendingAssignments.total > 10 && <Link href="/staff/bookings?status=CONFIRMED" className="text-sm text-primary hover:underline">See all</Link>}
        >
          <BookingRows items={d.pendingAssignments.items} base="/staff/bookings" showCustomer empty="Every upcoming booking has a technician." />
        </Panel>
        <Panel
          title={`Needs reassignment (${d.needsReassignment.total})`}
          action={d.needsReassignment.total > 0 && <Link href="/staff/reassignments" className="text-sm text-primary hover:underline">Open queue</Link>}
        >
          <BookingRows items={d.needsReassignment.items} base="/staff/bookings" showCustomer empty="Nothing needs a new technician." />
        </Panel>
        <Panel
          title={`Past visits still open (${d.pastOpen.total})`}
          action={d.pastOpen.total > 0 && <Link href="/staff/bookings?status=PAST_OPEN" className="text-sm text-primary hover:underline">See all</Link>}
        >
          <BookingRows items={d.pastOpen.items} base="/staff/bookings" showCustomer empty="Every past visit is closed." />
        </Panel>
        <Panel title="Bookings made, last 14 days">
          <Trend days={d.bookingTrend} />
        </Panel>
        <div className="grid gap-4">
          <Panel title="Popular services (30 days)">
            {d.popularServices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <Bars rows={d.popularServices.map((s) => ({ label: s.name, value: s.bookings }))} />
            )}
          </Panel>
          <Panel title="Booked via (30 days)">
            {Object.keys(d.bookingsBySource).length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <Bars rows={Object.entries(d.bookingsBySource).map(([k, v]) => ({ label: SOURCE_LABEL[k as keyof typeof SOURCE_LABEL] ?? k, value: v ?? 0 }))} />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

export function ManagerDashboardView() {
  const q = useManagerDashboard();
  if (q.isPending)
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <ListSkeleton rows={4} />
      </div>
    );
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  return <Content d={q.data} />;
}
