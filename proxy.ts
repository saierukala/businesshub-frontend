import { NextResponse, type NextRequest } from "next/server";

// Runs before every page. Its only job: pass the requested path (with ?query) on to the server code in a header,
// because layouts cannot read the URL. requireUser (lib/session.ts) uses it for "/login?next=...", so after
// logging in you come back to the page you asked for, not just the area's home page.
// It is always overwritten here, so a browser cannot send its own value.
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Pages only: not the /api rewrite, Next's own files, or files with an extension (icons, images).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
