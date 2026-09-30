// SERVER ONLY (uses next/headers). Asks the backend who is logged in, forwarding the
// browser's session cookie. Used by layouts and pages to redirect before rendering.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { homeFor, type Role, type User } from "@/lib/auth";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function getCurrentUser(): Promise<User | null> {
  const session = (await cookies()).get("bh_session");
  if (!session) return null;
  try {
    const res = await fetch(`${backendUrl}/auth/me`, {
      headers: { Cookie: `bh_session=${session.value}` },
      cache: "no-store", // per-user data: never cache
    });
    if (!res.ok) return null;
    return ((await res.json()) as { user: User }).user;
  } catch {
    return null; // backend down: treat as logged out
  }
}

// Layout guard. This is UX only: the backend checks role and ownership on every request.
export async function requireUser(roles: Role[], loginNext: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(loginNext)}`);
  if (!roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}
