"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, Settings, UserRound } from "lucide-react";
import { toast } from "sonner";
import type { Role, User } from "@/lib/auth";
import { useLogout } from "@/lib/queries/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

// Each role has its own Settings page (same screen), inside its own area of the app.
const SETTINGS_HREF: Record<Role, string> = {
  OWNER: "/staff/settings",
  MANAGER: "/staff/settings",
  TECHNICIAN: "/tech/settings",
  CUSTOMER: "/settings",
};

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Owner",
  MANAGER: "Service Manager",
  TECHNICIAN: "Technician",
  CUSTOMER: "Customer",
};

// "Ravi Kumar" -> "RK"
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function UserLine({ user }: { user: User }) {
  return (
    <>
      <Avatar className="size-8 rounded-lg">
        <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">{initials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span className="truncate text-xs opacity-70">{user.email ?? user.phone ?? ROLE_LABEL[user.role]}</span>
      </div>
    </>
  );
}

// Bottom of the sidebar: who is logged in, with a menu for My account, Settings and log out.
export function NavUser({ user }: { user: User }) {
  const router = useRouter();
  const logout = useLogout();
  const { isMobile, setOpenMobile } = useSidebar();
  // On a phone the sidebar is a drawer: close it once a page is picked.
  const closeDrawer = () => isMobile && setOpenMobile(false);

  const logOut = () =>
    logout.mutate(undefined, {
      onSuccess: () => {
        router.replace("/login");
        router.refresh();
      },
      onError: (err) => toast.error(err.message),
    });

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground" />}
          >
            <UserLine user={user} />
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal text-foreground">
                <div className="flex items-center gap-2 px-1 py-1.5">
                  <UserLine user={user} />
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</div>
            {user.role === "CUSTOMER" && (
              <DropdownMenuItem render={<Link href="/account" onClick={closeDrawer} />}>
                <UserRound />
                My account
              </DropdownMenuItem>
            )}
            <DropdownMenuItem render={<Link href={SETTINGS_HREF[user.role]} onClick={closeDrawer} />}>
              <Settings />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={logout.isPending} onClick={logOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
