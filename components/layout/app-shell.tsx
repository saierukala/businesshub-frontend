import Link from "next/link";
import { Wrench } from "lucide-react";
import type { Role, User } from "@/lib/auth";
import { LogoutButton } from "./logout-button";
import { MainNav } from "./main-nav";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { VerifyEmailBanner } from "./verify-email-banner";

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Owner",
  MANAGER: "Service Manager",
  TECHNICIAN: "Technician",
  CUSTOMER: "Customer",
};

// Frame for every logged-in area: top bar with the user and logout, then the page.
export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b bg-background print:hidden">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Wrench className="size-4" />
            </span>
            HomeFix
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-sm leading-tight sm:block">
              <div className="font-medium">{user.name}</div>
              <div className="text-muted-foreground">{ROLE_LABEL[user.role]}</div>
            </div>
            <NotificationBell role={user.role} />
            <LogoutButton />
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4">
          <MainNav role={user.role} />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6">
        {user.email && !user.emailVerified && <VerifyEmailBanner email={user.email} />}
        {children}
      </main>
    </div>
  );
}
