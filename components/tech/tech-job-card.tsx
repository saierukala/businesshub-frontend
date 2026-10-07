import { createElement } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, MapPin, Phone } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { applianceIcon } from "@/lib/record-icons";
import { dateParts, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking } from "@/lib/types";

export type CardTone = "default" | "next" | "overdue";

// Left column: the time for today's jobs, a small calendar block for any other day,
// so two "10:00 am" cards on different days are never mistaken for each other.
function When({ job, showDate }: { job: Booking; showDate: boolean }) {
  if (showDate) {
    const d = dateParts(job.startAt);
    return (
      <div className="flex w-14 shrink-0 flex-col items-center overflow-hidden rounded-lg border text-center">
        <span className="w-full bg-muted py-0.5 text-[11px] font-semibold text-muted-foreground uppercase">{d.month}</span>
        <span className="pt-1 text-xl leading-none font-bold">{d.day}</span>
        <span className="pb-1 text-[11px] text-muted-foreground">{d.weekday}</span>
      </div>
    );
  }
  const [time, ampm] = formatTime(job.startAt).split(" ");
  return (
    <div className="flex w-14 shrink-0 flex-col items-center text-center">
      <span className="text-lg leading-tight font-bold tabular-nums">{time}</span>
      <span className="text-xs text-muted-foreground uppercase">{ampm}</span>
    </div>
  );
}

const TONE: Record<CardTone, string> = {
  default: "",
  next: "border-primary/60 ring-2 ring-primary/20",
  overdue: "border-amber-300 bg-amber-50/60 dark:border-amber-500/40 dark:bg-amber-500/10",
};

// One job on the technician's list. tone "next" adds quick actions for the job they should do now.
export function TechJobCard({ job, showDate, tone = "default" }: { job: Booking; showDate: boolean; tone?: CardTone }) {
  const done = job.status === "COMPLETED" || job.status === "CANCELLED" || job.status === "NO_SHOW";
  return (
    <article className={cn("overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-sm", TONE[tone], done && "opacity-75")}>
      {tone === "next" && (
        <div className="bg-primary px-4 py-1 text-xs font-semibold tracking-wide text-primary-foreground uppercase">Up next</div>
      )}
      <Link
        href={`/tech/jobs/${job.id}`}
        className="flex min-h-20 items-center gap-3 p-4 transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <When job={job} showDate={showDate} />
        <div className="min-w-0 flex-1 border-l pl-3">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <span className="flex min-w-0 items-center gap-2 font-semibold">
              {createElement(applianceIcon(job.appliance.category.name), { className: "size-4 shrink-0 text-muted-foreground", "aria-hidden": true })}
              <span className="truncate">{job.service.name}</span>
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
          <div className="mt-1 text-sm">
            <span className="font-medium">{job.customer.name}</span>
            <span className="text-muted-foreground">
              {" "}
              · {job.appliance.brand} {job.appliance.category.name}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              {showDate ? `${formatTime(job.startAt)} · ` : ""}
              {job.address.area}
            </span>
          </div>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
      {tone === "next" && (
        <div className="flex gap-2 border-t bg-muted/30 px-4 py-3">
          {job.customer.phone && (
            <a href={`tel:+91${job.customer.phone}`} className={buttonVariants({ variant: "outline", className: "flex-1" })}>
              <Phone /> Call {job.customer.name.split(/\s+/)[0]}
            </a>
          )}
          <Link href={`/tech/jobs/${job.id}`} className={buttonVariants({ className: "flex-1" })}>
            Open job <ArrowRight />
          </Link>
        </div>
      )}
    </article>
  );
}
