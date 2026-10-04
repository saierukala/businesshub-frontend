import { Star } from "lucide-react";

// Read-only star rating.
export function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={i < rating ? "size-4 fill-amber-400 text-amber-400" : "size-4 text-muted-foreground/40"} />
      ))}
    </span>
  );
}
