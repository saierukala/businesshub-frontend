"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/booking/date-picker";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { useListParams } from "@/hooks/use-list-params";
import { addDays, formatINR, formatTime, formatWeekdayDate, istDay } from "@/lib/format";
import { useBookingReport, useRevenueReport, useServiceReport, useTechnicianReport, type BreakdownRow, type ReportRange } from "@/lib/queries/reports";
import type { Page } from "@/lib/types";

const TABS = [
  { value: "bookings", label: "Bookings" },
  { value: "revenue", label: "Revenue" },
  { value: "services", label: "Services" },
  { value: "technicians", label: "Technicians" },
] as const;
type Tab = (typeof TABS)[number]["value"];

const GROUPS = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

// Which calendar days a row covers: a day, a week starting that Monday, or a month starting that day.
function periodLabel(period: string, groupBy: string) {
  const d = formatWeekdayDate(`${period}T00:00:00+05:30`);
  return groupBy === "week" ? `Week of ${d}` : groupBy === "month" ? new Date(`${period}T00:00:00+05:30`).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", month: "long", year: "numeric" }) : d;
}

type Query = { isPending: boolean; isError: boolean; error: Error | null; refetch: () => void };

// Loading, error and empty are the same for every report.
function Frame({ q, empty, children }: { q: Query; empty: boolean; children: React.ReactNode }) {
  if (q.isPending) return <ListSkeleton />;
  if (q.isError) return <ErrorState error={q.error!} onRetry={q.refetch} />;
  if (empty) return <EmptyState title="Nothing in this period" description="Try a wider date range." />;
  return <>{children}</>;
}

function BookingsTab({ range, onPage }: { range: ReportRange; onPage: (p: number) => void }) {
  const q = useBookingReport(range);
  const s = q.data?.summary;
  return (
    <div className="flex flex-col gap-4">
      {s && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard title="Total" value={s.total} />
          <StatCard title="Completed" value={s.completed} />
          <StatCard title="Cancelled" value={s.cancelled} />
          <StatCard title="No-show" value={s.noShow} />
          <StatCard title="Rescheduled" value={s.rescheduled} />
        </div>
      )}
      <Frame q={q} empty={q.data?.bookings.total === 0}>
        {q.data && (
          <>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead className="hidden md:table-cell">Technician</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data.bookings.items.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <Link href={`/staff/bookings/${b.id}`} className="font-medium hover:underline">
                          {b.bookingNumber}
                        </Link>
                        <div className="text-xs text-muted-foreground">{b.service.name}</div>
                      </TableCell>
                      <TableCell>{b.customer.name}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div>{formatWeekdayDate(b.startAt)}</div>
                        <div className="text-xs text-muted-foreground">{formatTime(b.startAt)}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{b.technician?.name ?? "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={b.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <PaginationBar {...q.data.bookings} onPageChange={onPage} />
          </>
        )}
      </Frame>
    </div>
  );
}

function RevenueTab({ range, groupBy, onGroup, onPage }: { range: ReportRange; groupBy: string; onGroup: (g: string) => void; onPage: (p: number) => void }) {
  const q = useRevenueReport({ ...range, groupBy: groupBy as "day" | "week" | "month" });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select items={GROUPS} value={groupBy} onValueChange={(v) => onGroup(v ?? "day")}>
          <SelectTrigger className="w-36" aria-label="Group revenue by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GROUPS.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {q.data && (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{formatINR(q.data.totals.revenue)}</span> from {q.data.totals.payments} {q.data.totals.payments === 1 ? "payment" : "payments"} in this period
          </p>
        )}
      </div>
      <Frame q={q} empty={q.data?.total === 0}>
        {q.data && (
          <>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
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

// Services and technicians share one table: the same counts per row.
function BreakdownTab({ q, label, withRating, onPage }: { q: Query & { data?: Page<BreakdownRow> }; label: string; withRating?: boolean; onPage: (p: number) => void }) {
  return (
    <Frame q={q} empty={q.data?.total === 0}>
      {q.data && (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{label}</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Completed</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Cancelled</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">No-show</TableHead>
                  {withRating && <TableHead className="text-right">Rating</TableHead>}
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.data.items.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.bookings}</TableCell>
                    <TableCell className="hidden text-right tabular-nums sm:table-cell">{r.completed}</TableCell>
                    <TableCell className="hidden text-right tabular-nums sm:table-cell">{r.cancelled}</TableCell>
                    <TableCell className="hidden text-right tabular-nums sm:table-cell">{r.noShow}</TableCell>
                    {withRating && <TableCell className="text-right tabular-nums">{r.avgRating ? r.avgRating.toFixed(1) : "—"}</TableCell>}
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
  );
}

function ServicesTab({ range, onPage }: { range: ReportRange; onPage: (p: number) => void }) {
  return <BreakdownTab q={useServiceReport(range)} label="Service" onPage={onPage} />;
}
function TechniciansTab({ range, onPage }: { range: ReportRange; onPage: (p: number) => void }) {
  return <BreakdownTab q={useTechnicianReport(range)} label="Technician" withRating onPage={onPage} />;
}

// Reports for Owner and Manager. Tab, dates, grouping and page live in the URL, so a view can be shared or reloaded.
export function ReportsView() {
  const { get, page, set } = useListParams();
  const tab = (TABS.find((t) => t.value === get("tab"))?.value ?? "bookings") as Tab;
  const from = get("from");
  const to = get("to");
  const today = istDay();
  const range: ReportRange = { from: from || undefined, to: to || undefined, page };
  const onPage = (p: number) => set({ page: p });

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={(v) => set({ tab: v as string, page: undefined })}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <DatePicker id="report-from" value={from} min={addDays(today, -3650)} max={to || today} onChange={(d) => set({ from: d })} />
        <span className="hidden text-muted-foreground sm:inline">to</span>
        <DatePicker id="report-to" value={to} min={from || addDays(today, -3650)} max={today} onChange={(d) => set({ to: d })} />
        {(from || to) && (
          <Button variant="ghost" onClick={() => set({ from: undefined, to: undefined })}>
            Clear
          </Button>
        )}
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        {from || to ? "Days are in India time (IST), both included." : "Showing the last 30 days. Pick dates to change it."}
      </p>

      {tab === "bookings" && <BookingsTab range={range} onPage={onPage} />}
      {tab === "revenue" && <RevenueTab range={range} groupBy={get("groupBy") || "day"} onGroup={(g) => set({ groupBy: g })} onPage={onPage} />}
      {tab === "services" && <ServicesTab range={range} onPage={onPage} />}
      {tab === "technicians" && <TechniciansTab range={range} onPage={onPage} />}
    </div>
  );
}
