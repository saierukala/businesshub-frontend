import { cookies } from "next/headers";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { getCurrentUser } from "@/lib/session";
import { SIDEBAR_THEME_COOKIE, toSidebarTheme } from "@/lib/sidebar-themes";
import { SettingsView } from "./settings-view";

// The same Settings page for every role (/settings, /staff/settings, /tech/settings).
// Staff and technicians edit their profile here; customers do it on My account.
export async function SettingsPage() {
  const sidebarTheme = toSidebarTheme((await cookies()).get(SIDEBAR_THEME_COOKIE)?.value);
  const user = await getCurrentUser();
  const showProfile = user && user.role !== "CUSTOMER";
  return (
    <>
      <PageHeader title="Settings" description={showProfile ? "Your profile, and how the app looks in this browser." : "How the app looks in this browser."} />
      {showProfile && <ProfileForm user={user} />}
      <SettingsView sidebarTheme={sidebarTheme} />
    </>
  );
}
