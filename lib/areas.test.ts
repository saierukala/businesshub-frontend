import { describe, expect, it } from "vitest";
import { closeMatch, describeUse, tidyArea, type AreaInUse } from "./areas";

const known: AreaInUse[] = [
  { area: "Gachibowli", technicians: 2, addresses: 4 },
  { area: "Hitec City", technicians: 1, addresses: 0 },
  { area: "Kondapur", technicians: 3, addresses: 6 },
  { area: "Madhapur", technicians: 2, addresses: 1 },
];

describe("tidyArea", () => {
  it("matches the backend spelling rule", () => {
    expect(tidyArea("  kondapur ")).toBe("Kondapur");
    expect(tidyArea("hitec   city")).toBe("Hitec City");
  });
});

describe("closeMatch", () => {
  it("spots a one or two letter slip", () => {
    expect(closeMatch("Kondapor", known)?.area).toBe("Kondapur");
    expect(closeMatch("Gachibowly", known)?.area).toBe("Gachibowli");
    expect(closeMatch("Madapur", known)?.area).toBe("Madhapur");
  });

  it("ignores the exact area and genuinely different names", () => {
    expect(closeMatch("Kondapur", known)).toBeUndefined();
    expect(closeMatch("Banjara Hills", known)).toBeUndefined();
  });
});

describe("describeUse", () => {
  it("shows counts, with addresses only when known", () => {
    expect(describeUse(known[2])).toBe("3 technicians, 6 addresses");
    expect(describeUse({ area: "Kondapur", technicians: 1 })).toBe("1 technician");
  });
});
