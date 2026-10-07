import { afterEach, describe, expect, it, vi } from "vitest";

// The server-side login check, with the browser cookie and the backend faked.
let cookie: { value: string } | undefined = { value: "token" };
let askedPath: string | null = null; // what proxy.ts would put in x-pathname
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => cookie }),
  headers: async () => new Headers(askedPath ? { "x-pathname": askedPath } : {}),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

const { getCurrentUser, requireUser } = await import("./session");

afterEach(() => {
  vi.unstubAllGlobals();
  cookie = { value: "token" };
  askedPath = null;
});

describe("requireUser", () => {
  it("logged out: back to the exact page asked for after login", async () => {
    cookie = undefined;
    askedPath = "/bookings/abc?tab=history";
    await expect(requireUser(["CUSTOMER"], "/home")).rejects.toThrow("REDIRECT /login?next=%2Fbookings%2Fabc%3Ftab%3Dhistory");
  });

  it("without the header it falls back to the area's home", async () => {
    cookie = undefined;
    await expect(requireUser(["CUSTOMER"], "/home")).rejects.toThrow("REDIRECT /login?next=%2Fhome");
  });

  it("wrong role: to their own area", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ user: { id: "u1", role: "CUSTOMER" } }))));
    await expect(requireUser(["OWNER", "MANAGER"], "/staff")).rejects.toThrow("REDIRECT /home");
  });
});

describe("getCurrentUser", () => {
  it("no cookie: logged out, without asking the backend", async () => {
    cookie = undefined;
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(await getCurrentUser()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns the user from /auth/me", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ user: { id: "u1", role: "OWNER" } }))));
    expect(await getCurrentUser()).toMatchObject({ id: "u1" });
  });

  it("401 (expired session): logged out", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 401 })));
    expect(await getCurrentUser()).toBeNull();
  });

  it("backend not running: throws, so the error page shows instead of /login", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    await expect(getCurrentUser()).rejects.toThrow("not reachable");
  });

  it("backend error (5xx): throws too", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 503 })));
    await expect(getCurrentUser()).rejects.toThrow("not reachable");
  });
});
