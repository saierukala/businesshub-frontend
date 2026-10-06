"use client";

import Link from "next/link";
import { Wrench } from "lucide-react";
import type { User } from "@/lib/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { MainNav } from "./main-nav";
import { NavUser } from "./nav-user";

// Left sidebar: brand on top, the role's pages in the middle, the logged-in user at the bottom.
// Collapses to icons on desktop; becomes a slide-in drawer on phones.
export function AppSidebar({ user }: { user: User }) {
  return (
    <Sidebar collapsible="icon" className="print:hidden">
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Wrench className="size-4" />
              </span>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">HomeFix</span>
                <span className="truncate text-xs text-sidebar-foreground/65">Appliance Services</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <MainNav role={user.role} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
