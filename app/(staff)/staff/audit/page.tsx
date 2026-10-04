import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AuditList } from "@/components/audit/audit-list";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Audit log" };

export default async function AuditPage() {
  await requireUser(["OWNER"], "/staff/audit"); // managers are sent back to /staff
  return (
    <>
      <PageHeader title="Audit log" description="Who did what, and when. Overrides show the reason that was given." />
      <Suspense>
        <AuditList />
      </Suspense>
    </>
  );
}
