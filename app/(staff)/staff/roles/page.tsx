import { PageHeader } from "@/components/layout/page-header";
import { PermissionsMatrix } from "@/components/roles/permissions-matrix";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Roles & permissions" };

export default async function RolesPage() {
  await requireUser(["OWNER"], "/staff/roles"); // managers are sent back to /staff
  return (
    <>
      <PageHeader
        title="Roles & permissions"
        description="What each role can do. These rules are built in and checked by the server on every request; they are not editable."
      />
      <PermissionsMatrix />
    </>
  );
}
