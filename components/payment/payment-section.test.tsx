import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PaymentSection } from "./payment-section";
import type { BookingDetail } from "@/lib/types";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const base = {
  id: "b1",
  status: "COMPLETED",
  service: { basePrice: "499.00" },
  visit: { finalAmount: "749.00", extraCharge: { status: "APPROVED" } },
  payment: null,
} as unknown as BookingDetail;

function setup(booking: BookingDetail, canRecord: boolean, response?: { status: number; body: unknown }) {
  const fetchMock = vi.fn();
  if (response) fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(response.body), { status: response.status }));
  vi.stubGlobal("fetch", fetchMock);
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <PaymentSection booking={booking} canRecord={canRecord} receiptHref="/tech/jobs/b1/receipt" />
    </QueryClientProvider>,
  );
  return { fetchMock, user: userEvent.setup() };
}

afterEach(() => vi.unstubAllGlobals());

describe("PaymentSection", () => {
  it("shows the amount from the API and sends only the method (never an amount)", async () => {
    const paid = { id: "p1", amount: "749.00", method: "UPI", status: "PAID", reference: "TXN1", receiptNumber: "RC-2026-00001", paidAt: null, recordedBy: "Rahul" };
    const { fetchMock, user } = setup(base, true, { status: 201, body: paid });

    expect(screen.getByText("₹749")).toBeInTheDocument(); // base 499 + approved 250, worked out by the server
    await user.click(screen.getByRole("radio", { name: /UPI/ }));
    await user.type(screen.getByLabelText(/UPI transaction ID/), "TXN1");
    await user.click(screen.getByRole("button", { name: "Payment received" }));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/bookings/b1/payment");
    expect(JSON.parse(init.body)).toEqual({ method: "UPI", reference: "TXN1" });
  });

  it("does not offer to record a payment to a customer, only says what is due", () => {
    setup(base, false);
    expect(screen.queryByRole("button", { name: "Payment received" })).not.toBeInTheDocument();
    expect(screen.getByText("Amount due")).toBeInTheDocument();
    expect(screen.getByText("₹749")).toBeInTheDocument();
    expect(screen.getByText(/Pay the technician in cash or by UPI/)).toBeInTheDocument();
  });

  it("once paid, shows the payment and a receipt link instead of the form", () => {
    const paid = { amount: "749.00", method: "CASH", status: "PAID", reference: null, receiptNumber: "RC-2026-00001", paidAt: null, recordedBy: "Rahul" };
    setup({ ...base, payment: paid } as unknown as BookingDetail, true);
    expect(screen.getByText(/Paid ₹749 in cash/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View receipt/ })).toHaveAttribute("href", "/tech/jobs/b1/receipt");
    expect(screen.queryByRole("button", { name: "Payment received" })).not.toBeInTheDocument();
  });

  it("shows nothing until the visit is completed", () => {
    setup({ ...base, status: "IN_PROGRESS" } as BookingDetail, true);
    expect(screen.queryByText("Collect payment")).not.toBeInTheDocument();
  });
});
