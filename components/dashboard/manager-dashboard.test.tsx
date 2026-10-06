import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ManagerDashboardView } from "./manager-dashboard";

const data = {
  todayByStatus: { COMPLETED: 2, ASSIGNED: 1 },
  pendingAssignments: { total: 0, items: [] },
  needsReassignment: { total: 0, items: [] },
  pastOpen: { total: 0, items: [] },
  availableTechnicians: [{ id: "t1", name: "Ravi Kumar" }],
  revenue: { today: "1198.00", thisMonth: "15500.00" },
  popularServices: [{ serviceId: "s1", name: "AC Repair", bookings: 7 }],
  bookingTrend: [{ date: "2026-10-04", count: 3 }],
  bookingsBySource: { ONLINE: 5, PHONE: 2 },
  technicianWorkload: [{ technicianId: "t1", name: "Ravi Kumar", today: 2, next7Days: 9 }],
};

function setup(response: { status: number; body: unknown }) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(response.body), { status: response.status })));
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ManagerDashboardView />
    </QueryClientProvider>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("ManagerDashboardView", () => {
  it("shows the numbers the API sent: nothing is calculated in the browser", async () => {
    setup({ status: 200, body: data });
    expect(await screen.findByText("₹1,198")).toBeInTheDocument(); // revenue today
    expect(screen.getByText("₹15,500")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // bookings today = 2 + 1
    expect(screen.getByText("AC Repair")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("Every upcoming booking has a technician.")).toBeInTheDocument();
  });

  it("shows the API's message and a retry button when it fails", async () => {
    setup({ status: 500, body: { error: { code: "INTERNAL_ERROR", message: "Something went wrong", details: [] } } });
    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
