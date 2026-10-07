"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
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
        name: "HomeFix Appliance Services",
        description: order.description,
        prefill: order.prefill,
        theme: { color: "#e82339" },
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
    <Button size="lg" className="h-12 w-full text-base sm:w-fit" disabled={busy} aria-busy={busy} onClick={pay}>
      {busy ? <Spinner /> : <CreditCard />}
      {confirm.isPending ? "Confirming payment…" : `Pay ${amountLabel} online`}
    </Button>
  );
}
