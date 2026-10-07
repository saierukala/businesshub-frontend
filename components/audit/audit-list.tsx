"use client";

import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangeFilter } from "@/components/common/date-range-filter";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { useListParams } from "@/hooks/use-list-params";
import { addDays, formatWeekdayDate, istDay } from "@/lib/format";
import { useAuditActions, useAuditLogs, type AuditEntry as Entry } from "@/lib/queries/audit";
import { AuditEntry, pretty } from "./audit-entry";

// Entries arrive newest first; group them by their IST day ("Today", "Yesterday", "Mon, 5 Oct 2026").
function byDay(items: Entry[]) {
  const today = istDay();
  const yesterday = addDays(today, -1);
  const groups: { day: string; label: string; items: Entry[] }[] = [];
  for (const a of items) {
    const day = istDay(new Date(a.createdAt));
    let g = groups.at(-1);
    if (g?.day !== day) {
      g = { day, label: day === today ? "Today" : day === yesterday ? "Yesterday" : formatWeekdayDate(a.createdAt), items: [] };
      groups.push(g);
    }
    g.items.push(a);
  }
  return groups;
}

// Owner only. Filters (action, dates) and page live in the URL.
export function AuditList() {
  const { get, page, set } = useListParams();
  const action = get("action");
  const from = get("from");
  const to = get("to");
  const filtered = !!(action || from || to);
  const actions = useAuditActions();
  const logs = useAuditLogs({ page, action: action || undefined, from: from || undefined, to: to || undefined });
  const options = [{ value: "all", label: "All actions" }, ...(actions.data ?? []).map((a) => ({ value: a, label: pretty(a) }))];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Select items={options} value={action || "all"} onValueChange={(v) => set({ action: v === "all" ? undefined : (v ?? undefined) })}>
          <SelectTrigger className="sm:w-56" aria-label="Filter by action">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangeFilter id="audit" from={from} to={to} onChange={set} />
        {filtered && (
          <Button variant="ghost" size="sm" onClick={() => set({ action: undefined, from: undefined, to: undefined })}>
            Clear filters
          </Button>
        )}
        {logs.data && (
          <span className="text-sm text-muted-foreground sm:ml-auto">
            {logs.data.total} {logs.data.total === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>

      {logs.isPending ? (
        <ListSkeleton />
      ) : logs.isError ? (
        <ErrorState error={logs.error} onRetry={() => logs.refetch()} />
      ) : logs.data.items.length === 0 ? (
        <EmptyState icon={ScrollText} title="No entries" description={filtered ? "Nothing matches these filters." : "Actions will show up here as people use the app."} />
      ) : (
        <>
          <div className="flex flex-col gap-5">
            {byDay(logs.data.items).map((g) => (
              <section key={g.day} aria-label={g.label}>
                <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{g.label}</h2>
                {/* The vertical line behind the icons turns the day into a timeline. */}
                <ol className="relative overflow-hidden py-1 rounded-xl bg-card ring-1 ring-foreground/10 before:absolute before:top-0 before:bottom-0 before:left-[2.125rem] before:w-px before:bg-border">
                  {g.items.map((a) => (
                    <AuditEntry key={a.id} a={a} />
                  ))}
                </ol>
              </section>
            ))}
          </div>
          <PaginationBar {...logs.data} onPageChange={(p) => set({ page: p })} />
        </>
      )}
    </div>
  );
}
