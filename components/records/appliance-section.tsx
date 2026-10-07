"use client";

import { RecordsSection } from "./records-section";
import { ApplianceForm } from "./appliance-form";
import { Plug } from "lucide-react";
import { applianceIcon } from "@/lib/record-icons";

// customerId omitted = the logged-in customer's own appliances.
export function ApplianceSection({ customerId }: { customerId?: string }) {
  return (
    <RecordsSection
      kind="appliances"
      customerId={customerId}
      title="Appliances"
      icon={Plug}
      description="Saved here, they are one tap away when you book. Each keeps its repair history."
      noun="appliance"
      emptyTitle="No appliances yet"
      emptyDescription="Add the appliances that may need repairs, so booking is quicker."
      describe={(a) => ({
        title: `${a.brand} ${a.category.name}`,
        subtitle:
          [a.model && `Model ${a.model}`, a.purchaseYear && `Bought ${a.purchaseYear}`, a.serialNumber && `S/N ${a.serialNumber}`]
            .filter(Boolean)
            .join(" · ") || "No model details",
        icon: applianceIcon(a.category.name),
      })}
      renderForm={(a, onDone) => <ApplianceForm customerId={customerId} appliance={a} onDone={onDone} />}
    />
  );
}
