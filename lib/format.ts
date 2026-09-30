// Display helpers. Money is INR; dates always in Asia/Kolkata (never the browser's timezone).

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

// "599.00" -> "₹599", "649.50" -> "₹649.50"
export function formatINR(amount: string | number): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return inr.format(n).replace(/\.00$/, "");
}

// 90 -> "1 h 30 min"
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h && `${h} h`, m && `${m} min`].filter(Boolean).join(" ");
}

// "9876543210" -> "+91 98765 43210"
export function formatPhone(phone: string | null): string {
  if (!phone) return "—";
  return /^\d{10}$/.test(phone) ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : phone;
}

const dateFmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });

// ISO string from the API -> "30 Sept 2026" in IST
export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

// Time off is whole days, stored as [start of first day, start of the day after the last).
// "5 Oct 2026" for one day, "5 Oct 2026 – 7 Oct 2026" for several (IST).
export function formatDayRange(startIso: string, endIso: string): string {
  const first = formatDate(startIso);
  const last = formatDate(new Date(new Date(endIso).getTime() - 60_000).toISOString());
  return first === last ? first : `${first} – ${last}`;
}

const timeFmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });
const weekdayDateFmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", year: "numeric" });
const isoDayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }); // en-CA prints YYYY-MM-DD

// "10:30 am" in IST
export function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso)).toLowerCase();
}

// "Mon, 5 Oct 2026" in IST
export function formatWeekdayDate(iso: string): string {
  return weekdayDateFmt.format(new Date(iso));
}

// "Mon, 5 Oct 2026, 10:30 am – 11:30 am"
export function formatSlot(startIso: string, endIso: string): string {
  return `${formatWeekdayDate(startIso)}, ${formatTime(startIso)} – ${formatTime(endIso)}`;
}

// The IST calendar day of an instant, as YYYY-MM-DD. Used for the date picker (never the browser's day).
export function istDay(date: Date = new Date()): string {
  return isoDayFmt.format(date);
}

// "2026-10-05" + 30 -> "2026-11-04"
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
