"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { DateRangeFilter } from "@/components/common/date-range-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewCard } from "@/components/reviews/review-card";
import { Stars } from "@/components/reviews/stars";
import { useListParams } from "@/hooks/use-list-params";
import { useReviews } from "@/lib/queries/reviews";

const RATINGS = ["5", "4", "3", "2", "1"];

// Staff view of every customer review. Rating, dates and page live in the URL.
export function ReviewsList() {
  const { get, page, set } = useListParams();
  const rating = get("rating");
  const from = get("from");
  const to = get("to");
  const reviews = useReviews({ page, rating: rating || undefined, from: from || undefined, to: to || undefined });
  const data = reviews.data;

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-amber-400/15">
            <Star className="size-7 fill-amber-400 text-amber-400" aria-hidden />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums">{data?.average != null ? data.average.toFixed(1) : "—"}</span>
              <span className="text-sm text-muted-foreground">/ 5</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {data?.average != null && <Stars rating={Math.round(data.average)} />}
              <span>
                {data ? `${data.total} ${data.total === 1 ? "review" : "reviews"}` : "Loading…"}
                {(rating || from || to) && " matching filters"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by rating">
            <Button size="sm" variant={rating ? "outline" : "default"} aria-pressed={!rating} onClick={() => set({ rating: undefined })}>
              All
            </Button>
            {RATINGS.map((n) => (
              <Button key={n} size="sm" variant={rating === n ? "default" : "outline"} aria-pressed={rating === n} aria-label={`${n} stars`} onClick={() => set({ rating: rating === n ? undefined : n })}>
                {n}
                <Star className={rating === n ? "fill-current" : "fill-amber-400 text-amber-400"} aria-hidden />
              </Button>
            ))}
          </div>
          <DateRangeFilter id="reviews" from={from} to={to} onChange={set} />
        </div>
      </Card>

      {reviews.isPending ? (
        <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Loading">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : reviews.isError ? (
        <ErrorState error={reviews.error} onRetry={() => reviews.refetch()} />
      ) : reviews.data.items.length === 0 ? (
        <EmptyState
          icon={Star}
          title={from || to ? "No reviews on these days" : rating ? "No reviews with this rating" : "No reviews yet"}
          description={from || to || rating ? "Try other filters." : "Customers can rate a repair once it is completed."}
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {reviews.data.items.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
          <PaginationBar {...reviews.data} onPageChange={(p) => set({ page: p })} />
        </>
      )}
    </div>
  );
}
