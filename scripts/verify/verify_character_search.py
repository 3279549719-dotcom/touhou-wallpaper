#!/usr/bin/env python3
"""Character search (sidebar name filter) verification."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
CONTENT = ROOT / "docs/spec/CONTENT.md"
STRINGS = ROOT / "src/lib/strings.ts"
SEARCH_LIB = ROOT / "src/lib/search.ts"
SEARCH_TEST = ROOT / "src/__tests__/search.test.ts"
HOOK_SEARCH = ROOT / "src/hooks/useCharacterSearch.ts"
HOOK_APP = ROOT / "src/hooks/useWallpaperApp.ts"
FIELD = ROOT / "src/components/sidebars/CharacterSearchField.tsx"
SIDEBAR = ROOT / "src/components/sidebars/CharacterSidebar.tsx"
GALLERY = ROOT / "src/components/sidebars/FavoritesGallerySidebar.tsx"
APP = ROOT / "src/App.tsx"


def read(path: Path) -> str:
    assert path.is_file(), f"Missing {path}"
    return path.read_text(encoding="utf-8")


def main() -> int:
    content = read(CONTENT)
    strings = read(STRINGS)
    for key, text in [
        ("search_placeholder", "搜索角色名"),
        ("search_empty_characters", "没有匹配的角色"),
        ("search_empty_favorites", "没有匹配的收藏"),
        ("search_active_hint", "当前在搜索结果中浏览；清空搜索后恢复全部。"),
        ("search_clear_aria", "清空搜索"),
    ]:
        assert key in content and text in content, f"CONTENT missing {key}"
        assert text in strings, f"strings.ts missing {text}"

    search_lib = read(SEARCH_LIB)
    assert "filterCharactersByName" in search_lib
    assert "filterFavoritesByCharacterName" in search_lib
    assert "stepInList" in search_lib
    assert "pickRandomPreferDifferent" in search_lib
    assert "c.id.includes" not in search_lib

    assert read(SEARCH_TEST)
    assert "useCharacterSearch" in read(HOOK_SEARCH)

    app_hook = read(HOOK_APP)
    assert "clearSearch" in app_hook
    assert "filterCharactersByName" in app_hook

    field = read(FIELD)
    assert "setWallpaper" not in field
    assert 'data-testid="character-search-input"' in field
    assert 'data-testid="character-search-clear"' in field
    assert 'type="text"' in field
    assert 'type="search"' not in field
    assert "searchClearAria" in field
    assert "query.trim()" in field
    assert "Clear search" not in field
    assert "onKeyDown" in field and "Escape" in field

    assert "CharacterSearchField" in read(SIDEBAR)
    assert "CharacterSearchField" in read(GALLERY)
    assert "searchQuery" in read(APP)

    print("character-search verify: copy + wiring OK")
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as e:
        print(f"Assertion Failed: {e}", file=sys.stderr)
        raise SystemExit(1)
