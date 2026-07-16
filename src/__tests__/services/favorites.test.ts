import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { listFavorites, toggleFavorite } from "../../services/favorites";

describe("favorites service (browser mode)", () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: () => {},
      clear: () => { store = {}; },
      length: 0,
      key: () => null,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("listFavorites returns empty on first load", async () => {
    const favs = await listFavorites();
    expect(favs).toEqual([]);
  });

  it("toggleFavorite adds a file", async () => {
    const result = await toggleFavorite("test.png");
    expect(result).toContain("test.png");
  });

  it("toggleFavorite removes a file on second call", async () => {
    await toggleFavorite("test.png");
    const result = await toggleFavorite("test.png");
    expect(result).not.toContain("test.png");
  });
});
