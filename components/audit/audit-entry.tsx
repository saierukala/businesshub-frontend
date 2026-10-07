import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CalendarX,
  CircleCheck,
  ClipboardList,
  IndianRupee,
  KeyRound,
  ShieldAlert,
  Star,
  UserCog,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { isBookingStatus, statusLabel } from "@/components/status-badge";
import { formatDayRange, formatINR, formatSlot, formatTime, formatWeekdayDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AuditEntry as Entry } from "@/lib/queries/audit";

// "PAYMENT_RECORDED" -> "Payment recorded"
export const pretty = (action: string) => {
  const s = action.toLowerCase().replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// One icon and colour per kind of action, so the eye can find payments or cancellations quickly.
function look(action: string): { icon: LucideIcon; className: string } {
  if (action.startsWith("PAYMENT") || action.startsWith("EXTRA_CHARGE"))
    return { icon: IndianRupee, className: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300" };
  if (action === "BOOKING_CANCELLED" || action === "BOOKING_NO_SHOW" || action === "USER_DEACTIVATED")
    return { icon: CalendarX, className: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300" };
  if (action === "BOOKING_FLAGGED_REASSIGNMENT" || action === "BOOKING_STATUS_CORRECTED")
    return { icon: ShieldAlert, className: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200" };
  if (action === "VISIT_COMPLETED") return { icon: CircleCheck, className: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300" };
  if (action.startsWith("REVIEW")) return { icon: Star, className: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200" };
  if (action.startsWith("BOOKING")) return { icon: CalendarClock, className: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300" };
  if (action.startsWith("TECHNICIAN") || action.startsWith("TIME_OFF"))
    return { icon: Wrench, className: "bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300" };
  if (action.startsWith("USER")) return { icon: UserCog, className: "bg-muted text-foreground/70" };
  if (action.startsWith("CUSTOMER")) return { icon: UserRound, className: "bg-muted text-foreground/70" };
  if (action.startsWith("APP_CODE")) return { icon: KeyRound, className: "bg-muted text-foreground/70" };
  return { icon: ClipboardList, className: "bg-muted text-foreground/70" };
}

// Where the thing it happened to lives, when there is a page for it.
const ENTITY_HREF: Record<string, (id: string) => string> = {
  Booking: (id) => `/staff/bookings/${id}`,
  Technician: (id) => `/staff/technicians/${id}`,
};

const ISO = /^\d{4}-\d{2}-\d{2}T/;

// A metadata value in words: statuses by their label, instants in IST, the rest as text.
function show(v: unknown): string {
  if (isBookingStatus(v)) return statusLabel(v);
  if (typeof v === "string" && ISO.test(v)) return `${formatWeekdayDate(v)}, ${formatTime(v)}`;
  if (typeof v === "string" && /^[A-Z][A-Z_]+$/.test(v)) return pretty(v); // ONLINE -> Online, WALK_IN -> Walk in
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.every((x) => typeof x === "string" && x.length < 30) ? v.join(", ") : `${v.length} items`;
  if (isChange(v)) return `${v.from == null || v.from === "" ? "none" : show(v.from)} → ${v.to == null || v.to === "" ? "none" : show(v.to)}`;
  return String(v);
}

// An edit is saved as { field: { from, to } } (e.g. Customer updated).
const isChange = (v: unknown): v is { from: unknown; to: unknown } => typeof v === "object" && v !== null && "from" in v && "to" in v;
// Reasons picked from a list (time off: SICK, LEAVE) are a word, not something someone wrote.
const isCode = (v: unknown) => typeof v === "string" && /^[A-Z][A-Z_]+$/.test(v);

// The few details worth reading at a glance. IDs and the like stay in the API.
const LABELS: Record<string, string> = { method: "Method", source: "Source", rating: "Rating", areas: "Areas", receiptNumber: "Receipt", reference: "Ref", rescheduleCount: "Reschedule #", bookingsFlagged: "Bookings flagged", reason: "Reason", role: "Role", name: "Name", phone: "Phone", email: "Email", type: "Type" };

function Details({ m, action }: { m: Record<string, unknown>; action: string }) {
  const has = (k: string) => m[k] !== undefined && m[k] !== null && m[k] !== "";
  const coded = isCode(m.reason); // a chip "Reason: Sick"; a written reason gets the quote box below
  const reason = has("overrideReason") ? m.overrideReason : has("reason") && !coded ? m.reason : has("note") ? m.note : null;
  const chips = Object.keys(LABELS).filter((k) => has(k) && (k !== "reason" || coded));
  const fromTo = has("from") && has("to");
  const slot = !fromTo && has("startAt") && has("endAt") && typeof m.startAt === "string" && typeof m.endAt === "string";
  // Time off is whole days (midnight to midnight IST), so show the days, not "12:00 am – 12:00 am".
  const days = action.startsWith("TIME_OFF");

  if (!reason && !chips.length && !fromTo && !has("amount") && !slot) return null;
  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {fromTo && (
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
            {show(m.from)} <ArrowRight className="size-3 text-muted-foreground" /> <span className="font-medium">{show(m.to)}</span>
          </span>
        )}
        {slot && (
          <span className="rounded-md bg-muted px-2 py-0.5">
            {days ? formatDayRange(m.startAt as string, m.endAt as string) : formatSlot(m.startAt as string, m.endAt as string)}
          </span>
        )}
        {has("amount") && <span className="rounded-md bg-green-100 px-2 py-0.5 font-semibold text-green-900 dark:bg-green-500/20 dark:text-green-200">{formatINR(String(m.amount))}</span>}
        {chips.map((k) => (
          <span key={k} className="rounded-md bg-muted px-2 py-0.5">
            <span className="text-muted-foreground">{LABELS[k]}:</span> {k === "rating" ? `${"★".repeat(Number(m[k]))}` : show(m[k])}
          </span>
        ))}
      </div>
      {reason != null && (
        <p className={cn("rounded-md border-l-2 px-3 py-1.5 text-sm", has("overrideReason") ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10" : "border-border bg-muted/40")}>
          {has("overrideReason") && <span className="mr-1 font-medium text-amber-800 dark:text-amber-300">Override:</span>}
          <span className="text-muted-foreground">“{String(reason)}”</span>
        </p>
      )}
    </div>
  );
}

// One line of the timeline: icon, what happened, who did it, when, and the details that matter.
export function AuditEntry({ a }: { a: Entry }) {
  const { icon: Icon, className } = look(a.action);
  const href = ENTITY_HREF[a.entityType]?.(a.entityId);
  const entity = `${a.entityType} ${a.entityId.slice(0, 8)}`;
  return (
    <li className="relative flex gap-3 px-4 py-3">
      <span className={cn("relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-card", className)} aria-hidden>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="font-medium">{pretty(a.action)}</p>
          <time dateTime={a.createdAt} className="text-xs text-muted-foreground tabular-nums">
            {formatTime(a.createdAt)}
          </time>
        </div>
        <p className="text-sm text-muted-foreground">
          {a.user ? (
            <>
              by <span className="text-foreground">{a.user.name}</span> <span className="text-xs">({a.user.role.toLowerCase()})</span>
            </>
          ) : (
            "by the system"
          )}
          {" · "}
          {href ? (
            <Link href={href} className="font-mono text-xs underline-offset-2 hover:text-foreground hover:underline">
              {entity}
            </Link>
          ) : (
            <span className="font-mono text-xs">{entity}</span>
          )}
        </p>
        <Details m={a.metadata ?? {}} action={a.action} />
      </div>
    </li>
  );
}
