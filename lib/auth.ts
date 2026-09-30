// Shared auth types and helpers (safe for both server and client code).

export type Role = "OWNER" | "MANAGER" | "TECHNICIAN" | "CUSTOMER";

export type User = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  emailVerified: boolean;
};

// Where each role lands after login.
export function homeFor(role: Role): string {
  if (role === "OWNER" || role === "MANAGER") return "/staff";
  if (role === "TECHNICIAN") return "/tech";
  return "/account";
}

// Only allow same-site paths for ?next=, so a crafted link like
// /login?next=https://evil.example can't bounce users to another site after login.
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}
