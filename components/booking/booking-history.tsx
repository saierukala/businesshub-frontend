import { Ban, CalendarClock, CalendarPlus, CheckCircle2, Car, MapPin, PencilLine, UserCheck, UserRoundCog, UserX, Wrench, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BookingDetail, BookingStatus } from "@/lib/types";

type Entry = BookingDetail["history"][number];
type Event = { title: string; icon: LucideIcon; tone: string };

const BY_STATUS: Record<BookingStatus, Event> = {
  PENDING: { title: "Waiting for confirmation", icon: CalendarPlus, tone: "bg-amber-500" },
  CONFIRMED: { title: "Confirmed", icon: CalendarPlus, tone: "bg-blue-500" },
  ASSIGNED: { title: "Technician assigned", icon: UserCheck, tone: "bg-indigo-500" },
  EN_ROUTE: { title: "Technician on the way", icon: Car, tone: "bg-violet-500" },
  ARRIVED: { title: "Technician arrived", icon: MapPin, tone: "bg-violet-500" },
  IN_PROGRESS: { title: "Work started", icon: Wrench, tone: "bg-cyan-500" },
  COMPLETED: { title: "Completed", icon: CheckCircle2, tone: "bg-green-500" },
  CANCELLED: { title: "Cancelled", icon: Ban, tone: "bg-zinc-400" },
  NO_SHOW: { title: "Marked as no-show", icon: UserX, tone: "bg-red-500" },
};

// A history row records a status, but the same status twice means something else happened:
// a reschedule or a technician change. Name the event, not just the status.
function eventOf(h: Entry): Event {
  if (h.fromStatus === null) return { title: "Booking created", icon: CalendarPlus, tone: "bg-blue-500" };
  if (h.fromStatus === h.toStatus) {
    if (h.note?.startsWith("Rescheduled")) return { title: "Rescheduled", icon: CalendarClock, tone: "bg-amber-500" };
    if (h.toStatus === "ASSIGNED") return { title: "Technician changed", icon: UserRoundCog, tone: "bg-indigo-500" };
    return { title: "Updated", icon: PencilLine, tone: "bg-zinc-400" };
  }
  if (h.note?.startsWith("Correction")) return { title: "Status corrected", icon: PencilLine, tone: "bg-zinc-400" };
  return BY_STATUS[h.toStatus];
}

// Newest first, as a timeline. `changedBy` is only sent to staff.
export function BookingHistory({ history }: { history: Entry[] }) {
  const entries = [...history].reverse();
  return (
    <Card>
      <CardHeader>
        <CardTitle>History</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative">
          {entries.map((h, i) => {
            const e = eventOf(h);
            const last = i === entries.length - 1;
            return (
              <li key={`${h.createdAt}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
                {!last && <span className="absolute top-9 bottom-0 left-[17px] w-px bg-border" aria-hidden />}
                <span className={cn("relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full text-white", e.tone)} aria-hidden>
                  <e.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1 pt-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <span className="font-medium">{e.title}</span>
                    <time className="text-xs text-muted-foreground" dateTime={h.createdAt}>
                      {formatDate(h.createdAt)}, {formatTime(h.createdAt)}
                    </time>
                  </div>
                  {h.changedBy && <p className="text-xs text-muted-foreground">by {h.changedBy.name}</p>}
                  {h.note && <p className="mt-1 text-sm text-muted-foreground">{h.note}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
