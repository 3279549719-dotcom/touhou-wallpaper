import { describe, it, expect } from "vitest";
import { strings } from "../lib/strings";

describe("strings", () => {
  it("所有按钮文本非空", () => {
    expect(strings.btnApply.length).toBeGreaterThan(0);
    expect(strings.favoriteOn.length).toBeGreaterThan(0);
    expect(strings.favoriteOff.length).toBeGreaterThan(0);
    expect(strings.btnPrevCharacter.length).toBeGreaterThan(0);
    expect(strings.btnNextCharacter.length).toBeGreaterThan(0);
    expect(strings.btnFavoritesOnly.length).toBeGreaterThan(0);
  });

  it("windowTitle 包含东方", () => {
    expect(strings.windowTitle).toContain("东方");
  });

  it("emptyAssets 为非空提示", () => {
    expect(strings.emptyAssets.length).toBeGreaterThan(0);
  });
});
