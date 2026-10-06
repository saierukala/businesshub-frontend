"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ban,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  Inbox,
  IndianRupee,
  MapPin,
  MessageSquareText,
  Phone,
  UserCheck,
  UserRound,
  UserX,
  WashingMachine,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState } from "@/components/common/query-states";
import { StatusBadge } from "@/components/status-badge";
import { AssignDialog } from "./assign-dialog";
import { BookingHistory } from "./booking-history";
import { BookingProgress } from "./booking-progress";
import { DetailItem } from "./detail-item";
import { PastOpenAlert } from "./past-open-alert";
import { CancelDialog } from "./cancel-dialog";
import { ExtraChargeDecision } from "./extra-charge-decision";
import { FollowUpDialog } from "./follow-up-dialog";
import { RescheduleDialog } from "./reschedule-dialog";
import { VisitSummary } from "./visit-summary";
import { PaymentSection } from "@/components/payment/payment-section";
import { ReviewSection } from "@/components/reviews/review-section";
import { useBooking, useMarkNoShow } from "@/lib/queries/bookings";
import { formatDuration, formatINR, formatPhone, formatSlot } from "@/lib/format";
import type { BookingDetail as Detail, BookingStatus } from "@/lib/types";

// Statuses where the visit can still be moved or cancelled. (The API enforces this and the time windows.)
const OPEN: BookingStatus[] = ["PENDING", "CONFIRMED", "ASSIGNED"];
const SOURCE_LABEL = { ONLINE: "Booked online", PHONE: "Phone call", WHATSAPP: "WhatsApp", WALK_IN: "Walk-in" } as const;

// Staff can mark no-show once a technician is on the job AND the visit time has started (the API checks both).
const NO_SHOW_FROM: BookingStatus[] = ["ASSIGNED", "EN_ROUTE", "ARRIVED"];

export function BookingDetail({ id, staff = false }: { id: string; staff?: boolean }) {
  const query = useBooking(id);
  const noShow = useMarkNoShow(id);
  const [dialog, setDialog] = useState<"reschedule" | "cancel" | "noshow" | "assign" | "followup" | null>(null);
  const [openedAt] = useState(() => Date.now());

  if (query.isPending) return <Skeleton className="h-64 w-full" aria-busy="true" aria-label="Loading" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const b: Detail = query.data;
  const isOpen = OPEN.includes(b.status);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{b.bookingNumber}</h1>
          <StatusBadge status={b.status} />
          {b.needsReassignment && <span className="text-sm font-medium text-destructive">Needs a new technician</span>}
          {b.followUpOf && (
            <Link href={`${staff ? "/staff/bookings" : "/bookings"}/${b.followUpOf.id}`} className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground">
              Follow-up to {b.followUpOf.bookingNumber}
            </Link>
          )}
        </div>
        <p className="text-muted-foreground">
          {b.service.name} · {formatSlot(b.startAt, b.endAt)}
        </p>
      </div>

      <BookingProgress status={b.status} />

      {/* No email on file: the app cannot message this customer (no SMS/WhatsApp in v1), so staff must phone them. */}
      {staff && !b.customer.email && [...OPEN, "EN_ROUTE", "ARRIVED", "IN_PROGRESS"].includes(b.status) && (
        <Alert className="border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10">
          <Phone />
          <AlertTitle>Phone-only customer: call to keep them informed</AlertTitle>
          <AlertDescription>
            {b.customer.name} has no email, so they get no messages. Call {formatPhone(b.customer.phone)} about changes, and to remind them before the visit.
            {b.visit?.extraCharge.status === "PROPOSED" && " Their approval of the extra charge is waiting: ask them and record the answer above."}
          </AlertDescription>
        </Alert>
      )}

      {staff && <PastOpenAlert booking={b} />}

      <ExtraChargeDecision booking={b} staff={staff} />

      {(isOpen || (staff && (NO_SHOW_FROM.includes(b.status) || b.status === "IN_PROGRESS" || b.status === "COMPLETED"))) && (
        <div className="flex flex-wrap gap-2">
          {staff && (b.status === "CONFIRMED" || b.status === "ASSIGNED") && (
            <Button size="lg" variant={b.needsReassignment || b.status === "CONFIRMED" ? "default" : "outline"} onClick={() => setDialog("assign")}>
              <UserCheck /> {b.status === "ASSIGNED" ? "Change technician" : "Assign technician"}
            </Button>
          )}
          {isOpen && (
            <>
              <Button variant="outline" size="lg" onClick={() => setDialog("reschedule")}>
                <CalendarClock /> Reschedule
              </Button>
              <Button variant="outline" size="lg" onClick={() => setDialog("cancel")}>
                <Ban /> Cancel booking
              </Button>
            </>
          )}
          {staff && NO_SHOW_FROM.includes(b.status) && new Date(b.startAt).getTime() <= openedAt && (
            <Button variant="outline" size="lg" onClick={() => setDialog("noshow")}>
              <UserX /> Mark no-show
            </Button>
          )}
          {staff && (b.status === "IN_PROGRESS" || b.status === "COMPLETED") && (
            <Button variant="outline" size="lg" onClick={() => setDialog("followup")}>
              <CalendarPlus /> Book follow-up
            </Button>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Booking details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailItem icon={CalendarDays} label="When">
              {formatSlot(b.startAt, b.endAt)}
            </DetailItem>
            <DetailItem icon={Wrench} label="Service">
              {b.service.name}
              <span className="block text-sm font-normal text-muted-foreground">About {formatDuration(b.service.durationMinutes)}</span>
            </DetailItem>
            <DetailItem icon={IndianRupee} label="Visit charge">
              {formatINR(b.service.basePrice)}
            </DetailItem>
            <DetailItem icon={WashingMachine} label="Appliance">
              {b.appliance.brand} {b.appliance.category.name}
              {b.appliance.model && <span className="block text-sm font-normal text-muted-foreground">Model {b.appliance.model}</span>}
            </DetailItem>
            <DetailItem icon={UserRound} label="Technician">
              {b.technician?.name ?? <span className="font-normal text-muted-foreground">Not assigned yet</span>}
            </DetailItem>
            {staff && (
              <DetailItem icon={Inbox} label="Source">
                {SOURCE_LABEL[b.source]}
              </DetailItem>
            )}
            <DetailItem icon={MapPin} label="Address" className="sm:col-span-2">
              {b.address.label && <span className="block text-sm font-normal text-muted-foreground">{b.address.label}</span>}
              {[b.address.line1, b.address.area, b.address.city].filter(Boolean).join(", ")}
            </DetailItem>
            <DetailItem icon={MessageSquareText} label="Problem" className="sm:col-span-2">
              {b.problemDescription}
            </DetailItem>
            {staff && (
              <DetailItem icon={Phone} label="Customer" className="sm:col-span-2">
                {b.customer.name}
                <a href={`tel:+91${b.customer.phone}`} className="block text-sm font-normal text-primary hover:underline">
                  {formatPhone(b.customer.phone)}
                </a>
              </DetailItem>
            )}
          </dl>
        </CardContent>
      </Card>

      {b.visit && <VisitSummary visit={b.visit} />}
      <PaymentSection booking={b} canRecord={staff} receiptHref={`${staff ? "/staff/bookings" : "/bookings"}/${b.id}/receipt`} />
      <ReviewSection booking={b} canReview={!staff} />

      <BookingHistory history={b.history} />

      {/* key: a fresh dialog (empty fields, no old error) each time it opens */}
      <RescheduleDialog key={`r${dialog}`} booking={b} open={dialog === "reschedule"} onOpenChange={(o) => !o && setDialog(null)} />
      {staff && <FollowUpDialog key={`f${dialog}`} booking={b} staff open={dialog === "followup"} onOpenChange={(o) => !o && setDialog(null)} />}
      {staff && <AssignDialog key={`a${dialog}`} booking={b} open={dialog === "assign"} onOpenChange={(o) => !o && setDialog(null)} />}
      <CancelDialog key={`c${dialog}`} booking={b} open={dialog === "cancel"} onOpenChange={(o) => !o && setDialog(null)} />
      <ConfirmDialog
        open={dialog === "noshow"}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Mark as no-show?"
        description={`The customer was not there for ${b.bookingNumber}. This ends the booking and frees the technician's time.`}
        confirmLabel="Mark no-show"
        destructive
        onConfirm={() =>
          noShow.mutateAsync({}).then(
            () => toast.success("Marked as no-show"),
            (err: Error) => {
              toast.error(err.message);
              throw err;
            },
          )
        }
      />
    </div>
  );
}
