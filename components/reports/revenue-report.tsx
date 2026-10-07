"use client";

import { Calculator, IndianRupee, Receipt } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationBar } from "@/components/common/pagination-bar";
import { Panel, StatCard } from "@/components/dashboard/stat-card";
import { formatINR, formatWeekdayDate } from "@/lib/format";
import { useRevenueReport, type ReportRange, type RevenueRow } from "@/lib/queries/reports";
import { cn } from "@/lib/utils";
import { Frame } from "./report-frame";

const GROUPS = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

// Which calendar days a row covers: a day, a week starting that Monday, or a month starting that day.
function periodLabel(period: string, groupBy: string) {
  const at = `${period}T00:00:00+05:30`;
  if (groupBy === "week") return `Week of ${formatWeekdayDate(at)}`;
  if (groupBy === "month") return new Date(at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", month: "long", year: "numeric" });
  return formatWeekdayDate(at);
}

// Keep the tooltip inside the chart: columns near an edge open it towards the middle.
const tooltipSide = (i: number, n: number) => (i < 2 ? "left-0" : i > n - 3 ? "right-0" : "left-1/2 -translate-x-1/2");

// One column per period on this page, oldest on the left. Hover or focus a column for its numbers.
function RevenueColumns({ rows, groupBy }: { rows: RevenueRow[]; groupBy: string }) {
  const ordered = [...rows].reverse();
  const max = Math.max(1, ...ordered.map((r) => Number(r.revenue)));
  const label = (r: RevenueRow) => `${periodLabel(r.period, groupBy)}: ${formatINR(r.revenue)} from ${r.payments} ${r.payments === 1 ? "payment" : "payments"}`;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-40 items-end gap-1 border-b" role="img" aria-label="Revenue per period">
        {ordered.map((r, i) => (
          <div key={r.period} tabIndex={0} aria-label={label(r)} className="group relative flex h-full max-w-16 flex-1 flex-col justify-end outline-none">
            <div className="w-full rounded-t-[4px] bg-primary/80 transition-colors group-hover:bg-primary group-focus-visible:bg-primary" style={{ height: `${Math.max(3, (Number(r.revenue) / max) * 100)}%` }} />
            <span className={cn("pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-sm group-hover:block group-focus-visible:block", tooltipSide(i, ordered.length))}>
              {label(r)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{periodLabel(ordered[0].period, groupBy)}</span>
        {ordered.length > 1 && <span>{periodLabel(ordered[ordered.length - 1].period, groupBy)}</span>}
      </div>
    </div>
  );
}

export function RevenueReport({ range, groupBy, onGroup, onPage }: { range: ReportRange; groupBy: string; onGroup: (g: string) => void; onPage: (p: number) => void }) {
  const q = useRevenueReport({ ...range, groupBy: groupBy as "day" | "week" | "month" });
  const t = q.data?.totals;
  const unit = GROUPS.find((g) => g.value === groupBy)?.label.toLowerCase() ?? "daily";

  return (
    <div className="flex flex-col gap-4">
      {t && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <StatCard title="Revenue" value={formatINR(t.revenue)} icon={IndianRupee} hint="Paid in this period" />
          <StatCard title="Payments" value={t.payments} icon={Receipt} hint="Marked paid" />
          <StatCard title="Average payment" value={t.payments ? formatINR(Number(t.revenue) / t.payments) : "—"} icon={Calculator} hint="Revenue ÷ payments" />
        </div>
      )}
      <Frame q={q} empty={q.data?.total === 0}>
        {q.data && (
          <>
            <Panel
              title={`Revenue, ${unit}`}
              action={
                <Tabs value={groupBy} onValueChange={(v) => onGroup((v as string) ?? "day")}>
                  <TabsList aria-label="Group revenue by">
                    {GROUPS.map((g) => (
                      <TabsTrigger key={g.value} value={g.value} className="px-2.5">
                        {g.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              }
            >
              <RevenueColumns rows={q.data.items} groupBy={groupBy} />
              {q.data.totalPages > 1 && <p className="text-xs text-muted-foreground">Chart shows the periods on this page.</p>}
            </Panel>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Payments</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data.items.map((r) => (
                    <TableRow key={r.period}>
                      <TableCell>{periodLabel(r.period, groupBy)}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.payments}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{formatINR(r.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <PaginationBar {...q.data} onPageChange={onPage} />
          </>
        )}
      </Frame>
    </div>
  );
}
