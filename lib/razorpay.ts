"use client";

// Razorpay's own payment window (card, UPI, netbanking). It is their script, loaded only when someone presses
// "Pay online"; card details go straight to Razorpay and never touch our servers.
const SRC = "https://checkout.razorpay.com/v1/checkout.js";

export type CheckoutResult = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

type CheckoutOptions = {
  key: string;
  order_id: string;
  amount: number; // paise
  currency: string;
  name: string;
  description: string;
  image?: string; // logo, absolute URL
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string; backdrop_color?: string };
  handler: (result: CheckoutResult) => void;
  modal?: { ondismiss?: () => void };
};

type RazorpayInstance = { open: () => void; on: (event: "payment.failed", cb: (e: { error: { description?: string } }) => void) => void };
type RazorpayConstructor = new (options: CheckoutOptions) => RazorpayInstance;

let loading: Promise<RazorpayConstructor> | null = null;

export function loadCheckout(): Promise<RazorpayConstructor> {
  const w = window as unknown as { Razorpay?: RazorpayConstructor };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onload = () => (w.Razorpay ? resolve(w.Razorpay) : reject(new Error("Razorpay did not load")));
    script.onerror = () => {
      loading = null; // allow a retry
      reject(new Error("Could not load the payment window. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return loading;
}
