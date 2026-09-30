import { formatDuration, formatINR, formatSlot } from "@/lib/format";
import type { Address, Appliance, Service, SlotOption } from "@/lib/types";

type Props = {
  appliance: Appliance;
  service: Service;
  address: Address;
  problem: string;
  slot: SlotOption;
  extraRows?: [string, string][];
};

// Summary before confirming. The price shown is the service's base price; the technician
// confirms any extra charge after diagnosis (and the customer approves it first).
export function ReviewStep({ appliance, service, address, problem, slot, extraRows = [] }: Props) {
  const rows: [string, string][] = [
    ["When", formatSlot(slot.startAt, slot.endAt)],
    ["Appliance", `${appliance.brand} ${appliance.category.name}${appliance.model ? ` (${appliance.model})` : ""}`],
    ["Problem", problem],
    ["Service", `${service.name}, about ${formatDuration(service.durationMinutes)}`],
    ["Visit charge", formatINR(service.basePrice)],
    ["Address", [address.label, address.line1, address.area, address.city].filter(Boolean).join(", ")],
    ...extraRows,
  ];
  return (
    <dl className="divide-y rounded-lg border">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-1 p-3 sm:grid-cols-[9rem_1fr]">
          <dt className="text-sm text-muted-foreground">{k}</dt>
          <dd className="font-medium break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
