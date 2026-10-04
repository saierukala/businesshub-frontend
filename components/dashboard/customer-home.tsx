"use client";

import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { ErrorState, ListSkeleton } from "@/components/common/query-states";
import { BookingRows } from "@/components/dashboard/booking-rows";
import { Panel } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Stars } from "@/components/reviews/stars";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerDashboard, type CustomerDashboard } from "@/lib/queries/dashboard";
import { formatDate, formatINR, formatSlot } from "@/lib/format";

function Upcoming({ b }: { b: CustomerDashboard["upcomingBooking"] }) {
  if (!b) {
    return (
      <Panel title="Next appointment">
        <p className="text-sm text-muted-foreground">You have nothing booked right now.</p>
        <Link href="/book" className={buttonVariants({ className: "w-fit" })}>
          <CalendarPlus /> Book a repair
        </Link>
      </Panel>
    );
  }
  return (
    <Panel title="Next appointment" action={<StatusBadge status={b.status} />}>
      <div>
        <div className="font-medium">{b.service.name}</div>
        <div className="text-sm text-muted-foreground">{formatSlot(b.startAt, b.endAt)}</div>
        <div className="text-sm text-muted-foreground">
          {b.appliance.brand} {b.appliance.category.name} · {b.address.area}
          {b.technician && ` · ${b.technician.name}`}
        </div>
      </div>
      <Link href={`/bookings/${b.id}`} className={buttonVariants({ variant: "outline", className: "w-fit" })}>
        View booking {b.bookingNumber}
      </Link>
    </Panel>
  );
}

function Content({ d }: { d: CustomerDashboard }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Upcoming b={d.upcomingBooking} />
      <Panel title="My appliances" action={<Link href="/account" className="text-sm text-primary hover:underline">Manage</Link>}>
        {d.appliances.length === 0 ? (
          <p className="text-sm text-muted-foreground">No appliances saved yet. Add one when you book, or in your account.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {d.appliances.map((a) => (
              <li key={a.id}>
                {a.brand} {a.category.name}
                {a.model && <span className="text-muted-foreground"> · {a.model}</span>}
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Recent visits" action={<Link href="/bookings" className="text-sm text-primary hover:underline">All bookings</Link>}>
        <BookingRows items={d.recentHistory} base="/bookings" empty="Finished visits will show up here." />
      </Panel>
      <Panel title="Payments">
        {d.recentPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          <ul className="flex flex-col divide-y text-sm">
            {d.recentPayments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <div>
                  <Link href={`/bookings/${p.booking.id}/receipt`} className="font-medium hover:underline">
                    {p.receiptNumber ?? p.booking.bookingNumber}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {p.paidAt && formatDate(p.paidAt)} · {p.method}
                  </div>
                </div>
                <span className="font-medium tabular-nums">{formatINR(p.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="My reviews">
        {d.recentReviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">After a repair is done you can rate it from the booking page.</p>
        ) : (
          <ul className="flex flex-col divide-y text-sm">
            {d.recentReviews.map((r) => (
              <li key={r.id} className="flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <Stars rating={r.rating} />
                  <Link href={`/bookings/${r.booking.id}`} className="text-xs text-muted-foreground hover:underline">
                    {r.booking.bookingNumber}
                  </Link>
                </div>
                {r.comment && <p className="text-muted-foreground">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

export function CustomerHome() {
  const q = useCustomerDashboard();
  if (q.isPending)
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
        <Skeleton className="h-32" />
        <ListSkeleton rows={3} />
      </div>
    );
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  return <Content d={q.data} />;
}
