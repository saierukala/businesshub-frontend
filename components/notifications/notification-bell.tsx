"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ErrorState, ListSkeleton } from "@/components/common/query-states";
import { useMarkAllRead, useMarkRead, useNotifications, useUnreadCount, type AppNotification } from "@/lib/queries/notifications";
import { formatDate, formatTime } from "@/lib/format";
import type { Role } from "@/lib/auth";
import { cn } from "@/lib/utils";

// Where a notification leads, for this person's area of the app.
function target(role: Role, n: AppNotification): string | null {
  if (n.type === "NEEDS_REASSIGNMENT") return "/staff/reassignments";
  if (!n.bookingId) return null;
  if (role === "CUSTOMER") return `/bookings/${n.bookingId}`;
  if (role === "TECHNICIAN") return `/tech/jobs/${n.bookingId}`;
  return `/staff/bookings/${n.bookingId}`;
}

// The bell in the top bar: how many are unread, the latest ones, and a click goes to the booking.
// Emails are sent by the background worker; this is the same message inside the app.
export function NotificationBell({ role }: { role: Role }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const unread = useUnreadCount().data ?? 0;
  const list = useNotifications(page, open);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  function openNotification(n: AppNotification) {
    if (!n.read) markRead.mutate(n.id);
    const to = target(role, n);
    if (to) {
      setOpen(false);
      router.push(to);
    }
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setPage(1); }}>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" className="relative" aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"} />}
      >
        <Bell />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-1.5rem))] gap-0 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <h2 className="text-sm font-semibold">Notifications</h2>
          <Button variant="ghost" size="sm" disabled={unread === 0 || markAll.isPending} onClick={() => markAll.mutate()}>
            <CheckCheck /> Mark all read
          </Button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {list.isPending ? (
            <div className="p-3">
              <ListSkeleton rows={3} />
            </div>
          ) : list.isError ? (
            <div className="p-3">
              <ErrorState error={list.error} onRetry={() => list.refetch()} />
            </div>
          ) : list.data.items.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Nothing yet. Updates about your bookings appear here.</p>
          ) : (
            <ul>
              {list.data.items.map((n) => (
                <li key={n.id} className="border-b last:border-b-0">
                  <button
                    type="button"
                    onClick={() => openNotification(n)}
                    className={cn("flex w-full gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none", !n.read && "bg-primary/5")}
                  >
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} aria-label={n.read ? undefined : "Unread"} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start gap-1.5">
                        {n.type === "CALL_CUSTOMER" && <Phone className="mt-0.5 size-3.5 shrink-0 text-amber-600" />}
                        <span className={cn(!n.read && "font-medium")}>{n.message}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(n.createdAt)}, {formatTime(n.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {list.data && list.data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Newer
            </Button>
            <span>
              Page {page} of {list.data.totalPages}
            </span>
            <Button variant="ghost" size="sm" disabled={page >= list.data.totalPages} onClick={() => setPage(page + 1)}>
              Older
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
