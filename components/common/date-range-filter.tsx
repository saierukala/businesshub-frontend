"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/booking/date-picker";
import { addDays, istDay } from "@/lib/format";

type Props = {
  id: string; // prefix for the two pickers' ids
  from: string; // "YYYY-MM-DD" IST day, "" = open start
  to: string;
  onChange: (range: { from?: string; to?: string }) => void;
  futureDays?: number; // how far ahead a day can be picked (bookings have future visits); 0 = up to today
};

// "From [date] to [date] · Clear dates". The days are IST calendar days, both included; the API does the filtering.
// The pickers stop you choosing an end before the start.
export function DateRangeFilter({ id, from, to, onChange, futureDays = 0 }: Props) {
  const today = istDay();
  const earliest = addDays(today, -3650);
  const latest = addDays(today, futureDays);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <DatePicker id={`${id}-from`} placeholder="From" value={from} min={earliest} max={to || latest} onChange={(d) => onChange({ from: d })} />
      <span className="hidden text-muted-foreground sm:inline">to</span>
      <DatePicker id={`${id}-to`} placeholder="To" value={to} min={from || earliest} max={latest} onChange={(d) => onChange({ to: d })} />
      {(from || to) && (
        <Button variant="ghost" onClick={() => onChange({ from: undefined, to: undefined })}>
          Clear dates
        </Button>
      )}
    </div>
  );
}
