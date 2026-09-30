"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FormDialog } from "@/components/common/form-dialog";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { FormAlert } from "@/components/form/form-alert";
import { ChoiceList } from "./choice-list";
import { useAssignableTechnicians, useAssignTechnician } from "@/lib/queries/bookings";
import { formatSlot } from "@/lib/format";
import type { Booking } from "@/lib/types";

type Props = { booking: Booking; open: boolean; onOpenChange: (o: boolean) => void };

// Pick who goes to the customer. The list comes from the API: only technicians who are qualified
// and free at this booking's time. The API checks again when you confirm.
export function AssignDialog({ booking, open, onOpenChange }: Props) {
  const options = useAssignableTechnicians(booking.id, open);
  const assign = useAssignTechnician(booking.id);
  const [choice, setChoice] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const reassigning = booking.status === "ASSIGNED";

  function submit() {
    if (!choice) return;
    setError(null);
    assign.mutate(
      { technicianId: choice },
      {
        onSuccess: () => {
          toast.success(reassigning ? "Technician changed" : "Technician assigned");
          onOpenChange(false);
        },
        onError: (err) => {
          setError(err.message);
          setChoice(undefined); // the list was refreshed: choose again
        },
      },
    );
  }

  const items = options.data?.items ?? [];

  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => !assign.isPending && onOpenChange(o)}
      title={reassigning ? "Change technician" : "Assign technician"}
      description={`${booking.bookingNumber} · ${formatSlot(booking.startAt, booking.endAt)}`}
    >
      <div className="flex flex-col gap-4">
        <FormAlert message={error ?? undefined} />
        {options.isPending ? (
          <ListSkeleton rows={3} />
        ) : options.isError ? (
          <ErrorState error={options.error} onRetry={() => options.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title="Nobody is free at this time" description="No qualified technician is available. Reschedule with the customer instead." />
        ) : (
          <ChoiceList
            label="Technician"
            items={items.map((t) => ({ id: t.id, title: t.name, subtitle: t.isCurrent ? "Currently assigned" : undefined }))}
            value={choice}
            onChange={setChoice}
          />
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={assign.isPending} onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled={!choice || assign.isPending || (reassigning && choice === booking.technician?.id)} aria-busy={assign.isPending} onClick={submit}>
            {assign.isPending && <Spinner />}
            {reassigning ? "Change technician" : "Assign"}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
