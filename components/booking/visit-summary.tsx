import { formatDate, formatINR, formatTime } from "@/lib/format";
import type { Visit } from "@/lib/types";

const EXTRA_LABEL = { NONE: "", PROPOSED: "Waiting for the customer", APPROVED: "Approved", DECLINED: "Declined" } as const;

// What the technician recorded, for the customer and staff. Amounts come from the API; nothing is added up here.
export function VisitSummary({ visit }: { visit: Visit }) {
  const extra = visit.extraCharge;
  const rows: [string, string | null][] = [
    ["Started", visit.startedAt ? `${formatDate(visit.startedAt)}, ${formatTime(visit.startedAt)}` : null],
    ["Finished", visit.completedAt ? `${formatDate(visit.completedAt)}, ${formatTime(visit.completedAt)}` : null],
    ["What was found", visit.diagnosis],
    ["Work done", visit.workPerformed],
    ["Parts", visit.partsNote],
    ["Notes", visit.notes],
    ["Result", visit.result],
    [
      "Extra charge",
      extra.status === "NONE" ? null : `${extra.amount ? formatINR(extra.amount) : ""} · ${EXTRA_LABEL[extra.status]}${extra.reason ? ` · ${extra.reason}` : ""}`,
    ],
    [visit.completedAt ? "Total to pay" : "Total so far", formatINR(visit.finalAmount)],
  ];
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Visit report</h2>
      <dl className="divide-y rounded-lg border">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="grid gap-1 p-3 sm:grid-cols-[9rem_1fr]">
              <dt className="text-sm text-muted-foreground">{k}</dt>
              <dd className="font-medium break-words">{v}</dd>
            </div>
          ))}
      </dl>
    </section>
  );
}
