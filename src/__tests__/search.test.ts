import { describe, it, expect } from "vitest";
import {
  filterCharactersByName,
  filterFavoritesByCharacterName,
  stepInList,
  pickRandomPreferDifferent,
} from "../lib/search";
import type { Character } from "../types/manifest";
import type { FavoriteGalleryItem } from "../lib/grid";

const characters: Character[] = [
  { id: "001", name: "博丽灵梦", variants: 1, files: ["001_00.png"] },
  { id: "002", name: "雾雨魔理沙", variants: 1, files: ["002_00.png"] },
  { id: "003", name: "雷欧娜", variants: 1, files: ["003_00.png"] },
];

const gallery: FavoriteGalleryItem[] = [
  {
    filename: "001_00.png",
    characterId: "001",
    characterName: "博丽灵梦",
    variantIndex: 0,
  },
  {
    filename: "002_00.png",
    characterId: "002",
    characterName: "雾雨魔理沙",
    variantIndex: 0,
  },
];

describe("filterCharactersByName", () => {
  it("empty query returns full list", () => {
    expect(filterCharactersByName(characters, "")).toEqual(characters);
    expect(filterCharactersByName(characters, "   ")).toEqual(characters);
  });

  it("matches substring in name", () => {
    const result = filterCharactersByName(characters, "灵");
    expect(result.map((c) => c.id)).toEqual(["001"]);
  });

  it("does not match by id alone", () => {
    expect(filterCharactersByName(characters, "001")).toEqual([]);
  });

  it("returns empty when nothing matches", () => {
    expect(filterCharactersByName(characters, "不存在")).toEqual([]);
  });
});

describe("filterFavoritesByCharacterName", () => {
  it("filters by characterName contains", () => {
    const result = filterFavoritesByCharacterName(gallery, "魔理沙");
    expect(result.map((g) => g.filename)).toEqual(["002_00.png"]);
  });

  it("empty query returns all favorites items", () => {
    expect(filterFavoritesByCharacterName(gallery, "")).toEqual(gallery);
  });

  it("does not match by character id alone", () => {
    expect(filterFavoritesByCharacterName(gallery, "001")).toEqual([]);
  });
});

describe("stepInList", () => {
  const items = ["a", "b", "c"];

  it("steps forward and wraps", () => {
    expect(stepInList(items, 0, 1)).toBe("b");
    expect(stepInList(items, 2, 1)).toBe("a");
  });

  it("steps backward and wraps", () => {
    expect(stepInList(items, 0, -1)).toBe("c");
  });

  it("returns null for empty list", () => {
    expect(stepInList([], 0, 1)).toBeNull();
  });

  it("treats negative currentIndex as 0", () => {
    expect(stepInList(items, -1, 1)).toBe("b");
  });
});

describe("pickRandomPreferDifferent", () => {
  it("returns null for empty list", () => {
    expect(pickRandomPreferDifferent([], () => false)).toBeNull();
  });

  it("returns the only item when size is 1", () => {
    expect(pickRandomPreferDifferent(["only"], () => true)).toBe("only");
  });

  it("prefers a different item when possible", () => {
    const items = ["a", "b"];
    let calls = 0;
    const random = () => {
      calls += 1;
      return calls === 1 ? 0 : 0.9;
    };
    const pick = pickRandomPreferDifferent(items, (x) => x === "a", random);
    expect(pick).toBe("b");
  });
});
