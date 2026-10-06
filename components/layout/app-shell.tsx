import { cookies } from "next/headers";
import type { User } from "@/lib/auth";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { AppSidebar } from "./app-sidebar";
import { VerifyEmailBanner } from "./verify-email-banner";

// Frame for every logged-in area: sidebar on the left, a slim top bar (toggle + bell), then the page.
export async function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  // The sidebar remembers open/collapsed in a cookie; reading it here avoids a flash on reload.
  const defaultOpen = (await cookies()).get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={user} />
      <SidebarInset className="bg-(--app-content)">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-(--app-content) px-4 print:hidden">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <div className="ml-auto">
            <NotificationBell role={user.role} />
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6">
          {user.email && !user.emailVerified && <VerifyEmailBanner email={user.email} />}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
