import { cookies } from "next/headers";
import { PageHeader } from "@/components/layout/page-header";
import { SIDEBAR_THEME_COOKIE, toSidebarTheme } from "@/lib/sidebar-themes";
import { SettingsView } from "./settings-view";

// The same Settings page for every role (/settings, /staff/settings, /tech/settings).
export async function SettingsPage() {
  const sidebarTheme = toSidebarTheme((await cookies()).get(SIDEBAR_THEME_COOKIE)?.value);
  return (
    <>
      <PageHeader title="Settings" description="How the app looks in this browser." />
      <SettingsView sidebarTheme={sidebarTheme} />
    </>
  );
}
