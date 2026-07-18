import { describe, it, expect } from "vitest";

describe("autofix smoke", () => {
  it("expects 2+2", () => {
    // Deliberate fail for Stage 2 harden validation — Agent should fix expectation or expression.
    expect(2 + 2).toBe(4);
  });
});
