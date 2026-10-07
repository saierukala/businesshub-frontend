import Link from "next/link";
import { BadgeCheck, CircleAlert, ClipboardList, Mail, Phone, Settings } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatPhone, initials } from "@/lib/format";
import type { User } from "@/lib/auth";

// Who is logged in, at the top of My account. Read-only (changing name or email is not in v1);
// password and appearance live in Settings.
export function ProfileCard({ user }: { user: User }) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="h-20 bg-gradient-to-br from-sidebar-primary/25 via-sidebar-primary/10 to-transparent sm:h-24" aria-hidden />
      <div className="flex flex-col gap-4 px-4 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="-mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-sidebar-primary text-2xl font-semibold text-sidebar-primary-foreground ring-4 ring-card">
            {initials(user.name)}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5 sm:pb-1">
            <h2 className="text-xl font-semibold tracking-tight">{user.name}</h2>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {user.email && (
                <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1">
                  <Mail className="size-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                  {user.emailVerified ? (
                    <BadgeCheck className="size-4 shrink-0 text-green-600 dark:text-green-400" aria-label="Verified" />
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                      <CircleAlert className="size-3.5" /> Not verified
                    </span>
                  )}
                </span>
              )}
              {user.phone && (
                <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1">
                  <Phone className="size-3.5" />
                  {formatPhone(user.phone)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/bookings" className={buttonVariants({ variant: "outline", className: "flex-1 sm:flex-none" })}>
            <ClipboardList /> My bookings
          </Link>
          <Link href="/settings" className={buttonVariants({ variant: "outline", className: "flex-1 sm:flex-none" })}>
            <Settings /> Settings
          </Link>
        </div>
      </div>
    </section>
  );
}
