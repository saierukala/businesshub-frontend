import { afterEach, describe, expect, it, vi } from "vitest";

// The server-side login check, with the browser cookie and the backend faked.
let cookie: { value: string } | undefined = { value: "token" };
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => cookie }) }));

const { getCurrentUser } = await import("./session");

afterEach(() => {
  vi.unstubAllGlobals();
  cookie = { value: "token" };
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
