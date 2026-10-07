import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CheckoutView } from "./checkout-view";

const booking = {
  id: "b1",
  bookingNumber: "BH-2026-00035",
  status: "COMPLETED",
  startAt: "2026-10-09T03:30:00.000Z",
  endAt: "2026-10-09T04:30:00.000Z",
  customer: { id: "c1", name: "Ravi Kumar", phone: "9000000010", email: "ravi@example.test" },
  service: { id: "s1", name: "Washing Machine Repair", durationMinutes: 60, basePrice: "499.00" },
  appliance: { id: "a1", brand: "LG", model: "FHM1207", category: { id: "k1", name: "Washing Machine" } },
  address: { id: "ad1", label: "Home", line1: "Flat 302", area: "Kondapur", city: "Hyderabad", pincode: "500084" },
  technician: { id: "t1", name: "Rahul Sharma" },
  visit: { workPerformed: "Replaced the belt", finalAmount: "799.00", extraCharge: { status: "APPROVED", amount: "300.00", reason: "New belt" } },
  payment: null as null | object,
};

function setup() {
  let paid = false;
  const calls: { url: string; body?: unknown }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
      const reply = (body: unknown) => new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });
      if (url.endsWith("/payments/config")) return reply({ online: { enabled: true, keyId: "rzp_test_x" } });
      if (url.endsWith("/payment/online/confirm")) {
        paid = true;
        return reply({ receiptNumber: "RC-2026-00010", status: "PAID" });
      }
      if (url.endsWith("/payment/online")) return reply({ keyId: "rzp_test_x", orderId: "order_1", amountPaise: 79900, currency: "INR", description: "Repair", prefill: {} });
      return reply({ ...booking, payment: paid ? { id: "p1", amount: "799.00", method: "ONLINE", status: "PAID", reference: "pay_1", receiptNumber: "RC-2026-00010", paidAt: "2026-10-07T13:00:00.000Z", recordedBy: null } : null });
    }),
  );
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <CheckoutView bookingId="b1" />
    </QueryClientProvider>,
  );
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete (window as unknown as { Razorpay?: unknown }).Razorpay;
});

describe("CheckoutView", () => {
  it("shows the order from the API, pays through Razorpay with the server's order, then shows the success page", async () => {
    let options: { order_id: string; amount: number; handler: (r: object) => void } | undefined;
    (window as unknown as { Razorpay: unknown }).Razorpay = class {
      constructor(o: typeof options) {
        options = o;
      }
      on() {}
      open() {
        options!.handler({ razorpay_order_id: "order_1", razorpay_payment_id: "pay_1", razorpay_signature: "sig" });
      }
    };
    const calls = setup();

    expect(await screen.findByText("Pay for your repair")).toBeTruthy();
    expect(screen.getByText(/Test mode: no real money moves/)).toBeTruthy();
    expect(screen.getByText("Extra: New belt")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Pay ₹799 securely" }));
    expect(await screen.findByText("Payment successful")).toBeTruthy();
    expect(options).toMatchObject({ order_id: "order_1", amount: 79900 });
    expect(calls.find((c) => c.url.endsWith("/confirm"))?.body).toEqual({ orderId: "order_1", paymentId: "pay_1", signature: "sig" });
    await waitFor(() => expect(screen.getByText("RC-2026-00010")).toBeTruthy());
    expect(screen.getByRole("link", { name: /View receipt/ }).getAttribute("href")).toBe("/bookings/b1/receipt");
  });
});
