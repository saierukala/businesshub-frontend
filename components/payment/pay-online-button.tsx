"use client";

import Link from "next/link";
import { CreditCard, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { usePaymentConfig } from "@/lib/queries/payments";

// On the customer's completed booking: "Pay ₹799 online" opens the HomeFix checkout page.
// Hidden when online payment is not set up on the server.
export function PayOnlineButton({ bookingId, amountLabel }: { bookingId: string; amountLabel: string }) {
  const config = usePaymentConfig();
  if (!config.data?.online.enabled) return null;

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <Link href={`/bookings/${bookingId}/pay`} className={buttonVariants({ size: "lg", className: "h-12 w-full px-6 text-base sm:w-auto" })}>
        <CreditCard /> Pay {amountLabel} online
      </Link>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-end">
        <ShieldCheck className="size-3.5 text-green-600" aria-hidden />
        Secured by Razorpay · UPI, cards, netbanking
      </p>
    </div>
  );
}
