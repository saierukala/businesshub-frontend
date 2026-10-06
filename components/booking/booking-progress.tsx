import { Ban, Check, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

// The normal path of a visit. PENDING counts as "Booked" (waiting for confirmation).
const STEPS: { label: string; statuses: BookingStatus[] }[] = [
  { label: "Booked", statuses: ["PENDING", "CONFIRMED"] },
  { label: "Technician assigned", statuses: ["ASSIGNED"] },
  { label: "On the way", statuses: ["EN_ROUTE"] },
  { label: "Arrived", statuses: ["ARRIVED"] },
  { label: "Work started", statuses: ["IN_PROGRESS"] },
  { label: "Completed", statuses: ["COMPLETED"] },
];

// Where the visit is now. Cancelled and no-show leave the path, so they get a plain notice instead.
export function BookingProgress({ status }: { status: BookingStatus }) {
  if (status === "CANCELLED" || status === "NO_SHOW") {
    const Icon = status === "CANCELLED" ? Ban : UserX;
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
        <Icon className="size-4 text-muted-foreground" />
        {status === "CANCELLED" ? "This booking was cancelled. See the history below for why." : "Marked as a no-show: the customer was not there when the technician came."}
      </div>
    );
  }

  const current = STEPS.findIndex((s) => s.statuses.includes(status));
  return (
    <div className="rounded-lg border bg-card p-4">
      {/* Phones: one line with a bar. Wider screens: every step. */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{STEPS[current].label}</span>
          <span className="text-muted-foreground">
            Step {current + 1} of {STEPS.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((current + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <ol className="hidden items-start sm:flex" aria-label="Booking progress">
        {STEPS.map((step, i) => {
          const done = i < current || status === "COMPLETED";
          const now = i === current && status !== "COMPLETED";
          return (
            <li key={step.label} className="flex flex-1 flex-col items-center text-center" aria-current={now ? "step" : undefined}>
              <div className="flex w-full items-center">
                <span className={cn("h-0.5 flex-1", i === 0 ? "invisible" : i <= current ? "bg-primary" : "bg-border")} />
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    done && "border-primary bg-primary text-primary-foreground",
                    now && "border-primary bg-background text-primary ring-4 ring-primary/15",
                    !done && !now && "border-border bg-background text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </span>
                <span className={cn("h-0.5 flex-1", i === STEPS.length - 1 ? "invisible" : i < current ? "bg-primary" : "bg-border")} />
              </div>
              <span className={cn("mt-2 px-1 text-xs", now ? "font-semibold text-foreground" : done ? "text-foreground" : "text-muted-foreground")}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
