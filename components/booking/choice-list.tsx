"use client";

import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Choice = { id: string; title: string; subtitle?: string; aside?: string };

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
                "flex min-h-14 items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                selected && "border-primary bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                )}
              >
                {selected && <Check className="size-3" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{item.title}</span>
                {item.subtitle && <span className="block text-sm text-muted-foreground">{item.subtitle}</span>}
              </span>
              {item.aside && <span className="text-sm font-medium whitespace-nowrap">{item.aside}</span>}
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
