import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PayOnlineButton } from "./pay-online-button";

function setup(enabled: boolean) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({ online: { enabled, keyId: enabled ? "rzp_test_x" : null } }), { headers: { "Content-Type": "application/json" } }));
  vi.stubGlobal("fetch", fetchMock);
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <PayOnlineButton bookingId="b1" amountLabel="₹799" />
    </QueryClientProvider>,
  );
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("PayOnlineButton", () => {
  it("is hidden when online payment is not set up", async () => {
    const fetchMock = setup(false);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("links to the checkout page when it is on", async () => {
    setup(true);
    const link = await screen.findByRole("link", { name: /Pay ₹799 online/ });
    expect(link.getAttribute("href")).toBe("/bookings/b1/pay");
  });
});
