"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchBox } from "@/components/common/search-box";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type PickerOption = { id: string; name: string; hint?: string };

type Props = {
  label: string; // "Customer": used for the search box and screen readers
  allLabel: string; // shown when nothing is picked, e.g. "All customers"
  selected: string; // the picked option's name ("" = none)
  // Searches the API as the user types. Only runs while the popover is open.
  useOptions: (q: string, enabled: boolean) => { options: PickerOption[]; isPending: boolean };
  onChange: (id: string | undefined) => void;
};

// A filter button: click, type a name (or phone), pick one. The X clears it.
// The search runs on the server, so it finds anyone, not only the first page.
export function SearchPicker({ label, allLabel, selected, useOptions, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { options, isPending } = useOptions(q, open);

  const pick = (id: string | undefined) => {
    onChange(id);
    setOpen(false);
    setQ("");
  };

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" aria-label={`Filter by ${label.toLowerCase()}`} className={cn("w-full justify-between font-normal sm:w-48", !selected && "text-muted-foreground")} />
          }
        >
          <span className="truncate">{selected || allLabel}</span>
          <ChevronDown className="opacity-60" />
        </PopoverTrigger>
        <PopoverContent className="flex w-72 flex-col gap-2 p-2" align="start">
          <SearchBox value={q} onSearch={setQ} label={`Search ${label.toLowerCase()}`} placeholder={`Search ${label.toLowerCase()}…`} />
          <ul className="flex max-h-64 flex-col overflow-y-auto">
            {isPending ? (
              <li className="flex justify-center p-3">
                <Spinner />
              </li>
            ) : options.length === 0 ? (
              <li className="p-3 text-sm text-muted-foreground">No match</li>
            ) : (
              options.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => pick(o.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                  >
                    <span className="truncate font-medium">{o.name}</span>
                    {o.hint && <span className="shrink-0 text-xs text-muted-foreground">{o.hint}</span>}
                  </button>
                </li>
              ))
            )}
          </ul>
        </PopoverContent>
      </Popover>
      {selected && (
        <Button type="button" variant="ghost" size="icon" aria-label={`Clear ${label.toLowerCase()} filter`} onClick={() => pick(undefined)}>
          <X />
        </Button>
      )}
    </div>
  );
}
