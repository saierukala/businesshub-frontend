import { describe, expect, it } from "vitest";
import { addDays, formatSlot, formatTime, istDay } from "./format";

describe("IST date helpers", () => {
  it("shows a UTC instant as India time", () => {
    expect(formatTime("2026-10-05T04:30:00.000Z")).toBe("10:00 am");
    expect(formatTime("2026-10-05T12:30:00.000Z")).toBe("6:00 pm");
    expect(formatSlot("2026-10-05T04:30:00.000Z", "2026-10-05T05:30:00.000Z")).toContain("10:00 am – 11:00 am");
  });

  it("uses the IST calendar day, not the UTC one", () => {
    // 20:00 UTC on 4 Oct is 01:30 IST on 5 Oct.
    expect(istDay(new Date("2026-10-04T20:00:00Z"))).toBe("2026-10-05");
    expect(istDay(new Date("2026-10-04T10:00:00Z"))).toBe("2026-10-04");
  });

  it("adds days across month and year ends", () => {
    expect(addDays("2026-10-05", 30)).toBe("2026-11-04");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});
