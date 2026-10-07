"use client";

import { Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useSetServiceActive } from "@/lib/queries/catalog";
import { formatDuration, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/types";

// Small pieces shared by the card view and the table view of the services list.

export function ServiceName({ s }: { s: Service }) {
  return (
    <div className="min-w-0">
      <div className="truncate font-medium">{s.name}</div>
      {s.description && <div className="line-clamp-1 text-xs text-muted-foreground">{s.description}</div>}
    </div>
  );
}

export function DurationText({ minutes }: { minutes: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground tabular-nums">
      <Clock className="size-3.5" />
      {formatDuration(minutes)}
    </span>
  );
}

export function PriceText({ amount, className }: { amount: string; className?: string }) {
  return <span className={cn("font-semibold tabular-nums", className)}>{formatINR(amount)}</span>;
}

// A service is bookable only when it is on AND its appliance type is on.
// Shown only when it is NOT bookable; the switch already says the normal case.
export function StatusBadge({ s }: { s: Service }) {
  if (!s.active) return <Badge variant="outline">Hidden</Badge>;
  if (!s.category.active)
    return (
      <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400" title="Turn the appliance type back on below">
        Appliance type off
      </Badge>
    );
  return null;
}

export function BookableSwitch({ s }: { s: Service }) {
  const setActive = useSetServiceActive();
  return (
    <Switch
      checked={s.active}
      aria-label={`${s.name} bookable`}
      disabled={setActive.isPending}
      onClick={(e) => e.stopPropagation()}
      onCheckedChange={(active) =>
        setActive.mutate(
          { id: s.id, active },
          {
            onSuccess: () => toast.success(active ? `${s.name} is bookable` : `${s.name} hidden from customers`),
            onError: (err) => toast.error(err.message),
          },
        )
      }
    />
  );
}
