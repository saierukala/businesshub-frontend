import { createElement } from "react";
import { MapPin, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { applianceIcon } from "@/lib/record-icons";
import { formatPhone, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Technician, WorkingDay } from "@/lib/types";

// Small pieces of a technician row, shared by the table and the phone cards.

export function TechPerson({ t }: { t: Technician }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          t.status === "ACTIVE" ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-muted text-muted-foreground",
        )}
        aria-hidden
      >
        {initials(t.name)}
      </span>
      <div className="min-w-0">
        <div className="truncate font-medium">{t.name}</div>
        <div className="truncate text-xs text-muted-foreground">{formatPhone(t.phone)}</div>
      </div>
    </div>
  );
}

const None = () => <span className="text-sm text-muted-foreground italic">None yet</span>;

// Shows the first few, then "+N" so long lists don't stretch the row.
function More({ n }: { n: number }) {
  return n > 0 ? <span className="text-xs text-muted-foreground">+{n}</span> : null;
}

export function SkillChips({ skills, max = 3 }: { skills: Technician["skills"]; max?: number }) {
  if (skills.length === 0) return <None />;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {skills.slice(0, max).map((s) => (
        <Badge key={s.id} variant="secondary" className="gap-1">
          {createElement(applianceIcon(s.name), { className: "size-3", "aria-hidden": true })}
          {s.name}
        </Badge>
      ))}
      <More n={skills.length - max} />
    </div>
  );
}

export function AreaList({ areas, max = 2 }: { areas: string[]; max?: number }) {
  if (areas.length === 0) return <None />;
  return (
    <div className="flex items-center gap-1.5 text-sm" title={areas.join(", ")}>
      <MapPin className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="truncate">{areas.slice(0, max).join(", ")}</span>
      <More n={areas.length - max} />
    </div>
  );
}

// Monday first, as the week is usually read here. dayOfWeek: 0 = Sunday.
const WEEK = [
  { day: 1, letter: "M", name: "Monday" },
  { day: 2, letter: "T", name: "Tuesday" },
  { day: 3, letter: "W", name: "Wednesday" },
  { day: 4, letter: "T", name: "Thursday" },
  { day: 5, letter: "F", name: "Friday" },
  { day: 6, letter: "S", name: "Saturday" },
  { day: 0, letter: "S", name: "Sunday" },
];

// "09:00" -> "9 am", "18:30" -> "6:30 pm". These are IST wall-clock times from the API, not instants.
function clock(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h! < 12 ? "am" : "pm";
  const h12 = h! % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
}

const working = (days: WorkingDay[]) => days.filter((d) => !d.isOff);

export function WeekStrip({ days }: { days: WorkingDay[] }) {
  const on = working(days);
  if (on.length === 0) return <span className="text-sm text-muted-foreground italic">No hours set</span>;

  const byDay = new Map(days.map((d) => [d.dayOfWeek, d]));
  const same = on.every((d) => d.startTime === on[0]!.startTime && d.endTime === on[0]!.endTime);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-0.5" aria-label={`Works ${on.length} days a week`}>
        {WEEK.map(({ day, letter, name }) => {
          const d = byDay.get(day);
          const isOn = d && !d.isOff;
          return (
            <span
              key={day}
              title={isOn ? `${name}: ${clock(d.startTime)} – ${clock(d.endTime)}` : `${name}: off`}
              className={cn(
                "flex size-5 items-center justify-center rounded text-[10px] font-semibold",
                isOn ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground/60",
              )}
            >
              {letter}
            </span>
          );
        })}
      </div>
      <span className="text-xs text-muted-foreground">
        {same ? `${clock(on[0]!.startTime)} – ${clock(on[0]!.endTime)}` : "Hours vary by day"}
      </span>
    </div>
  );
}

// What the technician still needs before the booking engine can use them (display only, the API decides).
export function missingSetup(t: Technician): string[] {
  const missing: string[] = [];
  if (t.skills.length === 0) missing.push("skills");
  if (t.areas.length === 0) missing.push("areas");
  if (working(t.workingHours).length === 0) missing.push("hours");
  return missing;
}

export function StatusCell({ t }: { t: Technician }) {
  const missing = missingSetup(t);
  return (
    <div className="flex flex-col items-start gap-1">
      {t.status === "ACTIVE" ? (
        <Badge variant="outline" className="gap-1.5">
          <span className="size-1.5 rounded-full bg-green-600 dark:bg-green-400" aria-hidden />
          Active
        </Badge>
      ) : (
        <Badge variant="secondary">Inactive</Badge>
      )}
      {t.status === "ACTIVE" && missing.length > 0 && (
        <span className="flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
          <TriangleAlert className="size-3" aria-hidden />
          Needs {missing.join(", ")}
        </span>
      )}
    </div>
  );
}
