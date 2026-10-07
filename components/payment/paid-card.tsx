import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowUpRight, Banknote, CalendarCheck, CheckCircle2, CreditCard, Hash, ReceiptText, Smartphone, UserRound } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatINR, formatTime } from "@/lib/format";
import type { Payment } from "@/lib/types";

const METHOD: Record<Payment["method"], { label: string; icon: ComponentType<{ className?: string }> }> = {
  ONLINE: { label: "Paid online · Razorpay", icon: CreditCard },
  UPI: { label: "Paid by UPI", icon: Smartphone },
  CASH: { label: "Paid in cash", icon: Banknote },
  CARD: { label: "Paid by card", icon: CreditCard },
};

// The "it's paid" card on a booking, for the customer and for staff. Styled like a receipt stub:
// a green accent line, the amount up front, the method and receipt number as chips, the details in a footer strip.
export function PaidCard({ payment: p, receiptHref }: { payment: Payment; receiptHref: string }) {
  const method = METHOD[p.method];
  return (
    <div className="relative overflow-clip rounded-2xl border bg-card shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" aria-hidden />
      <div className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />

      <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5 duration-500 animate-in zoom-in-75 fade-in">
            <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col gap-2">
            <div>
              <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">Payment complete</p>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">{formatINR(p.amount)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip icon={method.icon}>{method.label}</Chip>
              {p.receiptNumber && <Chip icon={ReceiptText}>{p.receiptNumber}</Chip>}
            </div>
          </div>
        </div>

        <Link href={receiptHref} className={buttonVariants({ size: "lg", className: "h-11 w-full px-5 sm:w-auto" })}>
          View receipt <ArrowUpRight />
        </Link>
      </div>

      <div className="relative flex flex-wrap gap-x-5 gap-y-1.5 border-t bg-muted/40 px-5 py-3 text-xs text-muted-foreground sm:px-6">
        {p.paidAt && (
          <Meta icon={CalendarCheck}>
            {formatDate(p.paidAt)}, {formatTime(p.paidAt)}
          </Meta>
        )}
        {p.reference && (
          <Meta icon={Hash}>
            <span className="font-mono">{p.reference}</span>
          </Meta>
        )}
        {p.method !== "ONLINE" && p.recordedBy && <Meta icon={UserRound}>Recorded by {p.recordedBy}</Meta>}
      </div>
    </div>
  );
}

function Chip({ icon: Icon, children }: { icon: ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs font-medium">
      <Icon className="size-3.5 text-muted-foreground" />
      {children}
    </span>
  );
}

function Meta({ icon: Icon, children }: { icon: ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3.5" />
      {children}
    </span>
  );
}
