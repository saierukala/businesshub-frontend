"use client";

import { CalendarCheck, CheckCircle2, ListChecks } from "lucide-react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { TechJobCard, type CardTone } from "@/components/tech/tech-job-card";
import { useBookings } from "@/lib/queries/bookings";
import { useTechnicianDashboard } from "@/lib/queries/dashboard";
import { useListParams } from "@/hooks/use-list-params";
import { istDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking } from "@/lib/types";

const isOpen = (j: Booking) => j.status !== "COMPLETED" && j.status !== "CANCELLED" && j.status !== "NO_SHOW";

function Group({ title, hint, jobs, showDate = true, tone, nextId }: { title: string; hint?: string; jobs: Booking[]; showDate?: boolean; tone?: CardTone; nextId?: string }) {
  if (jobs.length === 0) return null;
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{title}</h2>
        <span className="text-xs text-muted-foreground">{hint ?? `${jobs.length} ${jobs.length === 1 ? "job" : "jobs"}`}</span>
      </div>
      {jobs.map((j) => (
        <TechJobCard key={j.id} job={j} showDate={showDate} tone={j.id === nextId ? "next" : tone} />
      ))}
    </section>
  );
}

function Stat({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className="flex flex-col rounded-lg bg-muted/50 px-3 py-2">
      <span className={cn("text-2xl leading-tight font-bold tabular-nums", className)}>{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// Today's progress from the dashboard API, which counts the day in IST on the server.
function TodaySummary() {
  const { data } = useTechnicianDashboard();
  if (!data || data.counts.total === 0) return null;
  const { done, remaining, total } = data.counts;
  const pct = Math.round((done / total) * 100);
  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-4" aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          {remaining === 0 ? <CheckCircle2 className="size-5 text-green-600" aria-hidden /> : <ListChecks className="size-5 text-muted-foreground" aria-hidden />}
          {remaining === 0 ? "All finished for today" : "Today's progress"}
        </h2>
        <span className="text-sm font-medium tabular-nums">{pct}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${done} of ${total} jobs done today`}
      >
        <div className="h-full rounded-full bg-green-600 transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Today" value={total} />
        <Stat label="Done" value={done} className="text-green-700 dark:text-green-400" />
        <Stat label="To go" value={remaining} className={remaining > 0 ? "text-primary" : undefined} />
      </div>
    </section>
  );
}

// The technician's home: today's jobs first, then what is coming up. Only their own assigned bookings.
export function TechJobs() {
  const { page, set } = useListParams();
  const today = istDay();
  // Today and later: this list's total is exactly the cards shown under Today and Coming up.
  const jobs = useBookings({ sort: "soonest", from: today, pageSize: 20, page, hideCancelled: true });
  // Any earlier day, still open (never completed, cancelled or no-show): the API's "past, still open", own jobs only.
  const unfinished = useBookings({ sort: "soonest", pastOpen: true, pageSize: 50 });

  if (jobs.isPending || unfinished.isPending) return <ListSkeleton rows={3} />;
  if (jobs.isError) return <ErrorState error={jobs.error} onRetry={() => jobs.refetch()} />;
  if (unfinished.isError) return <ErrorState error={unfinished.error} onRetry={() => unfinished.refetch()} />;

  const day = (j: Booking) => istDay(new Date(j.startAt));
  const earlierUnfinished = unfinished.data.items.filter((j) => day(j) < today); // today's are in the Today group
  const todays = jobs.data.items.filter((j) => day(j) === today);
  const later = jobs.data.items.filter((j) => day(j) > today);
  const nextId = todays.find(isOpen)?.id; // sorted soonest first, so this is the job to do now

  if (earlierUnfinished.length + todays.length + later.length === 0) {
    return <EmptyState icon={CalendarCheck} title="No jobs assigned" description="When the manager assigns you a booking, it shows up here." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <TodaySummary />
      <Group title="Not finished" hint="From earlier days, still open" jobs={earlierUnfinished} tone="overdue" />
      <Group title="Today" jobs={todays} showDate={false} nextId={nextId} />
      {todays.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Nothing scheduled for today.</p>}
      <Group title="Coming up" jobs={later} />
      {jobs.data.total > 0 && <PaginationBar {...jobs.data} onPageChange={(p) => set({ page: p })} />}
    </div>
  );
}
