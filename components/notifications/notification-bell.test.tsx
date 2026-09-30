import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationBell } from "./notification-bell";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const items = [
  { id: "n1", type: "BOOKING_CONFIRMED", message: "Your Fridge Repair is booked for Wed 14 Oct, 10:00 am.", bookingId: "b1", read: false, createdAt: "2026-10-01T05:00:00Z" },
  { id: "n2", type: "NEEDS_REASSIGNMENT", message: "1 booking needs a new technician.", bookingId: null, read: true, createdAt: "2026-10-01T04:00:00Z" },
];

function setup(role: "CUSTOMER" | "MANAGER", unread = 1) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const body = url.includes("unread-count")
      ? { unread }
      : url.endsWith("/read")
        ? { unread: 0 }
        : { items, page: 1, pageSize: 8, total: 2, totalPages: 1, unread };
    void init;
    return new Response(JSON.stringify(body), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <NotificationBell role={role} />
    </QueryClientProvider>,
  );
  return { fetchMock, user: userEvent.setup() };
}

afterEach(() => {
  vi.unstubAllGlobals();
  push.mockClear();
});

describe("NotificationBell", () => {
  it("shows the unread count on the bell", async () => {
    setup("CUSTOMER", 3);
    expect(await screen.findByRole("button", { name: "Notifications, 3 unread" })).toBeInTheDocument();
  });

  it("lists the messages; clicking one marks it read and opens the booking in the customer's area", async () => {
    const { fetchMock, user } = setup("CUSTOMER");
    await user.click(await screen.findByRole("button", { name: /Notifications, 1 unread/ }));
    await user.click(await screen.findByRole("button", { name: /Your Fridge Repair is booked/ }));

    expect(fetchMock.mock.calls.some(([u, init]) => u === "/api/notifications/n1/read" && init?.method === "POST")).toBe(true);
    expect(push).toHaveBeenCalledWith("/bookings/b1");
  });

  it("a manager is sent to the staff pages, and the reassignment note goes to the queue", async () => {
    const { user } = setup("MANAGER");
    await user.click(await screen.findByRole("button", { name: /Notifications/ }));
    await user.click(await screen.findByRole("button", { name: /Your Fridge Repair is booked/ }));
    expect(push).toHaveBeenLastCalledWith("/staff/bookings/b1");

    await user.click(await screen.findByRole("button", { name: /Notifications/ }));
    await user.click(await screen.findByRole("button", { name: /need.* a new technician/ }));
    expect(push).toHaveBeenLastCalledWith("/staff/reassignments");
  });

  it("an already-read message is not marked read again", async () => {
    const { fetchMock, user } = setup("MANAGER");
    await user.click(await screen.findByRole("button", { name: /Notifications/ }));
    await user.click(await screen.findByRole("button", { name: /need.* a new technician/ }));
    expect(fetchMock.mock.calls.some(([u]) => String(u).endsWith("/n2/read"))).toBe(false);
  });
});
