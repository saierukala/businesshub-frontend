import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AuditEntry as Entry } from "@/lib/queries/audit";
import { AuditEntry } from "./audit-entry";

const entry = (action: string, metadata: Record<string, unknown>): Entry => ({
  id: "a1",
  action,
  entityType: "Technician",
  entityId: "2d0eb38e-72e2-492c-bef8-df8273e0caa6",
  metadata,
  createdAt: "2026-10-07T10:52:00.000Z",
  user: { id: "u1", name: "Vikram Singh", role: "MANAGER" },
});

const show = (e: Entry) => render(<ul><AuditEntry a={e} /></ul>);

describe("AuditEntry details", () => {
  it("shows an edited field as old → new, not [object Object]", () => {
    show(entry("CUSTOMER_UPDATED", { email: { from: null, to: "priya.nair@example.test" }, phone: { from: "9000000011", to: "9000000012" } }));
    expect(screen.getByText("none → priya.nair@example.test")).toBeInTheDocument();
    expect(screen.getByText("9000000011 → 9000000012")).toBeInTheDocument();
    expect(screen.queryByText(/object Object/)).not.toBeInTheDocument();
  });

  it("shows time off as whole days and the reason as a word", () => {
    show(entry("TIME_OFF_ADDED", { startAt: "2026-10-08T18:30:00.000Z", endAt: "2026-10-09T18:30:00.000Z", reason: "SICK", bookingsFlagged: 1 }));
    expect(screen.getByText("9 Oct 2026")).toBeInTheDocument();
    expect(screen.queryByText(/12:00 am/)).not.toBeInTheDocument();
    expect(screen.getByText("Sick")).toBeInTheDocument();
    expect(screen.queryByText(/“SICK”/)).not.toBeInTheDocument();
  });

  it("keeps a written reason in the quote box", () => {
    show(entry("BOOKING_CANCELLED", { reason: "Customer is travelling" }));
    expect(screen.getByText("“Customer is travelling”")).toBeInTheDocument();
  });
});
