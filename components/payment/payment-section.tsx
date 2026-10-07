"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Banknote, ReceiptText, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useRecordPayment } from "@/lib/queries/payments";
import { PayOnlineButton } from "./pay-online-button";
import { formatDate, formatINR, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BookingDetail } from "@/lib/types";

const METHODS = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "UPI", label: "UPI", icon: Smartphone },
] as const;

// "Paid ₹499 in cash / by UPI / by card / online"
const METHOD_PHRASE = { CASH: "in cash", UPI: "by UPI", CARD: "by card", ONLINE: "online" };

type Props = {
  booking: BookingDetail;
  receiptHref: string; // where this person opens the receipt
  canRecord: boolean; // the technician of the job and managers; customers only see the state
  canPayOnline?: boolean; // the customer: "Pay online" (Razorpay, when it is set up)
};

// Payment for a completed visit. The amount shown comes from the API (price + approved extra charge); we only
// record HOW it was paid. Once paid it shows the receipt link.
export function PaymentSection({ booking, receiptHref, canRecord, canPayOnline = false }: Props) {
  const record = useRecordPayment(booking.id);
  const [method, setMethod] = useState<"CASH" | "UPI">("CASH");
  const [reference, setReference] = useState("");

  if (booking.status !== "COMPLETED") return null;

  const due = formatINR(booking.visit?.finalAmount ?? booking.service.basePrice);

  if (booking.payment) {
    const p = booking.payment;
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Payment</h2>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <BadgeCheck className="size-6 text-green-600" />
            <div>
              <div className="font-semibold">
                Paid {formatINR(p.amount)} {METHOD_PHRASE[p.method]}
              </div>
              <div className="text-sm text-muted-foreground">
                {p.paidAt && `${formatDate(p.paidAt)}, ${formatTime(p.paidAt)}`}
                {p.reference && ` · Ref ${p.reference}`}
                {p.method === "ONLINE" ? " · via Razorpay" : p.recordedBy && ` · Recorded by ${p.recordedBy}`}
              </div>
            </div>
          </div>
          <Link href={receiptHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
            <ReceiptText /> View receipt {p.receiptNumber && `(${p.receiptNumber})`}
          </Link>
        </div>
      </section>
    );
  }

  if (!canRecord) {
    const extra = booking.visit?.extraCharge.status === "APPROVED" && booking.visit.extraCharge.amount;
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Payment</h2>
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Amount due</div>
            <div className="text-3xl font-semibold tracking-tight tabular-nums">{due}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {booking.service.name} {formatINR(booking.service.basePrice)}
              {extra && ` + approved extra ${formatINR(extra)}`}
            </div>
          </div>
          {canPayOnline && <PayOnlineButton bookingId={booking.id} amountLabel={due} />}
        </div>
        <p className="text-sm text-muted-foreground">
          Prefer to pay in person? Pay the technician in cash or by UPI. Your receipt appears here once the payment is recorded.
        </p>
      </section>
    );
  }

  function submit() {
    record.mutate(
      { method, reference: method === "UPI" ? reference.trim() || undefined : undefined },
      {
        onSuccess: (p) => toast.success(`Payment recorded. Receipt ${p.receiptNumber}`),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Collect payment</h2>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">Amount to collect</div>
        <div className="text-3xl font-semibold tracking-tight">{due}</div>
        <div className="mt-1 text-sm text-muted-foreground">Visit charge{booking.visit?.extraCharge.status === "APPROVED" ? " + approved extra charge" : ""}.</div>
      </div>

      <div role="radiogroup" aria-label="How did the customer pay?" className="grid grid-cols-2 gap-2">
        {METHODS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={method === value}
            onClick={() => setMethod(value)}
            className={cn(
              "flex h-14 items-center justify-center gap-2 rounded-lg border text-base font-medium transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              method === value && "border-primary bg-primary/5",
            )}
          >
            <Icon className="size-5" /> {label}
          </button>
        ))}
      </div>

      {method === "UPI" && (
        <Field>
          <FieldLabel htmlFor="upi-ref">UPI transaction ID (optional)</FieldLabel>
          <Input id="upi-ref" value={reference} maxLength={100} onChange={(e) => setReference(e.target.value)} placeholder="e.g. 412345678901" />
        </Field>
      )}

      <Button size="lg" className="h-12 w-full text-base sm:w-fit" disabled={record.isPending} aria-busy={record.isPending} onClick={submit}>
        {record.isPending && <Spinner />}
        Payment received
      </Button>
    </section>
  );
}
