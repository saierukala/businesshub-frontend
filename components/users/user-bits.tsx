import { Crown, Phone, ShieldCheck, User, Wrench, type LucideIcon } from "lucide-react";
import { formatPhone, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/auth";
import type { StaffUser } from "@/lib/types";

// Small display pieces for the Users list: one look per role, one per account state.

const ROLES: Record<Role, { label: string; icon: LucideIcon; className: string }> = {
  OWNER: { label: "Owner", icon: Crown, className: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200" },
  MANAGER: { label: "Manager", icon: ShieldCheck, className: "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200" },
  TECHNICIAN: { label: "Technician", icon: Wrench, className: "bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-200" },
  CUSTOMER: { label: "Customer", icon: User, className: "bg-muted text-muted-foreground" },
};

export function UserAvatar({ name, role }: { name: string; role: Role }) {
  return (
    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold", ROLES[role].className)} aria-hidden>
      {initials(name)}
    </span>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  const { label, icon: Icon, className } = ROLES[role];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", className)}>
      <Icon className="size-3" /> {label}
    </span>
  );
}

// Staff (not customers) get an invite email; until they set a password the invite is "pending".
export const invitePending = (u: StaffUser) => !u.hasAccount && u.active && u.role !== "CUSTOMER";

export function UserStatus({ user }: { user: StaffUser }) {
  const [label, dot] = !user.active
    ? ["Deactivated", "bg-destructive"]
    : invitePending(user)
      ? ["Invite sent", "bg-amber-500"]
      : ["Active", "bg-green-500"];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap">
      <span className={cn("size-2 rounded-full", dot)} aria-hidden />
      {label}
    </span>
  );
}

export function PhoneLink({ phone }: { phone: string | null }) {
  if (!phone) return <span className="text-muted-foreground">—</span>;
  return (
    <a href={`tel:+91${phone}`} className="inline-flex items-center gap-1.5 tabular-nums hover:underline">
      <Phone className="size-3.5 text-muted-foreground" />
      {formatPhone(phone)}
    </a>
  );
}
