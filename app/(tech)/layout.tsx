import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/session";

export default async function TechLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["TECHNICIAN"], "/tech");
  return <AppShell user={user}>{children}</AppShell>;
}
