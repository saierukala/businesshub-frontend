import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ReportsView } from "@/components/reports/reports-view";

export const metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" description="Bookings, revenue, services and technicians for any period." />
      <Suspense>
        <ReportsView />
      </Suspense>
    </>
  );
}
