import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CharacterSearchField } from "../components/sidebars/CharacterSearchField";

describe("CharacterSearchField clear control", () => {
  it("hides clear button when query is empty or whitespace", () => {
    const { rerender } = render(
      <CharacterSearchField
        query=""
        onQueryChange={() => {}}
        onClear={() => {}}
        showHint={false}
        emptyMessage={null}
      />,
    );
    expect(screen.queryByTestId("character-search-clear")).toBeNull();

    rerender(
      <CharacterSearchField
        query="   "
        onQueryChange={() => {}}
        onClear={() => {}}
        showHint={false}
        emptyMessage={null}
      />,
    );
    expect(screen.queryByTestId("character-search-clear")).toBeNull();
  });

  it("shows clear button when query has text and calls onClear", () => {
    const onClear = vi.fn();
    render(
      <CharacterSearchField
        query="灵梦"
        onQueryChange={() => {}}
        onClear={onClear}
        showHint={true}
        emptyMessage={null}
      />,
    );
    const clear = screen.getByTestId("character-search-clear");
    fireEvent.click(clear);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("uses type=text so browsers do not add a second native clear control", () => {
    render(
      <CharacterSearchField
        query="a"
        onQueryChange={() => {}}
        onClear={() => {}}
        showHint={false}
        emptyMessage={null}
      />,
    );
    expect(screen.getByTestId("character-search-input").getAttribute("type")).toBe(
      "text",
    );
  });

  it("Escape key clears without setting wallpaper side effects", () => {
    const onClear = vi.fn();
    render(
      <CharacterSearchField
        query="魔理沙"
        onQueryChange={() => {}}
        onClear={onClear}
        showHint={false}
        emptyMessage={null}
      />,
    );
    fireEvent.keyDown(screen.getByTestId("character-search-input"), {
      key: "Escape",
    });
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
