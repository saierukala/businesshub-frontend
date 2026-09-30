"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/query-states";
import { useReceipt } from "@/lib/queries/payments";
import { formatDate, formatINR, formatTime } from "@/lib/format";

const METHOD_LABEL = { CASH: "Cash", UPI: "UPI", CARD: "Card", ONLINE: "Online" };

// A simple receipt. "Print" opens the browser's print dialog, where "Save as PDF" makes a PDF.
// (The rest of the page, like the menu, is hidden when printing.)
export function ReceiptView({ bookingId }: { bookingId: string }) {
  const query = useReceipt(bookingId);

  if (query.isPending) return <Skeleton className="h-96 w-full max-w-xl" aria-busy="true" aria-label="Loading" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const r = query.data;
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="print:hidden">
        <Button variant="outline" size="lg" onClick={() => window.print()}>
          <Printer /> Print or save as PDF
        </Button>
      </div>

      <article className="rounded-lg border bg-card p-6 print:border-0 print:p-0" aria-label={`Receipt ${r.receiptNumber}`}>
        <header className="flex items-start justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-xl font-semibold">{r.business}</h1>
            <p className="text-sm text-muted-foreground">Payment receipt</p>
          </div>
          <div className="text-right text-sm">
            <div className="font-semibold">{r.receiptNumber}</div>
            <div className="text-muted-foreground">
              {formatDate(r.paidAt)}, {formatTime(r.paidAt)}
            </div>
          </div>
        </header>

        <dl className="grid gap-x-6 gap-y-2 py-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Customer</dt>
            <dd className="font-medium">{r.customer.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Booking</dt>
            <dd className="font-medium">
              {r.bookingNumber} · {formatDate(r.visitDate)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Address</dt>
            <dd className="font-medium">{r.address}</dd>
          </div>
          {r.technician && (
            <div>
              <dt className="text-muted-foreground">Technician</dt>
              <dd className="font-medium">{r.technician}</dd>
            </div>
          )}
        </dl>

        <table className="w-full border-t text-sm">
          <tbody>
            {r.lines.map((l) => (
              <tr key={l.label} className="border-b">
                <td className="py-2 pr-4">{l.label}</td>
                <td className="py-2 text-right tabular-nums">{formatINR(l.amount)}</td>
              </tr>
            ))}
            <tr>
              <td className="py-3 pr-4 text-base font-semibold">Total paid</td>
              <td className="py-3 text-right text-base font-semibold tabular-nums">{formatINR(r.total)}</td>
            </tr>
          </tbody>
        </table>

        <p className="text-sm text-muted-foreground">
          Paid by {METHOD_LABEL[r.method]}
          {r.reference && ` · Ref ${r.reference}`}. Thank you.
        </p>
      </article>
    </div>
  );
}
