import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// One labelled fact with an icon (When, Address, Technician...). Used in the booking and visit cards.
export function DetailItem({ icon: Icon, label, children, className }: { icon: LucideIcon; label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-3", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground" aria-hidden>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
        <dd className="mt-0.5 font-medium break-words">{children}</dd>
      </div>
    </div>
  );
}
