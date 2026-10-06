"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { statusLabel } from "@/components/status-badge";
import { formatSlot } from "@/lib/format";
import type { BookingDetail, BookingStatus } from "@/lib/types";

// Statuses that should be closed by now if the visit time is over (same list as the API's "pastOpen").
const OPEN_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "ASSIGNED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"];

// What staff can do, per status (the allowed transitions, spec section 5).
const NEXT_STEP: Partial<Record<BookingStatus, string>> = {
  PENDING: "Reschedule it to a new time, or cancel it with a reason.",
  CONFIRMED: "Reschedule it to a new time, or cancel it with a reason.",
  ASSIGNED: "Reschedule it to a new time, or mark it as a no-show if the customer was not there.",
  EN_ROUTE: "Ask the technician to update the visit in their app, or mark it as a no-show.",
  ARRIVED: "Ask the technician to start or finish the visit in their app, or mark it as a no-show.",
  IN_PROGRESS: "The work was started but never completed: ask the technician to complete it and record the payment.",
};

// Staff only: a booking whose visit time is over but which was never closed. Nothing closes it automatically.
export function PastOpenAlert({ booking }: { booking: BookingDetail }) {
  const [now] = useState(() => Date.now());
  if (!OPEN_STATUSES.includes(booking.status) || new Date(booking.endAt).getTime() > now) return null;

  return (
    <Alert className="border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10">
      <History />
      <AlertTitle>This visit&apos;s time has passed, but it is still {statusLabel(booking.status)}</AlertTitle>
      <AlertDescription>
        It was due {formatSlot(booking.startAt, booking.endAt)}. {NEXT_STEP[booking.status]}
      </AlertDescription>
    </Alert>
  );
}
