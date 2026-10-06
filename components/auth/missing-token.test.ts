import { describe, expect, it } from "vitest";
import { tokenFrom } from "./missing-token";

const TOKEN = "3O7XxeKHhlnG39qiunx3hLkugQFgQgI1SGXfWpYvlbs";

describe("tokenFrom", () => {
  it("returns a clean token as is", () => {
    expect(tokenFrom({ token: TOKEN })).toBe(TOKEN);
  });

  it("drops text copied after the token from a JSON log", () => {
    expect(tokenFrom({ token: `${TOKEN}\\n\\nIn` })).toBe(TOKEN);
  });

  it("joins a token split by a line break or space", () => {
    expect(tokenFrom({ token: "3O7XxeKHhlnG3\n9qiunx3hLkugQFgQgI1SGXfWpYvlbs" })).toBe(TOKEN);
    expect(tokenFrom({ token: " 3O7XxeKHhlnG3 9qiunx3hLkugQFgQgI1SGXfWpYvlbs " })).toBe(TOKEN);
  });

  it("returns null when missing or unusable", () => {
    expect(tokenFrom({})).toBeNull();
    expect(tokenFrom({ token: "" })).toBeNull();
    expect(tokenFrom({ token: ["a", "b"] })).toBeNull();
    expect(tokenFrom({ token: "\\n" })).toBeNull();
  });
});
