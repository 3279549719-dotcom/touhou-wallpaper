import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCharacterSearch } from "../hooks/useCharacterSearch";

describe("useCharacterSearch", () => {
  it("clearSearch empties query and isSearching becomes false", () => {
    const { result } = renderHook(() => useCharacterSearch());
    act(() => {
      result.current.setQuery("灵梦");
    });
    expect(result.current.isSearching).toBe(true);
    act(() => {
      result.current.clearSearch();
    });
    expect(result.current.query).toBe("");
    expect(result.current.isSearching).toBe(false);
  });

  it("whitespace-only query is not searching", () => {
    const { result } = renderHook(() => useCharacterSearch());
    act(() => {
      result.current.setQuery("   ");
    });
    expect(result.current.isSearching).toBe(false);
  });
});
