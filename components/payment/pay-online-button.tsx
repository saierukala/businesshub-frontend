"use client";

import { useState } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useOnlinePayment, usePaymentConfig } from "@/lib/queries/payments";
import { loadCheckout } from "@/lib/razorpay";

// "Pay ₹799 online" for the customer of a completed visit. Hidden when online payment is not set up.
// 1. the server creates the order (it decides the amount), 2. Razorpay's window takes the payment,
// 3. the server checks Razorpay's signature and marks it paid. The browser never decides that it is paid.
export function PayOnlineButton({ bookingId, amountLabel }: { bookingId: string; amountLabel: string }) {
  const config = usePaymentConfig();
  const { start, confirm } = useOnlinePayment(bookingId);
  const [opening, setOpening] = useState(false);

  if (!config.data?.online.enabled) return null;
  const busy = opening || start.isPending || confirm.isPending;

  async function pay() {
    setOpening(true);
    try {
      const [order, Razorpay] = await Promise.all([start.mutateAsync(), loadCheckout()]);
      const checkout = new Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amountPaise,
        currency: order.currency,
        // How Razorpay's window looks: our short name and logo, the app's dark ink colour, UPI first (most used in India).
        name: "HomeFix",
        description: order.description,
        image: `${window.location.origin}/homefix-logo.svg`,
        prefill: order.prefill,
        theme: { color: "#151f24", backdrop_color: "rgba(21, 31, 36, 0.6)" },
        config: {
          display: {
            blocks: { upi: { name: "Pay with UPI", instruments: [{ method: "upi" }] } },
            sequence: ["block.upi"],
            preferences: { show_default_blocks: true }, // cards and netbanking still listed below
          },
        },
        handler: (result) =>
          confirm.mutate(
            { orderId: result.razorpay_order_id, paymentId: result.razorpay_payment_id, signature: result.razorpay_signature },
            {
              onSuccess: (p) => toast.success(`Paid. Receipt ${p.receiptNumber}`),
              onError: (err) => toast.error(err.message),
            },
          ),
      });
      checkout.on("payment.failed", (e) => toast.error(e.error.description ?? "The payment did not go through. You can try again."));
      checkout.open();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <Button size="lg" className="h-12 w-full px-6 text-base sm:w-auto" disabled={busy} aria-busy={busy} onClick={pay}>
        {busy ? <Spinner /> : <CreditCard />}
        {confirm.isPending ? "Confirming payment…" : `Pay ${amountLabel} online`}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-end">
        <ShieldCheck className="size-3.5 text-green-600" aria-hidden />
        Secured by Razorpay · UPI, cards, netbanking
      </p>
    </div>
  );
}
