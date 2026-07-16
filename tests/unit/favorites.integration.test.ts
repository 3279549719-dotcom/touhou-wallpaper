import { describe, it, expect } from "vitest";
import { toggleFavoriteInList } from "../../src/lib/favorites";

describe("favorites (in-memory integration)", () => {
  it("添加多个文件，按字母排序", () => {
    let state: string[] = [];
    state = toggleFavoriteInList(state, "c.png");
    state = toggleFavoriteInList(state, "a.png");
    state = toggleFavoriteInList(state, "b.png");
    expect(state).toEqual(["a.png", "b.png", "c.png"]);
  });

  it("重复 toggle 最终状态一致", () => {
    const a = toggleFavoriteInList([], "x.png");
    const b = toggleFavoriteInList(a, "x.png");
    const c = toggleFavoriteInList(b, "x.png");
    expect(c).toEqual(["x.png"]);
  });

  it("空字符串也能处理", () => {
    const result = toggleFavoriteInList([], "");
    expect(result).toContain("");
    const removed = toggleFavoriteInList(result, "");
    expect(removed).toHaveLength(0);
  });
});
