import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { ManagerDashboardView } from "@/components/dashboard/manager-dashboard";
import { buttonVariants } from "@/components/ui/button";
import { formatWeekdayDate, greeting } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Staff dashboard" };

// The layout has already checked the role; the user is only needed for the greeting. Date and greeting use IST.
export default async function StaffPage() {
  const user = await getCurrentUser();
  const firstName = user?.name.split(/\s+/)[0] ?? "there";
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{formatWeekdayDate(new Date().toISOString())}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting()}, {firstName}
          </h1>
          <p className="text-muted-foreground">Today&apos;s bookings, who is free, and what needs attention.</p>
        </div>
        <Link href="/staff/bookings/new" className={buttonVariants({ size: "lg" })}>
          <CalendarPlus /> New booking
        </Link>
      </div>
      <ManagerDashboardView />
    </>
  );
}
