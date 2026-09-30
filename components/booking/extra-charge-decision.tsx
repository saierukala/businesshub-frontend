"use client";

import { Check, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDecideExtraCharge } from "@/lib/queries/visits";
import { formatINR } from "@/lib/format";
import type { BookingDetail } from "@/lib/types";

// The technician found extra work and asked for more money. Nothing beyond the base service happens until
// this is approved. The customer answers here; staff use it to record the customer's answer from a phone call.
export function ExtraChargeDecision({ booking, staff = false }: { booking: BookingDetail; staff?: boolean }) {
  const decide = useDecideExtraCharge(booking.id);
  const extra = booking.visit?.extraCharge;
  if (!extra || extra.status !== "PROPOSED" || booking.status !== "IN_PROGRESS") return null;

  function answer(decision: "APPROVED" | "DECLINED") {
    decide.mutate(decision, {
      onSuccess: () => toast.success(decision === "APPROVED" ? "Extra charge approved" : "Extra charge declined"),
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Alert className="border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10">
      <TriangleAlert />
      <AlertTitle>{staff ? "Extra charge waiting for the customer" : "The technician needs your approval"}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <p>
          <span className="font-semibold">{extra.amount ? formatINR(extra.amount) : ""} extra</span>: {extra.reason}
        </p>
        <p>
          {staff
            ? "If the customer told you their answer by phone, record it here. It is saved with your name."
            : `Visit charge ${formatINR(booking.service.basePrice)} + extra ${extra.amount ? formatINR(extra.amount) : ""}. The extra work only starts if you approve.`}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="lg" disabled={decide.isPending} onClick={() => answer("APPROVED")}>
            {decide.isPending ? <Spinner /> : <Check />} Approve
          </Button>
          <Button size="lg" variant="outline" disabled={decide.isPending} onClick={() => answer("DECLINED")}>
            <X /> Decline
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
