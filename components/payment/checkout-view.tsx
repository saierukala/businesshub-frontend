"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  FlaskConical,
  Landmark,
  Lock,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Wallet,
  Wrench,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState, ErrorState } from "@/components/common/query-states";
import { useBooking } from "@/lib/queries/bookings";
import { usePaymentConfig } from "@/lib/queries/payments";
import { formatDate, formatINR, formatSlot, formatTime } from "@/lib/format";
import type { BookingDetail, Payment } from "@/lib/types";
import { useOnlineCheckout } from "./use-online-checkout";

// The customer's checkout page for a completed visit. Everything here is HomeFix; Razorpay's secure window
// appears only for the moment the card/UPI details are typed. The amounts come from the API.
export function CheckoutView({ bookingId }: { bookingId: string }) {
  const booking = useBooking(bookingId);
  const config = usePaymentConfig();
  const back = `/bookings/${bookingId}`;

  if (booking.isPending || config.isPending) return <CheckoutSkeleton />;
  if (booking.isError) return <ErrorState error={booking.error} onRetry={() => booking.refetch()} />;
  const b = booking.data;

  if (b.payment) return <PaymentDone booking={b} payment={b.payment} />;
  if (b.status !== "COMPLETED") {
    return <EmptyState icon={ReceiptText} title="Nothing to pay yet" description="You can pay once the technician has completed the visit." action={<BackLink href={back} />} />;
  }
  if (!config.data?.online.enabled) {
    return <EmptyState icon={CreditCard} title="Online payment is not available" description="Please pay the technician in cash or by UPI. Your receipt appears on the booking." action={<BackLink href={back} />} />;
  }
  return <Checkout booking={b} testMode={config.data.online.keyId?.startsWith("rzp_test_") ?? false} />;
}

function Checkout({ booking: b, testMode }: { booking: BookingDetail; testMode: boolean }) {
  const { pay, busy, confirming } = useOnlineCheckout(b.id);
  const total = b.visit?.finalAmount ?? b.service.basePrice;
  const extra = b.visit?.extraCharge.status === "APPROVED" ? b.visit.extraCharge : null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <BackLink href={`/bookings/${b.id}`} subtle />
        <p className="mt-2 text-sm font-medium text-muted-foreground">Checkout</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Pay for your repair</h1>
        <p className="text-muted-foreground">
          {b.bookingNumber} · {b.service.name}
        </p>
      </div>

      {testMode && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            <span className="font-semibold">Test mode: no real money moves.</span> In the payment window choose UPI and enter{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-500/20">success@razorpay</code>, or use a Razorpay test card.
          </p>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          <Card className="gap-0 p-0">
            <h2 className="px-5 pt-5 pb-3 font-semibold">Your repair</h2>
            <dl className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <Detail icon={Wrench} label="Appliance" value={`${b.appliance.brand} ${b.appliance.category.name}`} hint={b.appliance.model ?? undefined} />
              <Detail icon={CalendarClock} label="Visit" value={formatSlot(b.startAt, b.endAt)} />
              <Detail icon={BadgeCheck} label="Technician" value={b.technician?.name ?? "—"} />
              <Detail icon={MapPin} label="Address" value={b.address.label} hint={`${b.address.line1}, ${b.address.area}`} />
            </dl>
            {b.visit?.workPerformed && (
              <>
                <Separator />
                <div className="px-5 py-4 text-sm">
                  <span className="text-muted-foreground">Work done: </span>
                  {b.visit.workPerformed}
                </div>
              </>
            )}
          </Card>

          <Card className="gap-3 p-5">
            <h2 className="font-semibold">Ways to pay</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Method icon={Smartphone} label="UPI" />
              <Method icon={CreditCard} label="Cards" />
              <Method icon={Landmark} label="Netbanking" />
              <Method icon={Wallet} label="Wallets" />
            </div>
            <p className="text-sm text-muted-foreground">You pick one in the secure Razorpay window after pressing Pay.</p>
          </Card>
        </div>

        {/* On a phone the summary and Pay button come first; on a wide screen they sit on the right. */}
        <Card className="order-first gap-0 p-0 lg:sticky lg:top-6 lg:order-none">
          <div className="flex flex-col gap-3 p-5">
            <h2 className="font-semibold">Order summary</h2>
            <Line label={b.service.name} amount={b.service.basePrice} />
            {extra?.amount && <Line label={`Extra: ${extra.reason ?? "additional work"}`} amount={extra.amount} />}
          </div>
          <Separator />
          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-baseline justify-between">
              <span className="font-medium">Total</span>
              <span className="text-3xl font-semibold tracking-tight tabular-nums">{formatINR(total)}</span>
            </div>
            <Button size="lg" className="h-12 w-full text-base" disabled={busy} aria-busy={busy} onClick={pay}>
              {busy ? <Spinner /> : <Lock />}
              {confirming ? "Confirming payment…" : `Pay ${formatINR(total)} securely`}
            </Button>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Trust icon={ShieldCheck}>Card and UPI details go straight to Razorpay. HomeFix never sees them.</Trust>
              <Trust icon={BadgeCheck}>The payment is confirmed by our server, not by your browser.</Trust>
              <Trust icon={ReceiptText}>Your receipt is ready the moment you pay.</Trust>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PaymentDone({ booking: b, payment: p }: { booking: BookingDetail; payment: Payment }) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 py-6 text-center">
      <div className="relative flex size-20 items-center justify-center rounded-full bg-green-100 duration-500 animate-in zoom-in-50 fade-in dark:bg-green-500/15">
        <CheckCircle2 className="size-11 text-green-600" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Payment successful</h1>
        <p className="text-muted-foreground">Thank you, {b.customer.name.split(" ")[0]}. Your repair is paid.</p>
      </div>

      <Card className="w-full gap-0 p-0 text-left">
        <div className="flex items-baseline justify-between p-5">
          <span className="text-muted-foreground">Amount paid</span>
          <span className="text-2xl font-semibold tabular-nums">{formatINR(p.amount)}</span>
        </div>
        <Separator />
        <dl className="grid gap-3 p-5 text-sm">
          <Row label="Receipt" value={p.receiptNumber ?? "—"} />
          <Row label="Booking" value={`${b.bookingNumber} · ${b.service.name}`} />
          {p.paidAt && <Row label="Paid on" value={`${formatDate(p.paidAt)}, ${formatTime(p.paidAt)}`} />}
          <Row label="Method" value={p.method === "ONLINE" ? "Online (Razorpay)" : p.method === "CASH" ? "Cash" : p.method} />
          {p.reference && <Row label="Reference" value={p.reference} mono />}
        </dl>
      </Card>

      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <Link href={`/bookings/${b.id}/receipt`} className={buttonVariants({ size: "lg", className: "h-11 flex-1" })}>
          <ReceiptText /> View receipt
        </Link>
        <Link href={`/bookings/${b.id}`} className={buttonVariants({ size: "lg", variant: "outline", className: "h-11 flex-1" })}>
          Back to booking
        </Link>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value, hint }: { icon: ComponentType<{ className?: string }>; label: string; value: string; hint?: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
        <dd className="font-medium break-words">{value}</dd>
        {hint && <dd className="text-sm break-words text-muted-foreground">{hint}</dd>}
      </div>
    </div>
  );
}

function Method({ icon: Icon, label }: { icon: ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border bg-muted/30 px-2 py-3 text-sm font-medium">
      <Icon className="size-5 text-muted-foreground" />
      {label}
    </div>
  );
}

function Line({ label, amount }: { label: string; amount: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{formatINR(amount)}</span>
    </div>
  );
}

function Trust({ icon: Icon, children }: { icon: ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-green-600" />
      <span>{children}</span>
    </li>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-xs break-all" : "text-right font-medium"}>{value}</dd>
    </div>
  );
}

function BackLink({ href, subtle }: { href: string; subtle?: boolean }) {
  return (
    <Link href={href} className={subtle ? "flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground" : buttonVariants({ variant: "outline" })}>
      <ChevronLeft className="size-4" /> Back to booking
    </Link>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_22rem]" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-72 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
