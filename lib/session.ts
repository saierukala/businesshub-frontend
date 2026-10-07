// SERVER ONLY (uses next/headers). Asks the backend who is logged in, forwarding the
// browser's session cookie. Used by layouts and pages to redirect before rendering.
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { homeFor, type Role, type User } from "@/lib/auth";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

// The backend is down (or broken), so we cannot tell who is logged in. Thrown, not treated as "logged out",
// so app/error.tsx shows "Can't reach the server" instead of sending a logged-in person to /login.
const unreachable = () => new Error("The server is not reachable right now.");

export async function getCurrentUser(): Promise<User | null> {
  const session = (await cookies()).get("bh_session");
  if (!session) return null;
  let res: Response;
  try {
    res = await fetch(`${backendUrl}/auth/me`, {
      headers: { Cookie: `bh_session=${session.value}` },
      cache: "no-store", // per-user data: never cache
    });
  } catch {
    throw unreachable(); // nothing is listening
  }
  if (res.status >= 500) throw unreachable();
  if (!res.ok) return null; // 401: the session expired or is invalid, so log in again
  return ((await res.json()) as { user: User }).user;
}

// Layout guard. This is UX only: the backend checks role and ownership on every request.
// After login you return to the page you asked for (set by proxy.ts); `loginNext` is the fallback.
export async function requireUser(roles: Role[], loginNext: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    const asked = (await headers()).get("x-pathname");
    redirect(`/login?next=${encodeURIComponent(asked || loginNext)}`);
  }
  if (!roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}
