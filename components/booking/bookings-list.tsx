"use client";

import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { StatusBadge, STATUS_OPTIONS } from "@/components/status-badge";
import { useBookings } from "@/lib/queries/bookings";
import { useListParams } from "@/hooks/use-list-params";
import { formatTime, formatWeekdayDate } from "@/lib/format";
import type { BookingStatus } from "@/lib/types";

const FILTERS = [{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS];

// customer = the logged-in customer's own bookings. staff = everyone's (adds customer and technician columns).
// queue = staff "Needs reassignment" queue: only flagged bookings, earliest visit first.
export function BookingsList({ staff = false, queue = false }: { staff?: boolean; queue?: boolean }) {
  const { get, page, set } = useListParams();
  const status = get("status");
  const bookings = useBookings({
    page,
    status: status || undefined,
    ...(queue && { needsReassignment: true, sort: "soonest" as const }),
  });
  const base = staff ? "/staff/bookings" : "/bookings";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {!queue && (
          <Select items={FILTERS} value={status || "all"} onValueChange={(v) => set({ status: v === "all" ? undefined : (v ?? undefined) })}>
            <SelectTrigger className="sm:w-48" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="sm:ml-auto">
          <Button nativeButton={false} render={<Link href={staff ? "/staff/bookings/new" : "/book"} />}>
            <CalendarPlus /> {staff ? "New booking" : "Book a repair"}
          </Button>
        </div>
      </div>

      {bookings.isPending ? (
        <ListSkeleton />
      ) : bookings.isError ? (
        <ErrorState error={bookings.error} onRetry={() => bookings.refetch()} />
      ) : bookings.data.items.length === 0 ? (
        <EmptyState
          title={queue ? "Nothing needs reassignment" : status ? "No bookings with this status" : "No bookings yet"}
          description={
            queue
              ? "When a technician takes time off, their bookings for those days show up here."
              : status
                ? "Try another status."
                : "Your repair bookings will show up here."
          }
        />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  {staff && <TableHead>Customer</TableHead>}
                  <TableHead>When</TableHead>
                  <TableHead className="hidden md:table-cell">Appliance</TableHead>
                  {staff && <TableHead className="hidden md:table-cell">Technician</TableHead>}
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.data.items.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Link href={`${base}/${b.id}`} className="font-medium hover:underline">
                        {b.bookingNumber}
                      </Link>
                      <div className="text-xs text-muted-foreground">{b.service.name}</div>
                    </TableCell>
                    {staff && <TableCell>{b.customer.name}</TableCell>}
                    <TableCell className="whitespace-nowrap">
                      <div>{formatWeekdayDate(b.startAt)}</div>
                      <div className="text-xs text-muted-foreground">{formatTime(b.startAt)}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {b.appliance.brand} {b.appliance.category.name}
                    </TableCell>
                    {staff && <TableCell className="hidden md:table-cell">{b.technician?.name ?? "—"}</TableCell>}
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={b.status as BookingStatus} />
                        {staff && b.needsReassignment && <span className="text-xs font-medium text-destructive">Needs new technician</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationBar {...bookings.data} onPageChange={(p) => set({ page: p })} />
        </>
      )}
    </div>
  );
}
