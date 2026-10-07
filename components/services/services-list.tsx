"use client";

import { useState } from "react";
import { Pencil, Plus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { FormDialog } from "@/components/common/form-dialog";
import { ServiceForm } from "./service-form";
import { BookableSwitch, DurationText, PriceText, ServiceName, StatusBadge } from "./service-cells";
import { useCategories, useServices } from "@/lib/queries/catalog";
import { useListParams } from "@/hooks/use-list-params";
import { cn } from "@/lib/utils";
import type { Category, Service } from "@/lib/types";

// Filter chips: "All" plus one per appliance type. The choice lives in the URL (?category=).
function CategoryChips({ categories, value, onChange }: { categories: Category[]; value: string; onChange: (id: string) => void }) {
  const chips = [{ id: "", name: "All", active: true }, ...categories];
  return (
    // Phones: one row that scrolls sideways. Wider: wraps.
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap" role="group" aria-label="Filter by appliance type">
      {chips.map((c) => (
        <button
          key={c.id || "all"}
          type="button"
          aria-pressed={value === c.id}
          onClick={() => onChange(c.id)}
          title={c.active ? undefined : "Turned off"}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-sm whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            value === c.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
            !c.active && value !== c.id && "text-muted-foreground",
          )}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

function EditButton({ s, onEdit }: { s: Service; onEdit: (s: Service) => void }) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Edit ${s.name}`}
      onClick={(e) => {
        e.stopPropagation(); // the table row has its own click
        onEdit(s);
      }}
    >
      <Pencil />
    </Button>
  );
}

export function ServicesList() {
  const { get, page, set } = useListParams();
  const categoryId = get("category");
  const services = useServices({ page, includeInactive: true, categoryId: categoryId || undefined });
  const categories = useCategories(true);
  const [editing, setEditing] = useState<Service | "new" | null>(null);

  const addButton = (
    <Button onClick={() => setEditing("new")}>
      <Plus /> New service
    </Button>
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Services
            {services.data && <span className="ml-2 text-sm font-normal text-muted-foreground tabular-nums">{services.data.total}</span>}
          </h2>
          <p className="text-sm text-muted-foreground">The switch hides a service from customers. Past bookings keep it.</p>
        </div>
        {addButton}
      </div>

      {categories.data && categories.data.items.length > 1 && (
        <CategoryChips categories={categories.data.items} value={categoryId} onChange={(id) => set({ category: id })} />
      )}

      {services.isPending ? (
        <ListSkeleton />
      ) : services.isError ? (
        <ErrorState error={services.error} onRetry={() => services.refetch()} />
      ) : services.data.items.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={categoryId ? "No services for this appliance type" : "No services yet"}
          description={categoryId ? "Add one, or pick another type above." : "Add the repairs customers can book."}
          action={addButton}
        />
      ) : (
        <>
          {/* Switches on the list width, not the screen width (the sidebar takes part of the screen). */}
          <div className="@container">
            {/* Narrow: one card per service. */}
            <ul className="flex flex-col gap-2 @2xl:hidden">
              {services.data.items.map((s) => (
                <li key={s.id} className={cn("flex flex-col gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10", !s.active && "opacity-70")}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">{s.category.name}</div>
                      <ServiceName s={s} />
                    </div>
                    <PriceText amount={s.basePrice} className="text-base" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <DurationText minutes={s.durationMinutes} />
                      <StatusBadge s={s} />
                    </div>
                    <div className="flex items-center gap-1">
                      <BookableSwitch s={s} />
                      <EditButton s={s} onEdit={setEditing} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Wide enough: a table. The whole row opens the editor; the pencil is the real button for keyboards. */}
            <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 @2xl:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="pl-4">Service</TableHead>
                    <TableHead className="hidden @4xl:table-cell">Appliance type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Visit charge</TableHead>
                    <TableHead className="pl-6">Bookable</TableHead>
                    <TableHead className="w-10 pr-4">
                      <span className="sr-only">Edit</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.data.items.map((s) => (
                    <TableRow key={s.id} className={cn("cursor-pointer", !s.active && "opacity-70")} onClick={() => setEditing(s)}>
                      <TableCell className="max-w-80 py-3 pl-4">
                        <div className="text-xs text-muted-foreground @4xl:hidden">{s.category.name}</div>
                        <ServiceName s={s} />
                      </TableCell>
                      <TableCell className="hidden text-sm @4xl:table-cell">{s.category.name}</TableCell>
                      <TableCell>
                        <DurationText minutes={s.durationMinutes} />
                      </TableCell>
                      <TableCell className="text-right">
                        <PriceText amount={s.basePrice} />
                      </TableCell>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          <BookableSwitch s={s} />
                          <StatusBadge s={s} />
                        </div>
                      </TableCell>
                      <TableCell className="pr-4">
                        <EditButton s={s} onEdit={setEditing} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <PaginationBar {...services.data} onPageChange={(p) => set({ page: p })} />
        </>
      )}

      <FormDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "New service" : "Edit service"}
      >
        {editing !== null && <ServiceForm service={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />}
      </FormDialog>
    </section>
  );
}
