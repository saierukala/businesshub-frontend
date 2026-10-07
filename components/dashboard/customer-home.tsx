"use client";

import { createElement } from "react";
import Link from "next/link";
import { CalendarPlus, ChevronRight, ClipboardList, Plus, Quote, ReceiptText } from "lucide-react";
import { ErrorState } from "@/components/common/query-states";
import { NextVisitCard } from "@/components/dashboard/next-visit-card";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Stars } from "@/components/reviews/stars";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerDashboard, type CustomerDashboard } from "@/lib/queries/dashboard";
import { applianceIcon } from "@/lib/record-icons";
import { formatDate, formatINR, formatWeekdayDate } from "@/lib/format";

const METHOD_LABEL: Record<string, string> = { CASH: "Cash", UPI: "UPI", CARD: "Card", ONLINE: "Online" };

// Greeting and the two things a customer comes here to do.
function Hero({ name, greeting }: { name: string; greeting: string }) {
  return (
    <section className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-sidebar-primary/15 via-sidebar-primary/5 to-transparent p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{name}</h1>
          <p className="mt-1 text-muted-foreground">Your repairs, appliances and receipts in one place.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/book" className={buttonVariants({ size: "lg" })}>
            <CalendarPlus /> Book a repair
          </Link>
          <Link href="/bookings" className={buttonVariants({ size: "lg", variant: "outline", className: "bg-background" })}>
            <ClipboardList /> My bookings
          </Link>
        </div>
      </div>
    </section>
  );
}

// A titled box. `action` is a small link on the right ("See all").
function Section({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-3 rounded-xl border bg-card p-4 sm:p-5 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const SeeAll = ({ href, label }: { href: string; label: string }) => (
  <Link href={href} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
    {label} <ChevronRight className="size-4" />
  </Link>
);

const Empty = ({ children }: { children: React.ReactNode }) => <p className="rounded-lg bg-muted/40 px-3 py-4 text-center text-sm text-muted-foreground">{children}</p>;

function Appliances({ items }: { items: CustomerDashboard["appliances"] }) {
  return (
    <Section title="My appliances" action={<SeeAll href="/account" label="Manage" />}>
      <ul className="grid grid-cols-2 gap-2">
        {items.map((a) => (
          <li key={a.id} className="flex flex-col gap-2 rounded-lg border p-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground" aria-hidden>
              {createElement(applianceIcon(a.category.name), { className: "size-4" })}
            </span>
            <div className="min-w-0 text-sm">
              <div className="truncate font-medium">{a.brand}</div>
              <div className="truncate text-xs text-muted-foreground">
                {a.category.name}
                {a.model && ` · ${a.model}`}
              </div>
            </div>
          </li>
        ))}
        <li>
          <Link
            href="/account"
            className="flex h-full min-h-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-3 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            <Plus className="size-4" /> Add appliance
          </Link>
        </li>
      </ul>
    </Section>
  );
}

function RecentVisits({ items }: { items: CustomerDashboard["recentHistory"] }) {
  return (
    <Section title="Recent visits" action={<SeeAll href="/bookings" label="All bookings" />}>
      {items.length === 0 ? (
        <Empty>Finished visits will show up here.</Empty>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {items.map((b) => (
            <li key={b.id}>
              <Link href={`/bookings/${b.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/50">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground" aria-hidden>
                  {createElement(applianceIcon(b.appliance.category.name), { className: "size-4" })}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{b.service.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {b.bookingNumber} · {formatWeekdayDate(b.startAt)}
                  </div>
                </div>
                <StatusBadge status={b.status} />
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Payments({ items }: { items: CustomerDashboard["recentPayments"] }) {
  return (
    <Section title="Payments">
      {items.length === 0 ? (
        <Empty>No payments yet. Receipts appear here after a repair.</Empty>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {items.map((p) => (
            <li key={p.id}>
              <Link href={`/bookings/${p.booking.id}/receipt`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/50">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-700 dark:text-green-400" aria-hidden>
                  <ReceiptText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.receiptNumber ?? p.booking.bookingNumber}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.paidAt && `${formatDate(p.paidAt)} · `}
                    {METHOD_LABEL[p.method] ?? p.method}
                  </div>
                </div>
                <span className="font-semibold tabular-nums">{formatINR(p.amount)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Reviews({ items }: { items: CustomerDashboard["recentReviews"] }) {
  return (
    <Section title="My reviews">
      {items.length === 0 ? (
        <Empty>After a repair is done you can rate it from the booking page.</Empty>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((r) => (
            <li key={r.id} className="flex flex-col gap-1.5 rounded-lg bg-muted/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <Stars rating={r.rating} />
                <Link href={`/bookings/${r.booking.id}`} className="text-xs text-muted-foreground hover:underline">
                  {r.booking.bookingNumber}
                </Link>
              </div>
              {r.comment && (
                <p className="flex gap-1.5 text-sm text-muted-foreground">
                  <Quote className="mt-0.5 size-3.5 shrink-0 opacity-60" aria-hidden />
                  {r.comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Loading() {
  return (
    <div className="grid gap-4 lg:grid-cols-3" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-72 rounded-xl lg:col-span-2" />
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-48 rounded-xl lg:col-span-2" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

// The customer's home. Name and greeting come from the server page (IST clock), the rest from GET /dashboard/customer.
export function CustomerHome({ name, greeting }: { name: string; greeting: string }) {
  const q = useCustomerDashboard();
  return (
    <div className="flex flex-col gap-4">
      <Hero name={name} greeting={greeting} />
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <NextVisitCard b={q.data.upcomingBooking} />
          </div>
          <Appliances items={q.data.appliances} />
          <RecentVisits items={q.data.recentHistory} />
          <Payments items={q.data.recentPayments} />
          <Reviews items={q.data.recentReviews} />
        </div>
      )}
    </div>
  );
}
