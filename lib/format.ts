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
