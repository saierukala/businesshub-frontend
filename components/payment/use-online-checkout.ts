"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useOnlinePayment } from "@/lib/queries/payments";
import { loadCheckout } from "@/lib/razorpay";

// The moment of paying: 1. the server creates the order (it decides the amount), 2. Razorpay's secure window takes
// the card/UPI details (they never touch our app), 3. the server checks Razorpay's signature and marks it paid.
// The booking query is refreshed afterwards, so the page switches to "Payment successful" by itself.
export function useOnlineCheckout(bookingId: string) {
  const { start, confirm } = useOnlinePayment(bookingId);
  const [opening, setOpening] = useState(false);

  async function pay() {
    setOpening(true);
    try {
      const [order, Razorpay] = await Promise.all([start.mutateAsync(), loadCheckout()]);
      const checkout = new Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "HomeFix",
        description: order.description,
        image: `${window.location.origin}/homefix-logo.svg`, // shows once the app runs on a public address
        prefill: order.prefill,
        theme: { color: "#151f24", backdrop_color: "rgba(21, 31, 36, 0.6)" },
        handler: (result) =>
          confirm.mutate(
            { orderId: result.razorpay_order_id, paymentId: result.razorpay_payment_id, signature: result.razorpay_signature },
            { onError: (err) => toast.error(err.message) },
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

  return { pay, busy: opening || start.isPending || confirm.isPending, confirming: confirm.isPending };
}
