import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

// Small charts built from plain divs: no chart library for a handful of numbers.
// One series each, so one colour (primary) and no legend; the panel title names it.

// Horizontal bars sized by count, value printed at the end of each bar.
export function Bars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,8rem)_1fr_2rem] items-center gap-3 text-sm">
          <span className="truncate text-muted-foreground">{r.label}</span>
          <div className="h-2 rounded-full bg-muted" role="presentation">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </div>
          <span className="text-right font-medium tabular-nums">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

// Keep the tooltip inside the chart: bars near an edge open it towards the middle.
const tooltipSide = (i: number, n: number) => (i < 3 ? "left-0" : i > n - 4 ? "right-0" : "left-1/2 -translate-x-1/2");

// Bookings made per day. Hover (or focus) a day to see its date and count.
export function Trend({ days }: { days: { date: string; count: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const label = (d: { date: string; count: number }) => `${formatDate(`${d.date}T12:00:00+05:30`)}: ${d.count} ${d.count === 1 ? "booking" : "bookings"}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-28 items-end gap-1 border-b" role="img" aria-label={`Bookings made per day, last ${days.length} days`}>
        {days.map((d, i) => (
          <div key={d.date} tabIndex={0} aria-label={label(d)} className="group relative flex h-full flex-1 flex-col justify-end outline-none">
            <div
              className="w-full rounded-t-[4px] bg-primary/80 transition-colors group-hover:bg-primary group-focus-visible:bg-primary"
              style={{ height: `${d.count ? Math.max(6, (d.count / max) * 100) : 2}%` }}
            />
            <span className={cn("pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-sm group-hover:block group-focus-visible:block", tooltipSide(i, days.length))}>
              {label(d)}
            </span>
          </div>
        ))}
      </div>
      {days.length > 0 && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatDate(`${days[0].date}T12:00:00+05:30`)}</span>
          <span>{formatDate(`${days[days.length - 1].date}T12:00:00+05:30`)}</span>
        </div>
      )}
    </div>
  );
}
