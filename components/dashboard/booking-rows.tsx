import { createElement } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { applianceIcon } from "@/lib/record-icons";
import { formatTime, formatWeekdayDate } from "@/lib/format";
import type { Booking } from "@/lib/types";

// Short list of bookings: appliance icon, number, who, when, status. The whole row opens the booking.
// `base` is where a booking's page lives.
export function BookingRows({ items, base, showCustomer = false, empty }: { items: Booking[]; base: string; showCustomer?: boolean; empty: string }) {
  if (items.length === 0) return <p className="rounded-lg bg-muted/40 px-3 py-4 text-center text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="-mx-2 flex flex-col">
      {items.map((b) => (
        <li key={b.id}>
          <Link href={`${base}/${b.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground" aria-hidden>
              {createElement(applianceIcon(b.appliance.category.name), { className: "size-4" })}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 gap-1 text-sm">
                <span className="shrink-0 font-medium whitespace-nowrap">{b.bookingNumber}</span>
                {showCustomer && <span className="truncate text-muted-foreground">· {b.customer.name}</span>}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {b.service.name} · {formatWeekdayDate(b.startAt)}, {formatTime(b.startAt)}
              </div>
            </div>
            <StatusBadge status={b.status} />
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
