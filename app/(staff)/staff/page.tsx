import { PageHeader } from "@/components/layout/page-header";
import { ManagerDashboardView } from "@/components/dashboard/manager-dashboard";

export const metadata = { title: "Staff dashboard" };

export default function StaffPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Today's bookings, who is free, and what needs attention." />
      <ManagerDashboardView />
    </>
  );
}
