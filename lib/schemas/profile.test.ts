import { describe, expect, it } from "vitest";
import { profileSchema } from "./profile";

describe("profileSchema", () => {
  it("accepts a 10-digit mobile, or no phone at all", () => {
    expect(profileSchema.safeParse({ name: "Ravi Kumar", phone: "9876543210" }).success).toBe(true);
    expect(profileSchema.safeParse({ name: "Ravi Kumar", phone: "" }).success).toBe(true);
  });

  it("rejects a short name and a bad phone", () => {
    expect(profileSchema.safeParse({ name: "R", phone: "" }).success).toBe(false);
    expect(profileSchema.safeParse({ name: "Ravi", phone: "12345" }).success).toBe(false);
  });
});
