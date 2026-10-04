import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatTime, formatWeekdayDate } from "@/lib/format";
import type { Booking } from "@/lib/types";

// Short list of bookings: number, who, when, status. `base` is where a booking's page lives.
export function BookingRows({ items, base, showCustomer = false, empty }: { items: Booking[]; base: string; showCustomer?: boolean; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="flex flex-col divide-y">
      {items.map((b) => (
        <li key={b.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <Link href={`${base}/${b.id}`} className="font-medium hover:underline">
              {b.bookingNumber}
            </Link>
            <div className="truncate text-xs text-muted-foreground">
              {showCustomer && `${b.customer.name} · `}
              {b.service.name} · {formatWeekdayDate(b.startAt)}, {formatTime(b.startAt)}
            </div>
          </div>
          <StatusBadge status={b.status} />
        </li>
      ))}
    </ul>
  );
}
