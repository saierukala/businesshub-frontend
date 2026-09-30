"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SetupCard } from "./setup-card";
import { useSaveWorkingHours } from "@/lib/queries/technicians";
import type { Technician, WorkingDay } from "@/lib/types";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // show Monday first

const invalid = (d: WorkingDay) => !d.isOff && (!d.startTime || !d.endTime || d.startTime >= d.endTime);

export function HoursEditor({ technician }: { technician: Technician }) {
  const save = useSaveWorkingHours(technician.id);
  const [days, setDays] = useState<WorkingDay[]>(technician.workingHours);
  const dirty = JSON.stringify(days) !== JSON.stringify(technician.workingHours);
  // The API needs all 7 days. A technician with no saved hours starts from a default week.
  const complete = days.length === 7;

  function change(dayOfWeek: number, patch: Partial<WorkingDay>) {
    setDays((cur) => cur.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)));
  }

  return (
    <SetupCard
      title="Working hours"
      description="Times are India time (IST). Bookings are only offered inside these hours."
      dirty={dirty && complete && !days.some(invalid)}
      pending={save.isPending}
      onSave={() =>
        save.mutate({ days }, { onSuccess: () => toast.success("Working hours saved"), onError: (e) => toast.error(e.message) })
      }
    >
      {!complete ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">No working hours yet.</p>
          <button
            type="button"
            className="text-sm font-medium underline"
            onClick={() =>
              setDays(DAY_NAMES.map((_, dayOfWeek) => ({ dayOfWeek, startTime: "09:00", endTime: "18:00", isOff: dayOfWeek === 0 })))
            }
          >
            Start with Mon–Sat, 9:00–18:00
          </button>
        </div>
      ) : (
        <ul className="flex flex-col divide-y">
          {WEEK_ORDER.map((n) => {
            const d = days.find((x) => x.dayOfWeek === n)!;
            return (
              <li key={n} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5">
                <div className="flex w-36 items-center gap-3">
                  <Switch size="sm" checked={!d.isOff} onCheckedChange={(on) => change(n, { isOff: !on })} aria-label={`${DAY_NAMES[n]} working`} />
                  <span className="text-sm font-medium">{DAY_NAMES[n]}</span>
                </div>
                {d.isOff ? (
                  <span className="text-sm text-muted-foreground">Day off</span>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Input type="time" className="w-32" value={d.startTime} onChange={(e) => change(n, { startTime: e.target.value })} aria-label={`${DAY_NAMES[n]} start`} aria-invalid={invalid(d)} />
                    <span className="text-muted-foreground">to</span>
                    <Input type="time" className="w-32" value={d.endTime} onChange={(e) => change(n, { endTime: e.target.value })} aria-label={`${DAY_NAMES[n]} end`} aria-invalid={invalid(d)} />
                    {invalid(d) && <span className="text-xs text-destructive">End must be after start</span>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SetupCard>
  );
}
