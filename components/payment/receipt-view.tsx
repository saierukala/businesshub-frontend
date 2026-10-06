"use client";

import { CheckCircle2, Printer, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/query-states";
import { useReceipt } from "@/lib/queries/payments";
import { formatDate, formatINR, formatPhone, formatTime } from "@/lib/format";

const METHOD_LABEL = { CASH: "Cash", UPI: "UPI", CARD: "Card", ONLINE: "Online" };

function InfoBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/60 p-4 print:bg-zinc-100">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase print:text-zinc-500">{label}</dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  );
}

// The receipt. "Print" opens the browser's print dialog, where "Save as PDF" makes a PDF.
// Everything else on the page (menu, buttons) is hidden when printing, and the receipt always prints
// black on white, even in dark mode. All amounts come from the API; nothing is added up here.
export function ReceiptView({ bookingId }: { bookingId: string }) {
  const query = useReceipt(bookingId);

  if (query.isPending) return <Skeleton className="h-96 w-full max-w-2xl" aria-busy="true" aria-label="Loading" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const r = query.data;
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="print:hidden">
        <Button variant="outline" size="lg" onClick={() => window.print()}>
          <Printer /> Print or save as PDF
        </Button>
      </div>

      <article
        className="overflow-hidden rounded-xl border bg-card shadow-sm [print-color-adjust:exact] print:rounded-none print:border-0 print:bg-white print:text-black print:shadow-none"
        aria-label={`Receipt ${r.receiptNumber}`}
      >
        <header className="flex flex-wrap items-start justify-between gap-4 border-b p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground print:bg-black print:text-white">
              <Wrench className="size-5" />
            </span>
            <div>
              <h1 className="text-lg leading-tight font-semibold">{r.business}</h1>
              <p className="text-sm text-muted-foreground print:text-zinc-500">Payment receipt</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-green-800 uppercase dark:bg-green-500/20 dark:text-green-300 print:bg-green-100 print:text-green-800">
              <CheckCircle2 className="size-3.5" /> Paid
            </span>
            <span className="font-semibold">{r.receiptNumber}</span>
            <span className="text-muted-foreground print:text-zinc-500">
              {formatDate(r.paidAt)}, {formatTime(r.paidAt)}
            </span>
          </div>
        </header>

        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div>
            <p className="text-sm text-muted-foreground print:text-zinc-500">Amount paid</p>
            <p className="text-4xl font-semibold tracking-tight tabular-nums">{formatINR(r.total)}</p>
            <p className="mt-1 text-sm text-muted-foreground print:text-zinc-500">
              by {METHOD_LABEL[r.method]}
              {r.reference && ` · Ref ${r.reference}`}
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <InfoBox label="Billed to">
              {r.customer.name}
              {r.customer.phone && <span className="block text-sm font-normal text-muted-foreground print:text-zinc-600">{formatPhone(r.customer.phone)}</span>}
            </InfoBox>
            <InfoBox label="Booking">
              {r.bookingNumber}
              <span className="block text-sm font-normal text-muted-foreground print:text-zinc-600">Visit on {formatDate(r.visitDate)}</span>
            </InfoBox>
            <InfoBox label="Service address">{r.address}</InfoBox>
            <InfoBox label="Technician">{r.technician ?? "—"}</InfoBox>
          </dl>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase print:text-zinc-500">
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {r.lines.map((l) => (
                <tr key={l.label} className="border-b">
                  <td className="py-3 pr-4">{l.label}</td>
                  <td className="py-3 text-right tabular-nums">{formatINR(l.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-4 pr-4 text-base font-semibold">Total paid</td>
                <td className="pt-4 text-right text-lg font-semibold tabular-nums">{formatINR(r.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <footer className="border-t bg-muted/40 px-6 py-4 text-center text-sm text-muted-foreground sm:px-8 print:bg-zinc-50 print:text-zinc-500">
          Thank you for choosing {r.business}. Please keep this receipt for your records.
        </footer>
      </article>
    </div>
  );
}
