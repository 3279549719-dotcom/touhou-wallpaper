import { describe, it, expect } from "vitest";
import { characterLabel, favoriteGalleryLabel, nextCharacterIndex, buildFavoritesGallery } from "../lib/grid";

describe("grid", () => {
  describe("characterLabel", () => {
    it("格式化角色 ID 和名称", () => {
      expect(characterLabel("001", "博丽灵梦")).toBe("001 博丽灵梦");
    });
  });

  describe("favoriteGalleryLabel", () => {
    it("格式化收藏项标签", () => {
      expect(favoriteGalleryLabel("001", "博丽灵梦", 0)).toBe("001 博丽灵梦 · 00");
      expect(favoriteGalleryLabel("002", "雾雨魔理沙", 5)).toBe("002 雾雨魔理沙 · 05");
    });
  });

  describe("nextCharacterIndex", () => {
    it("正向递增", () => {
      expect(nextCharacterIndex(0, 1, 10)).toBe(1);
    });
    it("反向递减", () => {
      expect(nextCharacterIndex(1, -1, 10)).toBe(0);
    });
    it("正向循环到零", () => {
      expect(nextCharacterIndex(9, 1, 10)).toBe(0);
    });
    it("反向循环到末尾", () => {
      expect(nextCharacterIndex(0, -1, 10)).toBe(9);
    });
    it("total 为 0 时返回 0", () => {
      expect(nextCharacterIndex(0, 1, 0)).toBe(0);
    });
  });

  describe("buildFavoritesGallery", () => {
    const chars = [
      { id: "001", name: "博丽灵梦", variants: 2, files: ["001_00.png", "001_01.png"] },
      { id: "002", name: "雾雨魔理沙", variants: 1, files: ["002_00.png"] },
    ];

    it("空收藏返回空数组", () => {
      expect(buildFavoritesGallery([], chars)).toEqual([]);
    });

    it("根据收藏文件名构建 gallery", () => {
      const gallery = buildFavoritesGallery(["001_00.png", "002_00.png"], chars);
      expect(gallery).toHaveLength(2);
      expect(gallery[0].filename).toBe("001_00.png");
      expect(gallery[0].characterId).toBe("001");
      expect(gallery[1].filename).toBe("002_00.png");
    });

    it("接受 Set 或数组", () => {
      const set = new Set(["001_01.png"]);
      const gallery = buildFavoritesGallery(set, chars);
      expect(gallery).toHaveLength(1);
      expect(gallery[0].filename).toBe("001_01.png");
    });
  });
});
