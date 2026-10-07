"use client";

import { Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationBar } from "@/components/common/pagination-bar";
import { formatINR } from "@/lib/format";
import { useServiceReport, useTechnicianReport, type BreakdownRow, type ReportRange } from "@/lib/queries/reports";
import type { Page } from "@/lib/types";
import { Frame, pct, type Query } from "./report-frame";

// A thin bar under a number, sized against the biggest value on the page.
function Share({ value, max }: { value: number; max: number }) {
  return (
    <div className="mt-1 ml-auto h-1 w-20 rounded-full bg-muted" role="presentation">
      <div className="h-1 rounded-full bg-primary" style={{ width: `${value > 0 && max > 0 ? Math.max(2, (value / max) * 100) : 0}%` }} />
    </div>
  );
}

// Services and technicians share one table: the same counts per row, busiest first (the API's order).
function BreakdownTable({ q, label, withRating, onPage }: { q: Query & { data?: Page<BreakdownRow> }; label: string; withRating?: boolean; onPage: (p: number) => void }) {
  const rows = q.data?.items ?? [];
  const maxBookings = Math.max(0, ...rows.map((r) => r.bookings));
  const maxRevenue = Math.max(0, ...rows.map((r) => Number(r.revenue)));
  const offset = q.data ? (q.data.page - 1) * q.data.pageSize : 0;

  return (
    <Frame q={q} empty={q.data?.total === 0}>
      {q.data && (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead>{label}</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Completed</TableHead>
                  <TableHead className="hidden text-right md:table-cell">Cancelled</TableHead>
                  <TableHead className="hidden text-right md:table-cell">No-show</TableHead>
                  {withRating && <TableHead className="text-right">Rating</TableHead>}
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-center text-muted-foreground tabular-nums">{offset + i + 1}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.bookings}
                      <Share value={r.bookings} max={maxBookings} />
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums sm:table-cell">
                      {r.completed}
                      <div className="text-xs text-muted-foreground">{pct(r.completed, r.bookings)}</div>
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums md:table-cell">{r.cancelled}</TableCell>
                    <TableCell className={`hidden text-right tabular-nums md:table-cell ${r.noShow > 0 ? "text-red-600 dark:text-red-400" : ""}`}>{r.noShow}</TableCell>
                    {withRating && (
                      <TableCell className="text-right tabular-nums">
                        {r.avgRating ? (
                          <span className="inline-flex items-center gap-1">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            {r.avgRating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatINR(r.revenue)}
                      <Share value={Number(r.revenue)} max={maxRevenue} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationBar {...q.data} onPageChange={onPage} />
        </>
      )}
    </Frame>
  );
}

export function ServicesReport({ range, onPage }: { range: ReportRange; onPage: (p: number) => void }) {
  return <BreakdownTable q={useServiceReport(range)} label="Service" onPage={onPage} />;
}
export function TechniciansReport({ range, onPage }: { range: ReportRange; onPage: (p: number) => void }) {
  return <BreakdownTable q={useTechnicianReport(range)} label="Technician" withRating onPage={onPage} />;
}
