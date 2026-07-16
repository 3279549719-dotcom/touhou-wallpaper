import { toggleFavoriteInList } from "../lib/favorites";
import { describe, it, expect } from "vitest";

describe("favorites", () => {
  it("初始收藏列表为空", () => {
    const result = toggleFavoriteInList([], "wallpaper_001.png");
    expect(result).toEqual(["wallpaper_001.png"]);
  });

  it("点击收藏后列表数量变为 1", () => {
    const favorites: string[] = [];
    expect(favorites.length).toBe(0);
    const afterAdd = toggleFavoriteInList(favorites, "image_A.png");
    expect(afterAdd).toHaveLength(1);
    expect(afterAdd).toContain("image_A.png");
  });

  it("取消收藏后列表变回 0", () => {
    const afterAdd = toggleFavoriteInList([], "bg.png");
    expect(afterAdd).toHaveLength(1);
    const afterRemove = toggleFavoriteInList(afterAdd, "bg.png");
    expect(afterRemove).toHaveLength(0);
  });

  it("重复添加相同文件不会产生重复项", () => {
    const afterFirst = toggleFavoriteInList([], "same.png");
    const afterSecond = toggleFavoriteInList(afterFirst, "same.png");
    expect(afterSecond).toHaveLength(0);
  });

  it("收藏列表按字母排序", () => {
    let list: string[] = [];
    list = toggleFavoriteInList(list, "c.png");
    list = toggleFavoriteInList(list, "a.png");
    list = toggleFavoriteInList(list, "b.png");
    expect(list).toEqual(["a.png", "b.png", "c.png"]);
  });
});
