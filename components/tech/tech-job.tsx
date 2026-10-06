"use client";

import { useState } from "react";
import { CalendarDays, CalendarPlus, ChevronRight, MapPin, MessageSquareText, Phone, WashingMachine, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/common/query-states";
import { StatusBadge } from "@/components/status-badge";
import { BookingProgress } from "@/components/booking/booking-progress";
import { DetailItem } from "@/components/booking/detail-item";
import { FollowUpDialog } from "@/components/booking/follow-up-dialog";
import { VisitSummary } from "@/components/booking/visit-summary";
import { PaymentSection } from "@/components/payment/payment-section";
import { ExtraChargeCard } from "./extra-charge-card";
import { VisitForm } from "./visit-form";
import { useBooking } from "@/lib/queries/bookings";
import { useAdvanceBooking } from "@/lib/queries/visits";
import { formatDuration, formatPhone, formatSlot } from "@/lib/format";
import type { BookingDetail, BookingStatus } from "@/lib/types";

// A card look without <Card>'s overflow clipping (sticky bars inside must keep working).
const SECTION = "flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10";
const TILE =
  "flex min-h-16 items-center gap-3 rounded-xl bg-card p-3 text-left ring-1 ring-foreground/10 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

// The big button for the next step. Completing is done from the visit form below.
const NEXT: Partial<Record<BookingStatus, { to: "EN_ROUTE" | "ARRIVED" | "IN_PROGRESS"; label: string }>> = {
  ASSIGNED: { to: "EN_ROUTE", label: "I'm on my way" },
  EN_ROUTE: { to: "ARRIVED", label: "I've arrived" },
  ARRIVED: { to: "IN_PROGRESS", label: "Start work" },
};

function StatusBar({ booking }: { booking: BookingDetail }) {
  const advance = useAdvanceBooking(booking.id);
  const next = NEXT[booking.status];
  if (!next) return null;
  return (
    <div className="sticky bottom-3 z-30 rounded-xl border bg-background/95 p-2 shadow-lg backdrop-blur">
      <div>
        <Button
          size="lg"
          className="h-12 w-full text-base"
          disabled={advance.isPending}
          aria-busy={advance.isPending}
          onClick={() => advance.mutate(next.to, { onError: (err) => toast.error(err.message) })}
        >
          {advance.isPending && <Spinner />}
          {next.label}
        </Button>
      </div>
    </div>
  );
}

// One job on the technician's phone: who and where, the next step as a big button, and once the work has
// started the visit notes, extra charge and follow-up. Everything the status may do is decided by the API.
export function TechJob({ id }: { id: string }) {
  const query = useBooking(id);
  const [followUp, setFollowUp] = useState(false);

  if (query.isPending) return <Skeleton className="h-64 w-full" aria-busy="true" aria-label="Loading" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const b = query.data;
  const address = [b.address.line1, b.address.area, b.address.city, b.address.pincode].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{b.customer.name}</h1>
          <StatusBadge status={b.status} />
        </div>
        <p className="text-muted-foreground">
          {b.service.name} · {formatSlot(b.startAt, b.endAt)} · {b.bookingNumber}
        </p>
      </div>

      <BookingProgress status={b.status} />

      <div className="grid gap-2 sm:grid-cols-2">
        {b.customer.phone && (
          <a href={`tel:+91${b.customer.phone}`} className={TILE}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300">
              <Phone className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium tracking-wide text-muted-foreground uppercase">Call customer</span>
              <span className="block font-medium">{formatPhone(b.customer.phone)}</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </a>
        )}
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className={TILE}>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
            <MapPin className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium tracking-wide text-muted-foreground uppercase">Directions</span>
            <span className="block font-medium">{address}</span>
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailItem icon={CalendarDays} label="When">
              {formatSlot(b.startAt, b.endAt)}
            </DetailItem>
            <DetailItem icon={Wrench} label="Job">
              {b.service.name}
              <span className="block text-sm font-normal text-muted-foreground">About {formatDuration(b.service.durationMinutes)}</span>
            </DetailItem>
            <DetailItem icon={WashingMachine} label="Appliance">
              {b.appliance.brand} {b.appliance.category.name}
              {b.appliance.model && <span className="block text-sm font-normal text-muted-foreground">Model {b.appliance.model}</span>}
            </DetailItem>
            <DetailItem icon={MessageSquareText} label="Problem">
              {b.problemDescription}
            </DetailItem>
          </dl>
        </CardContent>
      </Card>

      {b.status === "IN_PROGRESS" && (
        <>
          <ExtraChargeCard booking={b} />
          <section className={SECTION}>
            <div>
              <h2 className="font-semibold">Visit notes</h2>
              <p className="text-sm text-muted-foreground">The customer sees these on their visit report. Save as you go; Complete needs what you found and what you did.</p>
            </div>
            <VisitForm booking={b} />
          </section>
        </>
      )}

      {b.status === "COMPLETED" && b.visit && <VisitSummary visit={b.visit} />}
      <PaymentSection booking={b} canRecord receiptHref={`/tech/jobs/${b.id}/receipt`} />

      {(b.status === "IN_PROGRESS" || b.status === "COMPLETED") && (
        <section className={SECTION}>
          <div>
            <h2 className="font-semibold">Needs a second visit?</h2>
            <p className="text-sm text-muted-foreground">For example a part to order, or a check after a few days. This books a linked follow-up for the same customer and appliance.</p>
          </div>
          <Button variant="outline" size="lg" className="h-12 w-full sm:w-fit" onClick={() => setFollowUp(true)}>
            <CalendarPlus /> Book a follow-up visit
          </Button>
        </section>
      )}

      <StatusBar booking={b} />
      <FollowUpDialog key={`f${followUp}`} booking={b} open={followUp} onOpenChange={setFollowUp} />
    </div>
  );
}
