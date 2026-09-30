"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { DatePicker } from "./date-picker";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { useAvailability } from "@/lib/queries/bookings";
import { addDays, formatTime, formatWeekdayDate, istDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SlotOption } from "@/lib/types";

type Props = {
  serviceId: string;
  area: string;
  date: string; // YYYY-MM-DD in IST, "" until chosen
  slot?: SlotOption;
  onChange: (date: string, slot: SlotOption | undefined) => void;
  maxDaysAhead?: number;
  // Rescheduling: the booking being moved. Its own time does not block other slots,
  // and its current start is not offered again.
  reschedule?: { bookingId: string; currentStartAt: string };
};

// Pick a day, then one of the start times the BACKEND says are free. The browser never works out
// availability, working hours or the cutoff itself (it only limits the calendar to a sensible range).
export function SlotPicker({ serviceId, area, date, slot, onChange, maxDaysAhead = 30, reschedule }: Props) {
  const today = useMemo(() => istDay(), []);
  const availability = useAvailability({ serviceId, date: date || undefined, area, excludeBookingId: reschedule?.bookingId });
  const slots = availability.data?.slots.filter((s) => s.startAt !== reschedule?.currentStartAt) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="booking-date">Date</FieldLabel>
        <DatePicker
          id="booking-date"
          value={date}
          min={today}
          max={addDays(today, maxDaysAhead)}
          onChange={(day) => onChange(day, undefined)}
        />
        <FieldDescription>Times are India time (IST).</FieldDescription>
      </Field>

      {!date ? (
        <p className="text-sm text-muted-foreground">Choose a date to see the free times.</p>
      ) : availability.isPending ? (
        <ListSkeleton rows={2} />
      ) : availability.isError ? (
        <ErrorState error={availability.error} onRetry={() => availability.refetch()} />
      ) : slots.length === 0 ? (
        <EmptyState title="No free times on this day" description="Try another date." />
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{formatWeekdayDate(slots[0].startAt)}</p>
          <div role="radiogroup" aria-label="Available times" className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {slots.map((s) => {
              const selected = slot?.startAt === s.startAt;
              return (
                <Button
                  key={s.startAt}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  variant={selected ? "default" : "outline"}
                  className={cn("h-11 px-2")}
                  onClick={() => onChange(date, s)}
                >
                  {formatTime(s.startAt)}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
