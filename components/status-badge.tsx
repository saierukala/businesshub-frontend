import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

// The one place that maps a booking status to its label and colour.
const STATUS: Record<BookingStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200" },
  ASSIGNED: { label: "Technician assigned", className: "bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-200" },
  EN_ROUTE: { label: "On the way", className: "bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-200" },
  ARRIVED: { label: "Arrived", className: "bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-200" },
  IN_PROGRESS: { label: "In progress", className: "bg-cyan-100 text-cyan-900 dark:bg-cyan-500/20 dark:text-cyan-200" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-900 dark:bg-green-500/20 dark:text-green-200" },
  CANCELLED: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
  NO_SHOW: { label: "No-show", className: "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200" },
};

export const STATUS_OPTIONS = (Object.keys(STATUS) as BookingStatus[]).map((s) => ({ value: s, label: STATUS[s].label }));

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant="secondary" className={cn("border-transparent", STATUS[status].className)}>
      {STATUS[status].label}
    </Badge>
  );
}
