import { PageHeader } from "@/components/layout/page-header";
import { UsersList } from "@/components/users/users-list";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const owner = await requireUser(["OWNER"], "/staff/users"); // managers are sent back to /staff
  return (
    <>
      <PageHeader title="Users" description="Add managers and technicians, and deactivate accounts." />
      <UsersList currentUserId={owner.id} />
    </>
  );
}
