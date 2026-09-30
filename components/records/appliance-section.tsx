"use client";

import { RecordsSection } from "./records-section";
import { ApplianceForm } from "./appliance-form";

// customerId omitted = the logged-in customer's own appliances.
export function ApplianceSection({ customerId }: { customerId?: string }) {
  return (
    <RecordsSection
      kind="appliances"
      customerId={customerId}
      title="Appliances"
      noun="appliance"
      emptyTitle="No appliances yet"
      emptyDescription="Add the appliances that may need repairs, so booking is quicker."
      describe={(a) => ({
        title: `${a.brand} ${a.category.name}`,
        subtitle:
          [a.model, a.purchaseYear && `bought ${a.purchaseYear}`, a.serialNumber && `S/N ${a.serialNumber}`]
            .filter(Boolean)
            .join(" · ") || "No model details",
      })}
      renderForm={(a, onDone) => <ApplianceForm customerId={customerId} appliance={a} onDone={onDone} />}
    />
  );
}
