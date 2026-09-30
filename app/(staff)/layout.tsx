import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/session";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["OWNER", "MANAGER"], "/staff");
  return <AppShell user={user}>{children}</AppShell>;
}
