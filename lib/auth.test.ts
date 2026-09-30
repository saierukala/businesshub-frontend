import { describe, expect, it } from "vitest";
import { homeFor, safeNext } from "./auth";

describe("homeFor", () => {
  it("sends each role to its area", () => {
    expect(homeFor("OWNER")).toBe("/staff");
    expect(homeFor("MANAGER")).toBe("/staff");
    expect(homeFor("TECHNICIAN")).toBe("/tech");
    expect(homeFor("CUSTOMER")).toBe("/account");
  });
});

describe("safeNext (open-redirect guard)", () => {
  it("allows same-site paths only", () => {
    expect(safeNext("/staff")).toBe("/staff");
    expect(safeNext("https://evil.example")).toBeNull();
    expect(safeNext("//evil.example")).toBeNull();
    expect(safeNext("/\\evil.example")).toBeNull();
    expect(safeNext(undefined)).toBeNull();
  });
});
