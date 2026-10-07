import Link from "next/link";
import { ArrowUpRight, Quote, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Stars } from "@/components/reviews/stars";
import { formatDate, initials } from "@/lib/format";
import type { ReviewRow } from "@/lib/queries/reviews";
import { cn } from "@/lib/utils";

// One review for the staff list. Ratings of 2 or less get a red edge so they stand out.
export function ReviewCard({ review: r }: { review: ReviewRow }) {
  const name = r.customer ?? "Customer";
  return (
    <Card className={cn("gap-3 border-l-4 p-4", r.rating <= 2 ? "border-l-destructive" : r.rating === 3 ? "border-l-amber-400" : "border-l-emerald-500")}>
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">{initials(name)}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</div>
        </div>
        <Stars rating={r.rating} />
      </div>

      {r.comment ? (
        <blockquote className="relative rounded-md bg-muted/50 px-3 py-2 pl-8 text-sm whitespace-pre-line">
          <Quote className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground/60" aria-hidden />
          {r.comment}
        </blockquote>
      ) : (
        <p className="text-sm text-muted-foreground italic">No comment left.</p>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Wrench className="size-3.5" aria-hidden />
          {r.technician?.name ?? "No technician"}
        </span>
        <Link href={`/staff/bookings/${r.booking.id}`} className="group inline-flex items-center gap-1 font-medium hover:underline">
          {r.booking.bookingNumber}
          <span className="font-normal text-muted-foreground">· {r.booking.service}</span>
          <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-foreground" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}
