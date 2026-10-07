"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, HardHat } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { SearchBox } from "@/components/common/search-box";
import { AreaList, SkillChips, StatusCell, TechPerson, WeekStrip } from "./technician-cells";
import { useTechnicians } from "@/lib/queries/technicians";
import { useListParams } from "@/hooks/use-list-params";
import { cn } from "@/lib/utils";
import type { Technician } from "@/lib/types";

const href = (t: Technician) => `/staff/technicians/${t.id}`;

export function TechniciansList() {
  const router = useRouter();
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
        <EmptyState
          icon={HardHat}
          title={q ? `No technicians match "${q}"` : "No technicians yet"}
          description={q ? "Check the spelling, or clear the search." : "The owner adds technicians on the Users page. Then set them up here."}
        />
      ) : (
        <>
          {/* Switches on the list width, not the screen width (the sidebar takes part of the screen). */}
          <div className="@container">
            {/* Narrow: one card per technician. */}
            <ul className="flex flex-col gap-2 @3xl:hidden">
              {technicians.data.items.map((t) => (
                <li key={t.id}>
                  <Link
                    href={href(t)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-colors hover:bg-muted/40",
                      t.status === "INACTIVE" && "opacity-70",
                    )}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <TechPerson t={t} />
                        <StatusCell t={t} />
                      </div>
                      <SkillChips skills={t.skills} />
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <AreaList areas={t.areas} />
                        <WeekStrip days={t.workingHours} />
                      </div>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Wide enough: a table. The whole row opens the technician; the name is the real link for keyboards. */}
            <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 @3xl:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="pl-4">Technician</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead className="hidden @5xl:table-cell">Areas</TableHead>
                    <TableHead>Working days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-8">
                      <span className="sr-only">Open</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicians.data.items.map((t) => (
                    <TableRow key={t.id} className={cn("cursor-pointer", t.status === "INACTIVE" && "opacity-70")} onClick={() => router.push(href(t))}>
                      <TableCell className="py-3 pl-4">
                        <Link
                          href={href(t)}
                          className="block rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TechPerson t={t} />
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-72 whitespace-normal">
                        <SkillChips skills={t.skills} />
                      </TableCell>
                      <TableCell className="hidden max-w-56 @5xl:table-cell">
                        <AreaList areas={t.areas} />
                      </TableCell>
                      <TableCell>
                        <WeekStrip days={t.workingHours} />
                      </TableCell>
                      <TableCell>
                        <StatusCell t={t} />
                      </TableCell>
                      <TableCell className="pr-4">
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <PaginationBar {...technicians.data} onPageChange={(p) => set({ page: p })} />
        </>
      )}
    </div>
  );
}
