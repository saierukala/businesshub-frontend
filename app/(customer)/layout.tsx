import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/session";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["CUSTOMER"], "/account");
  return <AppShell user={user}>{children}</AppShell>;
}
