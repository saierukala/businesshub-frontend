import { describe, expect, it } from "vitest";
import { extraChargeSchema, visitSchema } from "./visit";

describe("extra charge form", () => {
  const ok = (amount: string) => extraChargeSchema.safeParse({ amount, reason: "Gas refill" }).success;

  it("accepts rupees with up to 2 decimals", () => {
    expect(ok("250")).toBe(true);
    expect(ok("250.5")).toBe(true);
    expect(ok(" 99.99 ")).toBe(true);
  });

  it("rejects zero, negatives, 3 decimals, commas and text", () => {
    for (const bad of ["0", "0.00", "-50", "10.123", "1,000", "abc", ""]) expect(ok(bad), bad).toBe(false);
  });

  it("needs a reason", () => {
    expect(extraChargeSchema.safeParse({ amount: "100", reason: "  " }).success).toBe(false);
  });
});

describe("visit notes", () => {
  it("needs the diagnosis and the work done to complete; the rest is optional", () => {
    const base = { diagnosis: "", workPerformed: "", partsNote: "", notes: "", result: "" };
    expect(visitSchema.safeParse(base).success).toBe(false);
    expect(visitSchema.safeParse({ ...base, diagnosis: "Faulty relay" }).success).toBe(false);
    expect(visitSchema.safeParse({ ...base, diagnosis: "Faulty relay", workPerformed: "Replaced it" }).success).toBe(true);
  });
});
