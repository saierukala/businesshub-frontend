"use client";

import { ClipboardList, HardHat, IndianRupee, Wrench } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useListParams } from "@/hooks/use-list-params";
import type { ReportRange } from "@/lib/queries/reports";
import { BookingsReport } from "./bookings-report";
import { ServicesReport, TechniciansReport } from "./breakdown-report";
import { ReportFilters } from "./report-filters";
import { RevenueReport } from "./revenue-report";

const TABS = [
  { value: "bookings", label: "Bookings", icon: ClipboardList },
  { value: "revenue", label: "Revenue", icon: IndianRupee },
  { value: "services", label: "Services", icon: Wrench },
  { value: "technicians", label: "Technicians", icon: HardHat },
] as const;
type Tab = (typeof TABS)[number]["value"];

// Reports for Owner and Manager. Tab, dates, grouping and page live in the URL, so a view can be shared or reloaded.
export function ReportsView() {
  const { get, page, set } = useListParams();
  const tab = (TABS.find((t) => t.value === get("tab"))?.value ?? "bookings") as Tab;
  const from = get("from");
  const to = get("to");
  const range: ReportRange = { from: from || undefined, to: to || undefined, page };
  const onPage = (p: number) => set({ page: p });

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={(v) => set({ tab: v as string, page: undefined })}>
        <TabsList className="h-9! w-full sm:w-fit">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="px-1.5 text-xs sm:px-3 sm:text-sm">
              <t.icon className="hidden sm:block" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ReportFilters from={from} to={to} onChange={(r) => set({ ...r, page: undefined })} />

      {tab === "bookings" && <BookingsReport range={range} onPage={onPage} />}
      {tab === "revenue" && <RevenueReport range={range} groupBy={get("groupBy") || "day"} onGroup={(g) => set({ groupBy: g, page: undefined })} onPage={onPage} />}
      {tab === "services" && <ServicesReport range={range} onPage={onPage} />}
      {tab === "technicians" && <TechniciansReport range={range} onPage={onPage} />}
    </div>
  );
}
