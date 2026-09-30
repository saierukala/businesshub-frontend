import { describe, expect, it } from "vitest";
import { timeOffSchema, toTimeOffBody } from "./time-off";

describe("time off", () => {
  it("turns whole days into IST midnight-to-midnight, whatever the browser timezone", () => {
    const body = toTimeOffBody({ startDate: "2026-10-05", endDate: "2026-10-07", reason: "SICK", note: " flu " });
    expect(body).toEqual({
      startAt: "2026-10-05T00:00:00+05:30",
      endAt: "2026-10-08T00:00:00+05:30", // end is exclusive: the day after the last day off
      reason: "SICK",
      note: "flu",
    });
  });

  it("rolls over month and year ends", () => {
    expect(toTimeOffBody({ startDate: "2026-12-31", endDate: "2026-12-31", reason: "LEAVE", note: "" }).endAt).toBe(
      "2027-01-01T00:00:00+05:30",
    );
  });

  it("rejects a last day before the first day", () => {
    const r = timeOffSchema.safeParse({ startDate: "2026-10-07", endDate: "2026-10-05", reason: "LEAVE", note: "" });
    expect(r.success).toBe(false);
  });
});
