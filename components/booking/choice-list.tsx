"use client";

import { Check, Plus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Choice = { id: string; title: string; subtitle?: string; aside?: string; icon?: LucideIcon };

type Props = {
  label: string; // accessible name of the group
  items: Choice[];
  value?: string;
  onChange: (id: string) => void;
  addLabel?: string;
  onAdd?: () => void;
};

// A vertical list of big tappable cards where exactly one can be chosen (radio behaviour).
export function ChoiceList({ label, items, value, onChange, addLabel, onAdd }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" aria-label={label} className="flex flex-col gap-2">
        {items.map((item) => {
          const selected = item.id === value;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(item.id)}
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-xl border bg-card p-3 text-left transition-all hover:border-foreground/20 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                selected && "border-primary bg-primary/5 ring-1 ring-primary hover:border-primary hover:bg-primary/5",
              )}
            >
              {item.icon && (
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")} aria-hidden>
                  <item.icon className="size-5" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{item.title}</span>
                {item.subtitle && <span className="block text-sm text-muted-foreground">{item.subtitle}</span>}
              </span>
              {item.aside && <span className="rounded-full bg-muted px-2.5 py-1 text-sm font-semibold whitespace-nowrap tabular-nums">{item.aside}</span>}
              {/* The radio mark sits at the end, so the icon and title line up on the left. */}
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                )}
              >
                {selected && <Check className="size-3" />}
              </span>
            </button>
          );
        })}
      </div>
      {onAdd && (
        <Button type="button" variant="outline" className="w-fit" onClick={onAdd}>
          <Plus /> {addLabel}
        </Button>
      )}
    </div>
  );
}
