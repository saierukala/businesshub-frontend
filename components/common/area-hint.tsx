"use client";

import { TriangleAlert } from "lucide-react";
import { closeMatch, describeUse, tidyArea, type AreaInUse } from "@/lib/areas";

// <datalist> of known areas: the browser offers them as you type in an <Input list={AREA_LIST_ID}>.
export const AREA_LIST_ID = "known-areas";

export function AreaOptions({ areas }: { areas: AreaInUse[] }) {
  return (
    <datalist id={AREA_LIST_ID}>
      {areas.map((a) => (
        <option key={a.area} value={a.area} />
      ))}
    </datalist>
  );
}

// A warning under an area box when the typed area is new or looks like a misspelling.
// `forCustomer`: the customer's own address form (they only know technician areas).
export function AreaHint({ value, areas, forCustomer = false }: { value: string; areas: AreaInUse[] | undefined; forCustomer?: boolean }) {
  const area = tidyArea(value);
  if (!areas || area.length < 2) return null;

  const known = areas.find((a) => a.area === area);
  const similar = closeMatch(area, areas);
  let message: string | null = null;

  if (known) {
    if (known.technicians === 0) {
      message = forCustomer
        ? `No technician covers ${area} yet, so you may not find time slots there.`
        : `No technician covers ${area} yet: bookings at this address will have no slots.`;
    }
  } else if (similar) {
    message = `Did you mean ${similar.area}? (${describeUse(similar)})`;
  } else {
    message = forCustomer
      ? `No technician covers ${area} yet, so you may not find time slots there. Check the spelling.`
      : `New area: nobody uses ${area} yet. Check the spelling: it must match exactly between addresses and technicians.`;
  }

  if (!message) return null;
  return (
    <p role="status" className="flex items-start gap-1.5 text-sm text-amber-700 dark:text-amber-400">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}
