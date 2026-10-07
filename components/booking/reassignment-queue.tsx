"use client";

import { createElement, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, UserRoundX, UserRoundPlus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { AssignDialog } from "./assign-dialog";
import { applianceIcon } from "@/lib/record-icons";
import { dateParts, formatPhone, formatTime, istDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking } from "@/lib/types";

// Whole IST days from today to the visit day: 0 = today, 1 = tomorrow, negative = already passed.
function daysUntil(iso: string, today: string) {
  const ms = (day: string) => Date.parse(`${day}T00:00:00Z`);
  return Math.round((ms(istDay(new Date(iso))) - ms(today)) / 86_400_000);
}

function urgency(b: Booking, now: number, today: string): { label: string; className: string } {
  if (new Date(b.startAt).getTime() <= now) return { label: "Time passed", className: "bg-muted text-muted-foreground" };
  const d = daysUntil(b.startAt, today);
  if (d <= 0) return { label: "Today", className: "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200" };
  if (d === 1) return { label: "Tomorrow", className: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200" };
  return { label: `In ${d} days`, className: "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200" };
}

// The "Needs reassignment" queue as a work list, earliest visit first. Each card says how urgent it is,
// who to call, and who dropped out, and lets staff assign a free technician without leaving the page.
export function ReassignmentQueue({ items }: { items: Booking[] }) {
  const [now] = useState(() => Date.now()); // read once, so the render stays pure
  const today = istDay(new Date(now));
  const [assigning, setAssigning] = useState<Booking | null>(null);

  return (
    <>
      <ul className="flex flex-col gap-3">
        {items.map((b) => {
          const u = urgency(b, now, today);
          const d = dateParts(b.startAt);
          return (
            <li key={b.id} className="flex flex-col gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
              <div className="flex min-w-0 flex-1 gap-4">
                <div className="flex w-14 shrink-0 flex-col items-center self-start rounded-lg bg-muted py-2 leading-none sm:w-16">
                  <span className="text-xs font-medium text-muted-foreground uppercase">{d.month}</span>
                  <span className="my-1 text-2xl font-semibold tabular-nums">{d.day}</span>
                  <span className="text-xs text-muted-foreground">{d.weekday}</span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", u.className)}>{u.label}</span>
                    <span className="text-sm font-medium tabular-nums">
                      {formatTime(b.startAt)} – {formatTime(b.endAt)}
                    </span>
                  </div>

                  <div className="flex min-w-0 items-center gap-2">
                    {createElement(applianceIcon(b.appliance.category.name), { className: "size-4 shrink-0 text-muted-foreground", "aria-hidden": true })}
                    <span className="truncate font-medium">{b.service.name}</span>
                    <span className="font-mono text-xs whitespace-nowrap text-muted-foreground">{b.bookingNumber}</span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="text-foreground">{b.customer.name}</span>
                    {b.customer.phone && (
                      <a href={`tel:+91${b.customer.phone}`} className="inline-flex items-center gap-1.5 tabular-nums hover:text-foreground hover:underline">
                        <Phone className="size-3.5" />
                        {formatPhone(b.customer.phone)}
                      </a>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {b.address.area}, {b.address.city}
                    </span>
                  </div>

                  {b.technician && (
                    <p className="inline-flex items-center gap-1.5 text-sm text-destructive">
                      <UserRoundX className="size-3.5" />
                      <span>
                        <span className="line-through decoration-destructive/50">{b.technician.name}</span> can&apos;t make it
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 sm:flex-col sm:items-stretch">
                <Button className="flex-1" onClick={() => setAssigning(b)}>
                  <UserRoundPlus /> Assign technician
                </Button>
                <Link href={`/staff/bookings/${b.id}`} className={buttonVariants({ variant: "outline", className: "flex-1" })}>
                  Open <ArrowRight />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      {/* key: a fresh dialog (no leftover choice or error) for each booking. */}
      {assigning && <AssignDialog key={assigning.id} booking={assigning} open onOpenChange={(o) => !o && setAssigning(null)} />}
    </>
  );
}
