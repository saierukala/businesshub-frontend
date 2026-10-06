"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarCheck,
  CalendarPlus,
  ClipboardList,
  HardHat,
  House,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Star,
  UserCog,
  UserRound,
  Users,
  UserRoundX,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/auth";
import { useReassignmentCount } from "@/lib/queries/bookings";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = { href: string; label: string; icon: LucideIcon; roles: Role[]; countBadge?: boolean };

// Number of bookings waiting for a new technician. Only rendered for staff (their nav item asks for it).
function ReassignmentCount() {
  const count = useReassignmentCount();
  if (count === 0) return null;
  return (
    <SidebarMenuBadge className="bg-destructive text-white" aria-label={`${count} waiting`}>
      {count}
    </SidebarMenuBadge>
  );
}

// One list; each role sees only its items. (Hiding links is UX only: the pages and API check roles.)
const NAV: NavItem[] = [
  { href: "/staff", label: "Dashboard", icon: LayoutDashboard, roles: ["OWNER", "MANAGER"] },
  { href: "/staff/bookings", label: "Bookings", icon: CalendarCheck, roles: ["OWNER", "MANAGER"] },
  { href: "/staff/reassignments", label: "Needs reassignment", icon: UserRoundX, roles: ["OWNER", "MANAGER"], countBadge: true },
  { href: "/staff/customers", label: "Customers", icon: Users, roles: ["OWNER", "MANAGER"] },
  { href: "/staff/technicians", label: "Technicians", icon: HardHat, roles: ["OWNER", "MANAGER"] },
  { href: "/staff/reports", label: "Reports", icon: BarChart3, roles: ["OWNER", "MANAGER"] },
  { href: "/staff/reviews", label: "Reviews", icon: Star, roles: ["OWNER", "MANAGER"] },
  { href: "/staff/services", label: "Services", icon: Wrench, roles: ["OWNER"] },
  { href: "/staff/users", label: "Users", icon: UserCog, roles: ["OWNER"] },
  { href: "/staff/roles", label: "Roles & permissions", icon: ShieldCheck, roles: ["OWNER"] },
  { href: "/staff/audit", label: "Audit log", icon: ScrollText, roles: ["OWNER"] },
  { href: "/home", label: "Home", icon: House, roles: ["CUSTOMER"] },
  { href: "/book", label: "Book a repair", icon: CalendarPlus, roles: ["CUSTOMER"] },
  { href: "/bookings", label: "My bookings", icon: CalendarCheck, roles: ["CUSTOMER"] },
  { href: "/account", label: "My account", icon: UserRound, roles: ["CUSTOMER"] },
  { href: "/tech", label: "My jobs", icon: ClipboardList, roles: ["TECHNICIAN"] },
];

// The links in the left sidebar.
export function MainNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const items = NAV.filter((i) => i.roles.includes(role));

  // Most specific match wins, so /staff/customers/123 highlights "Customers", not "Dashboard".
  const active = items
    .filter((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <SidebarGroup className="px-3 py-2">
      <SidebarGroupLabel className="mb-1">Menu</SidebarGroupLabel>
      <nav aria-label="Main">
        <SidebarMenu className="gap-1.5">
          {items.map((i) => (
            <SidebarMenuItem key={i.href}>
              <SidebarMenuButton
                isActive={active === i.href}
                className="h-10 gap-3 px-3 text-[15px] data-active:font-semibold"
                tooltip={i.label}
                aria-current={active === i.href ? "page" : undefined}
                // On a phone the sidebar is a drawer: close it once a page is picked.
                render={<Link href={i.href} onClick={() => isMobile && setOpenMobile(false)} />}
              >
                <i.icon />
                <span>{i.label}</span>
              </SidebarMenuButton>
              {i.countBadge && <ReassignmentCount />}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </nav>
    </SidebarGroup>
  );
}
