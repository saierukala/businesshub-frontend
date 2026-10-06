"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateRangeFilter } from "@/components/common/date-range-filter";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { useListParams } from "@/hooks/use-list-params";
import { formatDate, formatTime } from "@/lib/format";
import { useAuditActions, useAuditLogs, type AuditEntry } from "@/lib/queries/audit";

// "PAYMENT_RECORDED" -> "Payment recorded"
const pretty = (action: string) => {
  const s = action.toLowerCase().replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// The few details worth reading at a glance (reasons, amounts, who it was for). Everything else stays in the API.
const KEYS = ["overrideReason", "reason", "note", "amount", "method", "rating", "from", "to"];
function details(a: AuditEntry) {
  const m = a.metadata ?? {};
  return KEYS.filter((k) => m[k] !== undefined && m[k] !== null && m[k] !== "")
    .map((k) => `${k}: ${typeof m[k] === "object" ? JSON.stringify(m[k]) : String(m[k])}`)
    .join(" · ");
}

// Owner only. Filters (action, dates) and page live in the URL.
export function AuditList() {
  const { get, page, set } = useListParams();
  const action = get("action");
  const from = get("from");
  const to = get("to");
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
      </div>

      {logs.isPending ? (
        <ListSkeleton />
      ) : logs.isError ? (
        <ErrorState error={logs.error} onRetry={() => logs.refetch()} />
      ) : logs.data.items.length === 0 ? (
        <EmptyState title="No entries" description="Nothing matches these filters." />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>What</TableHead>
                  <TableHead className="hidden md:table-cell">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.data.items.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="align-top whitespace-nowrap">
                      <div>{formatDate(a.createdAt)}</div>
                      <div className="text-xs text-muted-foreground">{formatTime(a.createdAt)}</div>
                    </TableCell>
                    <TableCell className="align-top">
                      {a.user?.name ?? "System"}
                      {a.user && <div className="text-xs text-muted-foreground">{a.user.role.toLowerCase()}</div>}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="font-medium">{pretty(a.action)}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.entityType} {a.entityId.slice(0, 8)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-80 align-top text-sm whitespace-normal text-muted-foreground md:table-cell">{details(a) || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationBar {...logs.data} onPageChange={(p) => set({ page: p })} />
        </>
      )}
    </div>
  );
}
