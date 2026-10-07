import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PayOnlineButton } from "./pay-online-button";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function setup(routes: Record<string, unknown>) {
  const calls: { url: string; body?: unknown }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
      const key = Object.keys(routes).find((k) => url.endsWith(k));
      return json(key ? routes[key] : {});
    }),
  );
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <PayOnlineButton bookingId="b1" amountLabel="₹799" />
    </QueryClientProvider>,
  );
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete (window as unknown as { Razorpay?: unknown }).Razorpay;
});

describe("PayOnlineButton", () => {
  it("is hidden when online payment is not set up", async () => {
    const calls = setup({ "/payments/config": { online: { enabled: false, keyId: null } } });
    await waitFor(() => expect(calls.length).toBe(1));
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("opens Razorpay with the server's order, then sends Razorpay's signed answer to the server", async () => {
    let options: { order_id: string; amount: number; key: string; handler: (r: object) => void } | undefined;
    (window as unknown as { Razorpay: unknown }).Razorpay = class {
      constructor(o: typeof options) {
        options = o;
      }
      on() {}
      open() {
        options!.handler({ razorpay_order_id: "order_1", razorpay_payment_id: "pay_1", razorpay_signature: "sig" });
      }
    };
    const calls = setup({
      "/payments/config": { online: { enabled: true, keyId: "rzp_test_x" } },
      "/payment/online": { keyId: "rzp_test_x", orderId: "order_1", amountPaise: 79900, currency: "INR", description: "Repair", prefill: {} },
      "/payment/online/confirm": { receiptNumber: "RC-2026-00009", status: "PAID" },
    });

    fireEvent.click(await screen.findByRole("button", { name: "Pay ₹799 online" }));
    await waitFor(() => expect(calls.some((c) => c.url.endsWith("/payment/online/confirm"))).toBe(true));
    expect(options).toMatchObject({ key: "rzp_test_x", order_id: "order_1", amount: 79900 });
    expect(calls.find((c) => c.url.endsWith("/payment/online/confirm"))?.body).toEqual({ orderId: "order_1", paymentId: "pay_1", signature: "sig" });
  });
});
