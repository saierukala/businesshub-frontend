"use client";

import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "@/components/common/date-range-filter";
import { addDays, formatDate, istDay } from "@/lib/format";

type Range = { from?: string; to?: string };

// Quick ranges, all IST calendar days. "Last 30 days" is the API default, so it sends no dates.
function presets(today: string): { label: string; range: Range }[] {
  const firstOfMonth = `${today.slice(0, 8)}01`;
  const lastMonthEnd = addDays(firstOfMonth, -1);
  return [
    { label: "Last 7 days", range: { from: addDays(today, -6), to: today } },
    { label: "Last 30 days", range: {} },
    { label: "This month", range: { from: firstOfMonth, to: today } },
    { label: "Last month", range: { from: `${lastMonthEnd.slice(0, 8)}01`, to: lastMonthEnd } },
    { label: "Last 90 days", range: { from: addDays(today, -89), to: today } },
    { label: "This year", range: { from: `${today.slice(0, 4)}-01-01`, to: today } },
  ];
}

const day = (d: string) => formatDate(`${d}T12:00:00+05:30`);

// Preset chips, custom dates, and a line saying exactly which days are counted.
export function ReportFilters({ from, to, onChange }: { from: string; to: string; onChange: (r: Range) => void }) {
  const today = istDay();
  // Same defaults as the API: no end = today, no start = 30 days ending on the end day.
  const shownTo = to || today;
  const shownFrom = from || addDays(shownTo, -29);

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick date ranges">
        {presets(today).map((p) => {
          const active = (p.range.from ?? "") === from && (p.range.to ?? "") === to;
          return (
            <Button key={p.label} size="sm" variant={active ? "default" : "outline"} aria-pressed={active} onClick={() => onChange({ from: p.range.from, to: p.range.to })}>
              {p.label}
            </Button>
          );
        })}
      </div>
      <DateRangeFilter id="report" from={from} to={to} onChange={onChange} />
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarRange className="size-3.5" />
        <span>
          <span className="font-medium text-foreground">
            {day(shownFrom)} – {day(shownTo)}
          </span>{" "}
          · India time (IST), both days included
        </span>
      </p>
    </div>
  );
}
