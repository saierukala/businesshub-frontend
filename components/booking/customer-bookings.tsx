"use client";

import { createElement, useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock, MapPin, UserRound } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { applianceIcon } from "@/lib/record-icons";
import { dateParts, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/lib/types";

const CLOSED: BookingStatus[] = ["COMPLETED", "CANCELLED", "NO_SHOW"];

// A customer's own bookings as cards: a calendar-style date, what is being repaired, where, and by whom.
// Visits still to come get a filled date block so they stand out from the past ones.
export function CustomerBookings({ items }: { items: Booking[] }) {
  const [now] = useState(() => Date.now()); // read once, so the render stays pure
  return (
    <ul className="flex flex-col gap-3">
      {items.map((b) => {
        const upcoming = !CLOSED.includes(b.status) && new Date(b.endAt).getTime() > now;
        const d = dateParts(b.startAt);
        return (
          <li key={b.id}>
            <Link
              href={`/bookings/${b.id}`}
              className="group flex items-stretch gap-4 rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-all hover:shadow-md hover:ring-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:p-4"
            >
              <div
                className={cn(
                  "flex w-14 shrink-0 flex-col items-center justify-center self-start rounded-lg py-2 leading-none sm:w-16 sm:self-stretch",
                  upcoming ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                <span className="text-xs font-medium uppercase">{d.month}</span>
                <span className="my-1 text-2xl font-semibold tabular-nums">{d.day}</span>
                <span className="text-xs">{d.weekday}</span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {createElement(applianceIcon(b.appliance.category.name), { className: "size-4 shrink-0 text-muted-foreground", "aria-hidden": true })}
                    <span className="truncate font-medium">{b.service.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.status === "COMPLETED" && (
                      <span className={cn("text-xs font-medium", b.paid ? "text-green-700 dark:text-green-400" : "text-destructive")}>{b.paid ? "Paid" : "Payment due"}</span>
                    )}
                    <StatusBadge status={b.status} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {b.appliance.brand} {b.appliance.category.name} · <span className="font-mono text-xs whitespace-nowrap">{b.bookingNumber}</span>
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {formatTime(b.startAt)} – {formatTime(b.endAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {b.address.label} · {b.address.area}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="size-3.5" />
                    {b.technician?.name ?? <span className="italic">Technician not assigned yet</span>}
                  </span>
                </div>
              </div>

              <ChevronRight className="size-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
