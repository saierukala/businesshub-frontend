"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { TextareaField } from "@/components/form/textarea-field";
import { Stars } from "@/components/reviews/stars";
import { showApiError } from "@/lib/form";
import { formatDate } from "@/lib/format";
import { useCreateReview } from "@/lib/queries/reviews";
import { reviewSchema, type ReviewValues } from "@/lib/schemas/review";
import { cn } from "@/lib/utils";
import type { BookingDetail } from "@/lib/types";

const WORDS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

function ReviewForm({ bookingId }: { bookingId: string }) {
  const create = useCreateReview(bookingId);
  const form = useForm<ReviewValues>({ resolver: zodResolver(reviewSchema), mode: "onTouched", defaultValues: { comment: "" } });

  function onSubmit(v: ReviewValues) {
    create.mutate(
      { rating: v.rating, comment: v.comment || undefined },
      { onSuccess: () => toast.success("Thanks for your review"), onError: (err) => showApiError(form, err) },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 rounded-lg border p-4">
      <FormAlert message={form.formState.errors.root?.server?.message} />
      <Controller
        control={form.control}
        name="rating"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel id="rating-label">How was the repair?</FieldLabel>
            <div role="radiogroup" aria-labelledby="rating-label" className="flex items-center gap-1">
              {WORDS.map((word, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={field.value === n}
                    aria-label={`${n} ${n === 1 ? "star" : "stars"}, ${word}`}
                    onClick={() => field.onChange(n)}
                    className="flex size-11 items-center justify-center rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <Star className={cn("size-7", field.value >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />
                  </button>
                );
              })}
              {field.value > 0 && <span className="ml-2 text-sm text-muted-foreground">{WORDS[field.value - 1]}</span>}
            </div>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <TextareaField control={form.control} name="comment" label="Comment (optional)" rows={3} maxLength={1000} placeholder="Tell us what went well or what we can improve" />
      <SubmitButton pending={create.isPending}>Submit review</SubmitButton>
    </form>
  );
}

// After a completed repair: the customer rates it once; staff and everyone else just see the rating.
// Whether a review is allowed is decided by the API (completed, own booking, not reviewed yet); we only hide the form.
export function ReviewSection({ booking, canReview }: { booking: BookingDetail; canReview: boolean }) {
  if (booking.status !== "COMPLETED") return null;

  if (booking.review) {
    const r = booking.review;
    return (
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{canReview ? "Your review" : "Customer review"}</h2>
        <div className="flex flex-col gap-1 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Stars rating={r.rating} />
            <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span>
          </div>
          {r.comment && <p>{r.comment}</p>}
        </div>
      </section>
    );
  }

  if (!canReview) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Rate this repair</h2>
      <ReviewForm bookingId={booking.id} />
    </section>
  );
}
