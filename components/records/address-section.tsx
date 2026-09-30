"use client";

import { RecordsSection } from "./records-section";
import { AddressForm } from "./address-form";

// customerId omitted = the logged-in customer's own addresses.
export function AddressSection({ customerId }: { customerId?: string }) {
  return (
    <RecordsSection
      kind="addresses"
      customerId={customerId}
      title="Addresses"
      noun="address"
      emptyTitle="No addresses yet"
      emptyDescription="Add where the technician should come for repairs."
      describe={(a) => ({
        title: a.label,
        subtitle: [a.line1, a.area, a.city, a.pincode].filter(Boolean).join(", "),
      })}
      renderForm={(a, onDone) => <AddressForm customerId={customerId} address={a} onDone={onDone} />}
    />
  );
}
