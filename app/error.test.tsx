import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GlobalError from "./error";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function setup(health: () => Promise<Response>) {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn(health));
  const retry = vi.fn();
  render(<GlobalError error={new Error("boom")} retry={retry} />);
  return retry;
}

describe("error page", () => {
  it("API down: says the server can't be reached, and Try again retries", async () => {
    const retry = setup(() => Promise.reject(new TypeError("fetch failed")));
    expect(await screen.findByText("Can't reach the server")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("API answering but unhealthy (5xx): also server down", async () => {
    setup(() => Promise.resolve(new Response("{}", { status: 500 })));
    expect(await screen.findByText("Can't reach the server")).toBeTruthy();
  });

  it("API fine: a page bug, the general message", async () => {
    setup(() => Promise.resolve(new Response("{}", { status: 200 })));
    expect(await screen.findByText("Something went wrong")).toBeTruthy();
    expect(screen.queryByText("Can't reach the server")).toBeNull();
  });
});
