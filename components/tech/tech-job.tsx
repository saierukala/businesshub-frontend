"use client";

import { useState } from "react";
import { CalendarPlus, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/common/query-states";
import { StatusBadge } from "@/components/status-badge";
import { FollowUpDialog } from "@/components/booking/follow-up-dialog";
import { VisitSummary } from "@/components/booking/visit-summary";
import { ExtraChargeCard } from "./extra-charge-card";
import { VisitForm } from "./visit-form";
import { useBooking } from "@/lib/queries/bookings";
import { useAdvanceBooking } from "@/lib/queries/visits";
import { formatDuration, formatPhone, formatSlot } from "@/lib/format";
import type { BookingDetail, BookingStatus } from "@/lib/types";

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
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 backdrop-blur">
      <div className="mx-auto max-w-5xl">
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
  const rows: [string, React.ReactNode][] = [
    ["When", formatSlot(b.startAt, b.endAt)],
    ["Job", `${b.service.name}, about ${formatDuration(b.service.durationMinutes)}`],
    ["Appliance", `${b.appliance.brand} ${b.appliance.category.name}${b.appliance.model ? ` (${b.appliance.model})` : ""}`],
    ["Problem", b.problemDescription],
  ];

  return (
    <div className="flex flex-col gap-6 pb-28">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{b.customer.name}</h1>
        <StatusBadge status={b.status} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {b.customer.phone && (
          <Button variant="outline" size="lg" className="h-12 justify-start" nativeButton={false} render={<a href={`tel:+91${b.customer.phone}`} />}>
            <Phone /> Call {formatPhone(b.customer.phone)}
          </Button>
        )}
        <Button
          variant="outline"
          size="lg"
          className="h-auto min-h-12 justify-start py-2 text-left whitespace-normal"
          nativeButton={false}
          render={<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" />}
        >
          <MapPin className="shrink-0" /> {address}
        </Button>
      </div>

      <dl className="divide-y rounded-lg border">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 p-3 sm:grid-cols-[9rem_1fr]">
            <dt className="text-sm text-muted-foreground">{k}</dt>
            <dd className="font-medium break-words">{v}</dd>
          </div>
        ))}
      </dl>

      {b.status === "IN_PROGRESS" && (
        <>
          <ExtraChargeCard booking={b} />
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Visit notes</h2>
            <VisitForm booking={b} />
          </section>
        </>
      )}

      {b.status === "COMPLETED" && b.visit && <VisitSummary visit={b.visit} />}

      {(b.status === "IN_PROGRESS" || b.status === "COMPLETED") && (
        <div>
          <Button variant="outline" size="lg" className="h-12 w-full sm:w-fit" onClick={() => setFollowUp(true)}>
            <CalendarPlus /> Needs a second visit
          </Button>
        </div>
      )}

      <StatusBar booking={b} />
      <FollowUpDialog key={`f${followUp}`} booking={b} open={followUp} onOpenChange={setFollowUp} />
    </div>
  );
}
