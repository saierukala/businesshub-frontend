import { CalendarDays, Info, IndianRupee, MessageSquareText, UserRound, Wrench } from "lucide-react";
import { formatDuration, formatINR, formatSlot } from "@/lib/format";
import { addressIcon, applianceIcon } from "@/lib/record-icons";
import { DetailItem } from "./detail-item";
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
  return (
    // Two columns only when the card itself is wide enough (it sits beside the summary on big screens).
    <div className="@container flex flex-col gap-4">
      <dl className="grid gap-5 @md:grid-cols-2">
        <DetailItem icon={CalendarDays} label="When">
          {formatSlot(slot.startAt, slot.endAt)}
        </DetailItem>
        <DetailItem icon={Wrench} label="Service">
          {service.name}
          <span className="block text-sm font-normal text-muted-foreground">About {formatDuration(service.durationMinutes)}</span>
        </DetailItem>
        <DetailItem icon={applianceIcon(appliance.category.name)} label="Appliance">
          {appliance.brand} {appliance.category.name}
          {appliance.model && <span className="block text-sm font-normal text-muted-foreground">Model {appliance.model}</span>}
        </DetailItem>
        <DetailItem icon={IndianRupee} label="Visit charge">
          {formatINR(service.basePrice)}
        </DetailItem>
        <DetailItem icon={addressIcon(address.label)} label="Address" className="@md:col-span-2">
          <span className="block text-sm font-normal text-muted-foreground">{address.label}</span>
          {[address.line1, address.area, address.city].filter(Boolean).join(", ")}
        </DetailItem>
        <DetailItem icon={MessageSquareText} label="Problem" className="@md:col-span-2">
          {problem}
        </DetailItem>
        {extraRows.map(([label, value]) => (
          <DetailItem key={label} icon={UserRound} label={label}>
            {value}
          </DetailItem>
        ))}
      </dl>
      <p className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        You pay the visit charge after the repair. If the technician finds extra work, they ask you first: nothing extra is done or charged without your approval.
      </p>
    </div>
  );
}
