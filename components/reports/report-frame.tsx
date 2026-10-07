import { ChartColumn } from "lucide-react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";

export type Query = { isPending: boolean; isError: boolean; error: Error | null; refetch: () => void };

// Loading, error and empty are the same for every report.
export function Frame({ q, empty, children }: { q: Query; empty: boolean; children: React.ReactNode }) {
  if (q.isPending) return <ListSkeleton />;
  if (q.isError) return <ErrorState error={q.error!} onRetry={q.refetch} />;
  if (empty) return <EmptyState icon={ChartColumn} title="Nothing in this period" description="Try a wider date range or another preset." />;
  return <>{children}</>;
}

// "62%" of a whole; "—" when there is nothing to divide by.
export const pct = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—");
