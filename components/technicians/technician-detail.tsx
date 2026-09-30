"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/query-states";
import { SkillsEditor } from "./skills-editor";
import { AreasEditor } from "./areas-editor";
import { HoursEditor } from "./hours-editor";
import { TimeOffSection } from "./time-off-section";
import { useTechnician } from "@/lib/queries/technicians";
import { formatPhone } from "@/lib/format";

export function TechnicianDetail({ id }: { id: string }) {
  const technician = useTechnician(id);

  if (technician.isPending) return <Skeleton className="h-40 w-full" aria-busy="true" aria-label="Loading" />;
  if (technician.isError) return <ErrorState error={technician.error} onRetry={() => technician.refetch()} />;

  const t = technician.data;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t.name}</h1>
          {t.status === "INACTIVE" && <Badge variant="destructive">Inactive</Badge>}
        </div>
        <p className="text-muted-foreground">
          {formatPhone(t.phone)}
          {t.email && ` · ${t.email}`}
        </p>
      </div>
      {/* Each editor keeps its own draft, so saving one never wipes unsaved edits in another. */}
      <SkillsEditor technician={t} />
      <AreasEditor technician={t} />
      <HoursEditor technician={t} />
      <TimeOffSection technicianId={t.id} />
    </div>
  );
}
