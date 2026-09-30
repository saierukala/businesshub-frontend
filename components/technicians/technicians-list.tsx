"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { SearchBox } from "@/components/common/search-box";
import { useTechnicians } from "@/lib/queries/technicians";
import { useListParams } from "@/hooks/use-list-params";
import { formatPhone } from "@/lib/format";

export function TechniciansList() {
  const { get, page, set } = useListParams();
  const q = get("q");
  const technicians = useTechnicians({ q, page });

  return (
    <div className="flex flex-col gap-4">
      <SearchBox value={q} onSearch={(v) => set({ q: v })} label="Search technicians" placeholder="Search by name" />

      {technicians.isPending ? (
        <ListSkeleton />
      ) : technicians.isError ? (
        <ErrorState error={technicians.error} onRetry={() => technicians.refetch()} />
      ) : technicians.data.items.length === 0 ? (
        <EmptyState title="No technicians found" description="The owner adds technicians on the Users page. Then set them up here." />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead className="hidden md:table-cell">Areas</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicians.data.items.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link href={`/staff/technicians/${t.id}`} className="font-medium hover:underline">
                        {t.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{formatPhone(t.phone)}</div>
                    </TableCell>
                    <TableCell>
                      {t.skills.length === 0 ? (
                        <span className="text-sm text-muted-foreground">None yet</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {t.skills.map((s) => (
                            <Badge key={s.id} variant="secondary">
                              {s.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-sm md:table-cell">
                      {t.areas.length ? t.areas.join(", ") : <span className="text-muted-foreground">None yet</span>}
                    </TableCell>
                    <TableCell>
                      {t.status === "ACTIVE" ? <Badge variant="outline">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationBar {...technicians.data} onPageChange={(p) => set({ page: p })} />
        </>
      )}
    </div>
  );
}
