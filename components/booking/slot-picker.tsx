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

// Hour of the day in India time (0-23), only to group the buttons. The times themselves come from the API.
const istHourFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false });
const PARTS = [
  { label: "Morning", from: 0, to: 12 },
  { label: "Afternoon", from: 12, to: 16 },
  { label: "Evening", from: 16, to: 24 },
];

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
        <div className="flex flex-col gap-4" role="radiogroup" aria-label="Available times">
          <p className="text-sm font-medium">
            {formatWeekdayDate(slots[0].startAt)} · {slots.length} free {slots.length === 1 ? "time" : "times"}
          </p>
          {PARTS.map((part) => {
            const inPart = slots.filter((s) => {
              const h = Number(istHourFmt.format(new Date(s.startAt)));
              return h >= part.from && h < part.to;
            });
            if (inPart.length === 0) return null;
            return (
              <div key={part.label} className="flex flex-col gap-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{part.label}</p>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2">
                  {inPart.map((s) => {
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
            );
          })}
        </div>
      )}
    </div>
  );
}
