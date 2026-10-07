"use client";

import Link from "next/link";
import { AlertTriangle, CalendarCheck, CheckCircle2, ChevronRight, Clock, IndianRupee, TrendingUp, UserCog, Users, type LucideIcon } from "lucide-react";
import { ErrorState } from "@/components/common/query-states";
import { BookingRows } from "@/components/dashboard/booking-rows";
import { Bars, Trend } from "@/components/dashboard/dashboard-charts";
import { STATUS_OPTIONS } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useManagerDashboard, type ManagerDashboard } from "@/lib/queries/dashboard";
import { formatINR, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const SOURCE_LABEL = { ONLINE: "Online", PHONE: "Phone", WHATSAPP: "WhatsApp", WALK_IN: "Walk-in" } as const;

function Section({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-3 rounded-xl border bg-card p-4 sm:p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const SeeAll = ({ href, label = "See all" }: { href: string; label?: string }) => (
  <Link href={href} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
    {label} <ChevronRight className="size-4" />
  </Link>
);

const Empty = ({ children }: { children: React.ReactNode }) => <p className="rounded-lg bg-muted/40 px-3 py-4 text-center text-sm text-muted-foreground">{children}</p>;

function Kpi({ icon: Icon, title, value, children }: { icon: LucideIcon; title: string; value: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        {title}
        <span className="flex size-8 items-center justify-center rounded-lg bg-muted" aria-hidden>
          <Icon className="size-4" />
        </span>
      </div>
      <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      {children}
    </div>
  );
}

// "Needs you" tiles: amber with a warning icon when something is waiting, green with a tick when clear.
function Attention({ title, count, href, icon: Icon }: { title: string; count: number; href: string; icon: LucideIcon }) {
  const waiting = count > 0;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50",
        waiting && "border-amber-500/40 bg-amber-500/5",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          waiting ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" : "bg-green-500/10 text-green-700 dark:text-green-400",
        )}
        aria-hidden
      >
        {waiting ? <Icon className="size-5" /> : <CheckCircle2 className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-lg font-semibold tabular-nums">{waiting ? count : "All clear"}</div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground ring-2 ring-card" title={name}>
      {initials(name)}
    </span>
  );
}

function Workload({ rows }: { rows: ManagerDashboard["technicianWorkload"] }) {
  const max = Math.max(1, ...rows.map((t) => t.next7Days));
  return (
    <ul className="flex flex-col gap-3">
      <li className="grid grid-cols-[1fr_3rem_6rem] gap-3 text-xs text-muted-foreground">
        <span>Technician</span>
        <span className="text-right">Today</span>
        <span className="text-right">Next 7 days</span>
      </li>
      {rows.map((t) => (
        <li key={t.technicianId} className="grid grid-cols-[1fr_3rem_6rem] items-center gap-3 text-sm">
          <Link href={`/staff/technicians/${t.technicianId}`} className="flex min-w-0 items-center gap-2.5 hover:underline">
            <Avatar name={t.name} />
            <span className="truncate font-medium">{t.name}</span>
          </Link>
          <span className="text-right tabular-nums">{t.today}</span>
          <span className="flex items-center justify-end gap-2">
            <span className="h-1.5 w-10 rounded-full bg-muted" role="presentation">
              <span className="block h-1.5 rounded-full bg-primary" style={{ width: `${(t.next7Days / max) * 100}%` }} />
            </span>
            <span className="w-6 text-right tabular-nums">{t.next7Days}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Content({ d }: { d: ManagerDashboard }) {
  const todayTotal = Object.values(d.todayByStatus).reduce((a, b) => a + (b ?? 0), 0);
  const free = d.availableTechnicians;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={CalendarCheck} title="Bookings today" value={todayTotal} />
        <Kpi icon={IndianRupee} title="Revenue today" value={formatINR(d.revenue.today)} />
        <Kpi icon={TrendingUp} title="Revenue this month" value={formatINR(d.revenue.thisMonth)} />
        <Kpi icon={Users} title="Technicians free now" value={free.length}>
          {free.length > 0 && (
            <div className="flex -space-x-2" aria-label={free.map((t) => t.name).join(", ")}>
              {free.slice(0, 5).map((t) => (
                <Avatar key={t.id} name={t.name} />
              ))}
              {free.length > 5 && <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs ring-2 ring-card">+{free.length - 5}</span>}
            </div>
          )}
        </Kpi>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Attention title="Waiting for a technician" count={d.pendingAssignments.total} href="/staff/bookings?status=CONFIRMED" icon={UserCog} />
        <Attention title="Needs reassignment" count={d.needsReassignment.total} href="/staff/reassignments" icon={AlertTriangle} />
        <Attention title="Past visits still open" count={d.pastOpen.total} href="/staff/bookings?status=PAST_OPEN" icon={Clock} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Today by status" action={<SeeAll href="/staff/bookings" label="All bookings" />}>
          {todayTotal === 0 ? (
            <Empty>No visits scheduled today.</Empty>
          ) : (
            <Bars rows={STATUS_OPTIONS.map((s) => ({ label: s.label, value: d.todayByStatus[s.value as keyof typeof d.todayByStatus] ?? 0 })).filter((r) => r.value > 0)} />
          )}
        </Section>
        <Section title="Technician workload" action={<SeeAll href="/staff/technicians" label="Technicians" />}>
          {d.technicianWorkload.length === 0 ? <Empty>No active technicians.</Empty> : <Workload rows={d.technicianWorkload} />}
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Waiting for a technician" action={d.pendingAssignments.total > d.pendingAssignments.items.length && <SeeAll href="/staff/bookings?status=CONFIRMED" />}>
          <BookingRows items={d.pendingAssignments.items} base="/staff/bookings" showCustomer empty="Every upcoming booking has a technician." />
        </Section>
        <Section title="Needs reassignment" action={d.needsReassignment.total > 0 && <SeeAll href="/staff/reassignments" label="Open queue" />}>
          <BookingRows items={d.needsReassignment.items} base="/staff/bookings" showCustomer empty="Nothing needs a new technician." />
        </Section>
        <Section title="Past visits still open" action={d.pastOpen.total > 0 && <SeeAll href="/staff/bookings?status=PAST_OPEN" />}>
          <BookingRows items={d.pastOpen.items} base="/staff/bookings" showCustomer empty="Every past visit is closed." />
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Bookings made, last 14 days" action={<SeeAll href="/staff/reports" label="Reports" />}>
          <Trend days={d.bookingTrend} />
        </Section>
        <Section title="Popular services (30 days)">
          {d.popularServices.length === 0 ? <Empty>No bookings yet.</Empty> : <Bars rows={d.popularServices.map((s) => ({ label: s.name, value: s.bookings }))} />}
        </Section>
        <Section title="Booked via (30 days)">
          {Object.keys(d.bookingsBySource).length === 0 ? (
            <Empty>No bookings yet.</Empty>
          ) : (
            <Bars rows={Object.entries(d.bookingsBySource).map(([k, v]) => ({ label: SOURCE_LABEL[k as keyof typeof SOURCE_LABEL] ?? k, value: v ?? 0 }))} />
          )}
        </Section>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  );
}

// Owner/Manager home. Every number comes from GET /dashboard/manager; only "bookings today" adds up the API's per-status counts.
export function ManagerDashboardView() {
  const q = useManagerDashboard();
  if (q.isPending) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  return <Content d={q.data} />;
}
