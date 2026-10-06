"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { StatusBadge } from "@/components/status-badge";
import { useBookings } from "@/lib/queries/bookings";
import { useTechnicianDashboard } from "@/lib/queries/dashboard";
import { useListParams } from "@/hooks/use-list-params";
import { formatTime, formatWeekdayDate, istDay } from "@/lib/format";
import type { Booking } from "@/lib/types";

// showDate: for jobs not on today, so two "10:00 am" cards on different days are not mistaken for each other.
function JobCard({ job, showDate }: { job: Booking; showDate: boolean }) {
  return (
    <Link
      href={`/tech/jobs/${job.id}`}
      className="flex min-h-20 items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-semibold">
            {showDate && <span className="font-normal text-muted-foreground">{formatWeekdayDate(job.startAt)} · </span>}
            {formatTime(job.startAt)}
          </span>
          <div className="flex items-center gap-1.5">
            {job.status === "COMPLETED" && (
              <span className={job.paid ? "text-xs font-medium text-green-700 dark:text-green-400" : "text-xs font-medium text-destructive"}>
                {job.paid ? "Paid" : "Payment due"}
              </span>
            )}
            <StatusBadge status={job.status} />
          </div>
        </div>
        <div className="mt-1 font-medium">
          {job.service.name} · {job.customer.name}
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">
            {job.address.area}, {job.appliance.brand} {job.appliance.category.name}
          </span>
        </div>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function Group({ title, jobs, showDate = true }: { title: string; jobs: Booking[]; showDate?: boolean }) {
  if (jobs.length === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{title}</h2>
      {jobs.map((j) => (
        <JobCard key={j.id} job={j} showDate={showDate} />
      ))}
    </section>
  );
}

// "2 of 5 done today" from the dashboard API, which counts the day in IST on the server.
function TodayProgress() {
  const { data } = useTechnicianDashboard();
  if (!data || data.counts.total === 0) return null;
  const { done, remaining, total } = data.counts;
  return (
    <p className="rounded-lg border bg-muted/40 px-4 py-3 text-sm" aria-live="polite">
      <span className="font-semibold">
        {done} of {total}
      </span>{" "}
      done today{remaining > 0 ? `, ${remaining} to go.` : ". All finished."}
    </p>
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

  if (earlierUnfinished.length + todays.length + later.length === 0) {
    return <EmptyState title="No jobs assigned" description="When the manager assigns you a booking, it shows up here." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <TodayProgress />
      <Group title="Not finished" jobs={earlierUnfinished} />
      <Group title={`Today, ${formatWeekdayDate(new Date().toISOString())}`} jobs={todays} showDate={false} />
      {todays.length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled for today.</p>}
      <Group title="Coming up" jobs={later} />
      {jobs.data.total > 0 && <PaginationBar {...jobs.data} onPageChange={(p) => set({ page: p })} />}
    </div>
  );
}
