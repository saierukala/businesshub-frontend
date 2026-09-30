"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { StatusBadge } from "@/components/status-badge";
import { useBookings } from "@/lib/queries/bookings";
import { useListParams } from "@/hooks/use-list-params";
import { addDays, formatTime, formatWeekdayDate, istDay } from "@/lib/format";
import type { Booking } from "@/lib/types";

function JobCard({ job }: { job: Booking }) {
  return (
    <Link
      href={`/tech/jobs/${job.id}`}
      className="flex min-h-20 items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-semibold">{formatTime(job.startAt)}</span>
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

function Group({ title, jobs }: { title: string; jobs: Booking[] }) {
  if (jobs.length === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{title}</h2>
      {jobs.map((j) => (
        <JobCard key={j.id} job={j} />
      ))}
    </section>
  );
}

// The technician's home: today's jobs first, then what is coming up. Only their own assigned bookings.
export function TechJobs() {
  const { page, set } = useListParams();
  const today = istDay();
  // From yesterday, so a visit that ran over midnight or was left unfinished is still shown.
  const jobs = useBookings({ sort: "soonest", from: addDays(today, -1), pageSize: 50, page, hideCancelled: true });

  if (jobs.isPending) return <ListSkeleton rows={3} />;
  if (jobs.isError) return <ErrorState error={jobs.error} onRetry={() => jobs.refetch()} />;

  const day = (j: Booking) => istDay(new Date(j.startAt));
  const active = jobs.data.items;
  const earlierUnfinished = active.filter((j) => day(j) < today && j.status !== "COMPLETED");
  const todays = active.filter((j) => day(j) === today);
  const later = active.filter((j) => day(j) > today);

  if (earlierUnfinished.length + todays.length + later.length === 0) {
    return <EmptyState title="No jobs assigned" description="When the manager assigns you a booking, it shows up here." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Group title="Not finished" jobs={earlierUnfinished} />
      <Group title={`Today, ${formatWeekdayDate(new Date().toISOString())}`} jobs={todays} />
      {todays.length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled for today.</p>}
      <Group title="Coming up" jobs={later} />
      <PaginationBar {...jobs.data} onPageChange={(p) => set({ page: p })} />
    </div>
  );
}
