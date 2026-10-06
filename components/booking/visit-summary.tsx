import { ClipboardCheck, Clock, Package, Receipt, Search, StickyNote, Wrench, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatINR, formatTime } from "@/lib/format";
import { DetailItem } from "./detail-item";
import type { Visit } from "@/lib/types";

const EXTRA_LABEL = { NONE: "", PROPOSED: "Waiting for the customer", APPROVED: "Approved", DECLINED: "Declined" } as const;
const at = (iso: string) => `${formatDate(iso)}, ${formatTime(iso)}`;

// What the technician recorded, for the customer and staff. Amounts come from the API; nothing is added up here.
export function VisitSummary({ visit }: { visit: Visit }) {
  const extra = visit.extraCharge;
  const items: [LucideIcon, string, string | null][] = [
    [Clock, "Started", visit.startedAt ? at(visit.startedAt) : null],
    [ClipboardCheck, "Finished", visit.completedAt ? at(visit.completedAt) : null],
    [Search, "What was found", visit.diagnosis],
    [Wrench, "Work done", visit.workPerformed],
    [Package, "Parts", visit.partsNote],
    [StickyNote, "Notes", visit.notes],
    [ClipboardCheck, "Result", visit.result],
    [
      Receipt,
      "Extra charge",
      extra.status === "NONE" ? null : `${extra.amount ? formatINR(extra.amount) : ""} · ${EXTRA_LABEL[extra.status]}${extra.reason ? ` · ${extra.reason}` : ""}`,
    ],
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visit report</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <dl className="grid gap-5 sm:grid-cols-2">
          {items
            .filter(([, , v]) => v)
            .map(([icon, label, v]) => (
              <DetailItem key={label} icon={icon} label={label}>
                {v}
              </DetailItem>
            ))}
        </dl>
        <div className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3">
          <span className="text-sm text-muted-foreground">{visit.completedAt ? "Total to pay" : "Total so far"}</span>
          <span className="text-xl font-semibold tabular-nums">{formatINR(visit.finalAmount)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
