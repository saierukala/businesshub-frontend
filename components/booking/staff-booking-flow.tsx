"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookingWizard } from "./booking-wizard";
import { CustomerPicker } from "./customer-picker";
import { formatPhone } from "@/lib/format";
import type { Customer } from "@/lib/types";

// Staff booking on behalf of a customer: choose the customer, then the same wizard the customer uses.
export function StaffBookingFlow() {
  const [customer, setCustomer] = useState<Customer | null>(null);

  if (!customer) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Who is this for?</h2>
        <CustomerPicker onSelect={setCustomer} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3">
        <div>
          <p className="text-sm text-muted-foreground">Booking for</p>
          <p className="font-medium">
            {customer.name} · {formatPhone(customer.phone)}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCustomer(null)}>
          Change
        </Button>
      </div>
      {/* key: switching customer starts a fresh wizard, so nothing from the previous customer is reused */}
      <BookingWizard key={customer.id} customerId={customer.id} />
    </div>
  );
}
