"use client";

import Link from "next/link";
import { CalendarDays, CalendarPlus, CircleCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { DateRangeFilter } from "@/components/common/date-range-filter";
import { CustomerFilter, TechnicianFilter } from "@/components/booking/person-filters";
import { BookingsTable } from "@/components/booking/bookings-table";
import { CustomerBookings } from "@/components/booking/customer-bookings";
import { ReassignmentQueue } from "@/components/booking/reassignment-queue";
import { STATUS_OPTIONS } from "@/components/status-badge";
import { useBookings } from "@/lib/queries/bookings";
import { useListParams } from "@/hooks/use-list-params";

const FILTERS = [{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS];
// Staff also get "past, still open": the visit time is over but nobody closed the booking.
const PAST_OPEN = "PAST_OPEN";
const STAFF_FILTERS = [...FILTERS, { value: PAST_OPEN, label: "Past, still open" }];

// customer = the logged-in customer's own bookings. staff = everyone's (adds customer and technician columns).
// queue = staff "Needs reassignment" queue: only flagged bookings, earliest visit first.
export function BookingsList({ staff = false, queue = false }: { staff?: boolean; queue?: boolean }) {
  const { get, page, set } = useListParams();
  const status = get("status");
  const from = get("from");
  const to = get("to");
  const customerId = staff ? get("customerId") : "";
  const technicianId = staff ? get("technicianId") : "";
  const filtered = !!(from || to || customerId || technicianId);
  const pastOpen = staff && status === PAST_OPEN;
  const filters = staff ? STAFF_FILTERS : FILTERS;
  const bookings = useBookings({
    page,
    ...(pastOpen ? { pastOpen: true, sort: "soonest" as const } : { status: status || undefined }),
    ...(queue && { needsReassignment: true, sort: "soonest" as const }),
    customerId: customerId || undefined,
    technicianId: technicianId || undefined,
    from: from || undefined, // visit day, IST
    to: to || undefined,
  });
  const base = staff ? "/staff/bookings" : "/bookings";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {!queue && (
          <Select items={filters} value={status || "all"} onValueChange={(v) => set({ status: v === "all" ? undefined : (v ?? undefined) })}>
            <SelectTrigger className="sm:w-48" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filters.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {staff && (
          <>
            <CustomerFilter id={customerId} onChange={(id) => set({ customerId: id })} />
            <TechnicianFilter id={technicianId} onChange={(id) => set({ technicianId: id })} />
          </>
        )}
        {/* Bookings can be up to a year ahead, so the range may run into the future. */}
        <DateRangeFilter id="bookings" from={from} to={to} futureDays={365} onChange={set} />
        <div className="sm:ml-auto">
          {queue ? (
            bookings.data && bookings.data.total > 0 && (
              <span className="text-sm font-medium text-destructive">
                {bookings.data.total} {bookings.data.total === 1 ? "booking" : "bookings"} waiting
              </span>
            )
          ) : (
            <Link href={staff ? "/staff/bookings/new" : "/book"} className={buttonVariants()}>
              <CalendarPlus /> {staff ? "New booking" : "Book a repair"}
            </Link>
          )}
        </div>
      </div>

      {bookings.isPending ? (
        <ListSkeleton />
      ) : bookings.isError ? (
        <ErrorState error={bookings.error} onRetry={() => bookings.refetch()} />
      ) : bookings.data.items.length === 0 ? (
        <EmptyState
          title={filtered ? "No bookings match these filters" : queue ? "Nothing needs reassignment" : pastOpen ? "Every past visit is closed" : status ? "No bookings with this status" : "No bookings yet"}
          description={
            filtered
              ? "Try other filters, or clear them."
              : queue
                ? "When a technician takes time off, their bookings for those days show up here."
                : status
                  ? "Try another status."
                  : "Your repair bookings will show up here."
          }
          icon={queue && !filtered ? CircleCheck : CalendarDays}
          action={
            !staff &&
            !filtered &&
            !status && (
              <Link href="/book" className={buttonVariants()}>
                <CalendarPlus /> Book a repair
              </Link>
            )
          }
        />
      ) : (
        <>
          {queue ? (
            <ReassignmentQueue items={bookings.data.items} />
          ) : staff ? (
            <BookingsTable items={bookings.data.items} base={base} staff />
          ) : (
            <CustomerBookings items={bookings.data.items} />
          )}
          <PaginationBar {...bookings.data} onPageChange={(p) => set({ page: p })} />
        </>
      )}
    </div>
  );
}
