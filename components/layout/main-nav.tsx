"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useReassignmentCount } from "@/lib/queries/bookings";

type NavItem = { href: string; label: string; roles: Role[]; countBadge?: boolean };

// Number of bookings waiting for a new technician. Only rendered for staff (their nav item asks for it).
function ReassignmentCount() {
  const count = useReassignmentCount();
  if (count === 0) return null;
  return (
    <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-xs font-medium text-white" aria-label={`${count} waiting`}>
      {count}
    </span>
  );
}

// One list; each role sees only its items. (Hiding links is UX only: the pages and API check roles.)
const NAV: NavItem[] = [
  { href: "/staff", label: "Dashboard", roles: ["OWNER", "MANAGER"] },
  { href: "/staff/bookings", label: "Bookings", roles: ["OWNER", "MANAGER"] },
  { href: "/staff/reassignments", label: "Needs reassignment", roles: ["OWNER", "MANAGER"], countBadge: true },
  { href: "/staff/customers", label: "Customers", roles: ["OWNER", "MANAGER"] },
  { href: "/staff/technicians", label: "Technicians", roles: ["OWNER", "MANAGER"] },
  { href: "/staff/reports", label: "Reports", roles: ["OWNER", "MANAGER"] },
  { href: "/staff/reviews", label: "Reviews", roles: ["OWNER", "MANAGER"] },
  { href: "/staff/services", label: "Services", roles: ["OWNER"] },
  { href: "/staff/users", label: "Users", roles: ["OWNER"] },
  { href: "/staff/audit", label: "Audit log", roles: ["OWNER"] },
  { href: "/home", label: "Home", roles: ["CUSTOMER"] },
  { href: "/book", label: "Book a repair", roles: ["CUSTOMER"] },
  { href: "/bookings", label: "My bookings", roles: ["CUSTOMER"] },
  { href: "/account", label: "My account", roles: ["CUSTOMER"] },
  { href: "/tech", label: "My jobs", roles: ["TECHNICIAN"] },
];

export function MainNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV.filter((i) => i.roles.includes(role));
  if (items.length < 2) return null;

  // Most specific match wins, so /staff/customers/123 highlights "Customers", not "Dashboard".
  const active = items
    .filter((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label="Main" className="-mb-px flex gap-1 overflow-x-auto">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={active === i.href ? "page" : undefined}
          className={cn(
            "border-b-2 px-3 py-2.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
            active === i.href ? "border-primary font-medium text-foreground" : "border-transparent",
          )}
        >
          {i.label}
          {i.countBadge && <ReassignmentCount />}
        </Link>
      ))}
    </nav>
  );
}
