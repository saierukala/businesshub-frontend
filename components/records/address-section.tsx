"use client";

import { RecordsSection } from "./records-section";
import { addressIcon } from "@/lib/record-icons";
import { AddressForm } from "./address-form";

// customerId omitted = the logged-in customer's own addresses.
export function AddressSection({ customerId }: { customerId?: string }) {
  return (
    <RecordsSection
      kind="addresses"
      customerId={customerId}
      title="Addresses"
      description="Where the technician comes for a repair."
      noun="address"
      emptyTitle="No addresses yet"
      emptyDescription="Add where the technician should come for repairs."
      describe={(a) => ({
        title: a.label,
        // Street on one line, area and city on the next.
        subtitle: `${a.line1}\n${[a.area, a.city, a.pincode].filter(Boolean).join(", ")}`,
        icon: addressIcon(a.label),
      })}
      renderForm={(a, onDone) => <AddressForm customerId={customerId} address={a} onDone={onDone} />}
    />
  );
}
