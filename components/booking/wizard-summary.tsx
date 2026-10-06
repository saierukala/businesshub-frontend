import { CalendarDays, Wrench, type LucideIcon } from "lucide-react";
import { formatINR, formatSlot } from "@/lib/format";
import { addressIcon, applianceIcon } from "@/lib/record-icons";
import { cn } from "@/lib/utils";
import type { Address, Appliance, Service, SlotOption } from "@/lib/types";

function Line({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value?: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")} aria-hidden>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 text-sm">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn("break-words", value ? "font-medium" : "text-muted-foreground")}>{value ?? "Not chosen yet"}</div>
      </div>
    </div>
  );
}

// "Your booking" beside the wizard: fills in as each step is answered. Display only; the API checks everything.
export function WizardSummary(p: { appliance?: Appliance; service?: Service; address?: Address; slot?: SlotOption }) {
  return (
    <aside className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 lg:sticky lg:top-20">
      <h3 className="font-semibold">Your booking</h3>
      <Line icon={p.appliance ? applianceIcon(p.appliance.category.name) : applianceIcon("")} label="Appliance" value={p.appliance && `${p.appliance.brand} ${p.appliance.category.name}`} />
      <Line icon={Wrench} label="Service" value={p.service?.name} />
      <Line icon={p.address ? addressIcon(p.address.label) : addressIcon("")} label="Address" value={p.address && `${p.address.label}, ${p.address.area}`} />
      <Line icon={CalendarDays} label="Date and time" value={p.slot && formatSlot(p.slot.startAt, p.slot.endAt)} />
      <div className="flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-muted-foreground">Visit charge</span>
        <span className="text-base font-semibold tabular-nums">{p.service ? formatINR(p.service.basePrice) : "—"}</span>
      </div>
    </aside>
  );
}
