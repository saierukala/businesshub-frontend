import { createElement } from "react";
import Link from "next/link";
import { ArrowRight, CalendarPlus, Clock, MapPin, Wrench } from "lucide-react";
import { BookingProgress } from "@/components/booking/booking-progress";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { applianceIcon } from "@/lib/record-icons";
import { dateParts, formatTime, initials } from "@/lib/format";
import type { Booking } from "@/lib/types";

// The customer's next visit, big: a calendar date, what and where, who is coming, and how far along it is.
export function NextVisitCard({ b }: { b: Booking | null }) {
  if (!b) {
    return (
      <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground" aria-hidden>
          <CalendarPlus className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold">No visit booked</h2>
          <p className="text-sm text-muted-foreground">Something not working? Pick a time and a technician comes to you.</p>
        </div>
        <Link href="/book" className={buttonVariants()}>
          <CalendarPlus /> Book a repair
        </Link>
      </section>
    );
  }

  const d = dateParts(b.startAt);
  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Next visit</h2>
        <StatusBadge status={b.status} />
      </div>

      <div className="flex gap-4">
        <div className="flex w-16 shrink-0 flex-col items-center overflow-hidden rounded-lg border text-center" aria-hidden>
          <span className="w-full bg-sidebar-primary py-0.5 text-xs font-semibold text-sidebar-primary-foreground uppercase">{d.month}</span>
          <span className="pt-1 text-2xl leading-none font-bold">{d.day}</span>
          <span className="pb-1.5 text-xs text-muted-foreground">{d.weekday}</span>
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center gap-2 font-semibold">
            {createElement(applianceIcon(b.appliance.category.name), { className: "size-4 shrink-0 text-muted-foreground", "aria-hidden": true })}
            <span className="truncate">
              {b.service.name} · {b.appliance.brand} {b.appliance.category.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4 shrink-0" aria-hidden />
            {formatTime(b.startAt)} – {formatTime(b.endAt)}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{b.address.area}</span>
          </div>
        </div>
      </div>

      <BookingProgress status={b.status} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {b.technician ? (
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground" aria-hidden>
              {initials(b.technician.name)}
            </span>
            <div className="text-sm">
              <div className="font-medium">{b.technician.name}</div>
              <div className="text-xs text-muted-foreground">Your technician</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wrench className="size-4" aria-hidden /> A technician will be assigned soon.
          </div>
        )}
        <Link href={`/bookings/${b.id}`} className={buttonVariants({ variant: "outline" })}>
          View booking <ArrowRight />
        </Link>
      </div>
    </section>
  );
}
