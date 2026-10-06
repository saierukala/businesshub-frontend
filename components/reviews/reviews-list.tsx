"use client";

import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { DateRangeFilter } from "@/components/common/date-range-filter";
import { Stars } from "@/components/reviews/stars";
import { useListParams } from "@/hooks/use-list-params";
import { formatDate } from "@/lib/format";
import { useReviews } from "@/lib/queries/reviews";

const FILTERS = [
  { value: "all", label: "All ratings" },
  ...[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} ${n === 1 ? "star" : "stars"}` })),
];

// Staff view of every customer review. Rating filter and page live in the URL.
export function ReviewsList() {
  const { get, page, set } = useListParams();
  const rating = get("rating");
  const from = get("from");
  const to = get("to");
  const reviews = useReviews({ page, rating: rating || undefined, from: from || undefined, to: to || undefined });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select items={FILTERS} value={rating || "all"} onValueChange={(v) => set({ rating: v === "all" ? undefined : (v ?? undefined) })}>
          <SelectTrigger className="sm:w-48" aria-label="Filter by rating">
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
        <DateRangeFilter id="reviews" from={from} to={to} onChange={set} />
        {reviews.data?.average != null && (
          <p className="text-sm text-muted-foreground">
            Average <span className="font-semibold text-foreground">{reviews.data.average.toFixed(1)}</span> from {reviews.data.total} {reviews.data.total === 1 ? "review" : "reviews"}
          </p>
        )}
      </div>

      {reviews.isPending ? (
        <ListSkeleton />
      ) : reviews.isError ? (
        <ErrorState error={reviews.error} onRetry={() => reviews.refetch()} />
      ) : reviews.data.items.length === 0 ? (
        <EmptyState
          title={from || to ? "No reviews on these days" : rating ? "No reviews with this rating" : "No reviews yet"}
          description={from || to || rating ? "Try other filters." : "Customers can rate a repair once it is completed."}
        />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rating</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Technician</TableHead>
                  <TableHead>Booking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.data.items.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="align-top">
                      <Stars rating={r.rating} />
                      <div className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</div>
                    </TableCell>
                    <TableCell className="max-w-72 align-top whitespace-normal">
                      <div>{r.customer}</div>
                      {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                    </TableCell>
                    <TableCell className="hidden align-top md:table-cell">{r.technician?.name ?? "—"}</TableCell>
                    <TableCell className="align-top">
                      <Link href={`/staff/bookings/${r.booking.id}`} className="font-medium hover:underline">
                        {r.booking.bookingNumber}
                      </Link>
                      <div className="text-xs text-muted-foreground">{r.booking.service}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationBar {...reviews.data} onPageChange={(p) => set({ page: p })} />
        </>
      )}
    </div>
  );
}
