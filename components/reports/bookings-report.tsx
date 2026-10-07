"use client";

import Link from "next/link";
import { CircleCheck, CircleX, ClipboardList, Repeat, UserX } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationBar } from "@/components/common/pagination-bar";
import { Panel, StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { formatTime, formatWeekdayDate } from "@/lib/format";
import { useBookingReport, type BookingReport, type ReportRange } from "@/lib/queries/reports";
import { Frame, pct } from "./report-frame";

// How the period's bookings ended up, as one bar. "Open" is everything not yet finished.
function StatusMix({ s }: { s: BookingReport["summary"] }) {
  const parts = [
    { label: "Completed", value: s.completed, color: "bg-green-500" },
    { label: "Open", value: Math.max(0, s.total - s.completed - s.cancelled - s.noShow), color: "bg-blue-500" },
    { label: "Cancelled", value: s.cancelled, color: "bg-muted-foreground/40" },
    { label: "No-show", value: s.noShow, color: "bg-red-500" },
  ];
  return (
    <Panel title="Status mix">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label={parts.map((p) => `${p.label} ${p.value}`).join(", ")}>
        {parts.map((p) => p.value > 0 && <div key={p.label} className={p.color} style={{ width: `${(p.value / s.total) * 100}%` }} />)}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-1.5">
            <span className={`size-2.5 rounded-full ${p.color}`} />
            <span className="text-muted-foreground">{p.label}</span>
            <span className="font-medium tabular-nums">{p.value}</span>
            <span className="text-xs text-muted-foreground tabular-nums">({pct(p.value, s.total)})</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function BookingsReport({ range, onPage }: { range: ReportRange; onPage: (p: number) => void }) {
  const q = useBookingReport(range);
  const s = q.data?.summary;
  return (
    <div className="flex flex-col gap-4">
      {s && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard title="Total" value={s.total} icon={ClipboardList} hint="Visits in this period" />
          <StatCard title="Completed" value={s.completed} icon={CircleCheck} hint={`${pct(s.completed, s.total)} of bookings`} />
          <StatCard title="Cancelled" value={s.cancelled} icon={CircleX} hint={`${pct(s.cancelled, s.total)} of bookings`} />
          <StatCard title="No-show" value={s.noShow} icon={UserX} hint={`${pct(s.noShow, s.total)} of bookings`} />
          <StatCard title="Rescheduled" value={s.rescheduled} icon={Repeat} hint={`${pct(s.rescheduled, s.total)} of bookings`} />
        </div>
      )}
      {s && s.total > 0 && <StatusMix s={s} />}
      <Frame q={q} empty={q.data?.bookings.total === 0}>
        {q.data && (
          <>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
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
                      <TableCell className="hidden md:table-cell">{b.technician?.name ?? <span className="text-muted-foreground">Not assigned</span>}</TableCell>
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
