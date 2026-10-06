import { BadgeCheck, CircleAlert, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPhone } from "@/lib/format";
import type { User } from "@/lib/auth";

// "Ravi Kumar" -> "RK"
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

// Who is logged in, at the top of My account. Read-only (changing name or email is not in v1).
export function ProfileCard({ user }: { user: User }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sidebar-primary text-lg font-semibold text-sidebar-primary-foreground">
          {initials(user.name)}
        </span>
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
            {user.email && (
              <span className="flex min-w-0 items-center gap-1.5">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{user.email}</span>
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-500/20 dark:text-green-300">
                    <BadgeCheck className="size-3.5" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">
                    <CircleAlert className="size-3.5" /> Not verified
                  </span>
                )}
              </span>
            )}
            {user.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="size-4" />
                {formatPhone(user.phone)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
