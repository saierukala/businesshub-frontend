"use client";

import { createElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { applianceIcon } from "@/lib/record-icons";
import { formatPhone, formatTime, formatWeekdayDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/lib/types";

// "Ravi Kumar" -> "RK"
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

function Person({ name, sub, tone = "muted" }: { name: string; sub?: string; tone?: "muted" | "primary" }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          tone === "primary" ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-muted text-muted-foreground",
        )}
        aria-hidden
      >
        {initials(name)}
      </span>
      <div className="min-w-0">
        <div className="truncate font-medium">{name}</div>
        {sub && <div className="truncate text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

function BookingCell({ b }: { b: Booking }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground" aria-hidden>
        {createElement(applianceIcon(b.appliance.category.name), { className: "size-4" })}
      </span>
      <div className="min-w-0">
        <div className="font-medium">{b.bookingNumber}</div>
        <div className="truncate text-xs text-muted-foreground">{b.service.name}</div>
      </div>
    </div>
  );
}

function StatusCell({ b, staff }: { b: Booking; staff: boolean }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <StatusBadge status={b.status as BookingStatus} />
      {staff && b.needsReassignment && <span className="text-xs font-medium text-destructive">Needs new technician</span>}
      {b.status === "COMPLETED" && (
        <span className={b.paid ? "text-xs font-medium text-green-700 dark:text-green-400" : "text-xs font-medium text-destructive"}>
          {b.paid ? "Paid" : "Payment due"}
        </span>
      )}
    </div>
  );
}

const Unassigned = () => <span className="text-sm text-muted-foreground italic">Not assigned</span>;

// The bookings as a table on wide screens and as cards on phones. Each row opens the booking.
// Customers (staff=false) do not see the customer and technician columns.
export function BookingsTable({ items, base, staff }: { items: Booking[]; base: string; staff: boolean }) {
  const router = useRouter();

  // Switches on the LIST width, not the screen width (the sidebar takes part of the screen).
  return (
    <div className="@container">
      {/* Narrow: one card per booking. */}
      <ul className="flex flex-col gap-2 @3xl:hidden">
        {items.map((b) => (
          <li key={b.id}>
            <Link href={`${base}/${b.id}`} className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-colors hover:bg-muted/40">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <BookingCell b={b} />
                  <StatusCell b={b} staff={staff} />
                </div>
                <div className="text-sm">
                  <span className="font-medium">{formatWeekdayDate(b.startAt)}</span>
                  <span className="text-muted-foreground"> · {formatTime(b.startAt)}</span>
                </div>
                {staff && (
                  <div className="text-sm text-muted-foreground">
                    {b.customer.name} · {b.technician?.name ?? "Not assigned"}
                  </div>
                )}
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

      {/* Wide enough: a table. The whole row is clickable; the booking number is the real link for keyboards. */}
      <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 @3xl:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Booking</TableHead>
              {staff && <TableHead>Customer</TableHead>}
              <TableHead>When</TableHead>
              <TableHead className="hidden @5xl:table-cell">Appliance</TableHead>
              {staff && <TableHead>Technician</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead className="w-8">
                <span className="sr-only">Open</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((b) => (
              <TableRow key={b.id} className="cursor-pointer" onClick={() => router.push(`${base}/${b.id}`)}>
                <TableCell className="py-3 pl-4">
                  <Link href={`${base}/${b.id}`} className="block rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none" onClick={(e) => e.stopPropagation()}>
                    <BookingCell b={b} />
                  </Link>
                </TableCell>
                {staff && (
                  <TableCell>
                    <Person name={b.customer.name} sub={b.customer.phone ? formatPhone(b.customer.phone) : undefined} />
                  </TableCell>
                )}
                <TableCell className="whitespace-nowrap">
                  <div className="font-medium">{formatWeekdayDate(b.startAt)}</div>
                  <div className="text-xs text-muted-foreground">{formatTime(b.startAt)}</div>
                </TableCell>
                <TableCell className="hidden @5xl:table-cell">
                  <div>
                    {b.appliance.brand} {b.appliance.category.name}
                  </div>
                  {b.appliance.model && <div className="text-xs text-muted-foreground">Model {b.appliance.model}</div>}
                </TableCell>
                {staff && <TableCell>{b.technician ? <Person name={b.technician.name} tone="primary" /> : <Unassigned />}</TableCell>}
                <TableCell>
                  <StatusCell b={b} staff={staff} />
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
  );
}
