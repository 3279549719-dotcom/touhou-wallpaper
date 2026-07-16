#!/usr/bin/env python3
"""Favorites-only gallery mode (OpenSpec favorites-only-view) verification."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
CONTENT = ROOT / "docs/spec/CONTENT.md"
STRINGS = ROOT / "src/lib/strings.ts"
GRID = ROOT / "src/lib/grid.ts"
FAVORITES_LIB = ROOT / "src/lib/favorites.ts"
TAURI = ROOT / "src/lib/tauri.ts"
HOOK = ROOT / "src/hooks/useWallpaperApp.ts"
APP = ROOT / "src/App.tsx"
ACTION_BAR = ROOT / "src/components/ActionBar.tsx"
SIDEBAR = ROOT / "src/components/CharacterSidebar.tsx"
GALLERY = ROOT / "src/components/FavoritesGallerySidebar.tsx"
PRD = ROOT / "docs/spec/PRD.md"


def read(path: Path) -> str:
    assert path.is_file(), f"Missing {path}"
    return path.read_text(encoding="utf-8")


def toggle_favorite_in_list(favorites: list[str], filename: str) -> list[str]:
    """Mirror src/lib/favorites.ts toggleFavoriteInList."""
    next_set = set(favorites)
    if filename in next_set:
        next_set.remove(filename)
    else:
        next_set.add(filename)
    return sorted(next_set)


def build_gallery(favorites: set[str], characters: list[dict]) -> list[str]:
    items: list[str] = []
    for character in characters:
        for filename in character["files"]:
            if filename in favorites:
                items.append(filename)
    return items


def check_copy() -> None:
    content = read(CONTENT)
    strings = read(STRINGS)
    assert "btn_favorites_only" in content and "只看收藏" in content
    assert "favorites_only_empty" in content and "请至少收藏一张图片" in content
    assert "取消收藏" in content
    assert 'btnFavoritesOnly: "只看收藏"' in strings
    assert 'favoritesOnlyEmpty: "请至少收藏一张图片"' in strings
    assert 'favoriteOn: "取消收藏"' in strings
    assert "已收藏" not in strings or 'favoriteOn: "已收藏"' not in strings
    print("favorites-gallery verify: CONTENT + strings OK")


def check_unfavorite_label() -> None:
    action = read(ACTION_BAR)
    strings = read(STRINGS)
    assert "favoriteOn" in action and "favoriteOff" in action
    assert 'favoriteOn: "取消收藏"' in strings
    assert 'favoriteOff: "收藏"' in strings
    print("favorites-gallery verify: 【收藏】/【取消收藏】 wiring OK")


def check_session_default_off() -> None:
    hook = read(HOOK)
    assert "favoritesOnly, setFavoritesOnly] = useState(false)" in hook
    assert "setFavoritesOnly(false)" in hook
    assert "favoritesOnly" in hook
    print("favorites-gallery verify: session default off (not persisted) OK")


def check_empty_block() -> None:
    hook = read(HOOK)
    assert "favoritesOnlyEmpty" in hook
    assert "favorites.size === 0" in hook
    assert "setFavoritesOnlyHint" in hook
    print("favorites-gallery verify: empty favorites block OK")


def check_gallery_list() -> None:
    grid = read(GRID)
    gallery = read(GALLERY)
    app = read(APP)
    assert "buildFavoritesGallery" in grid
    assert "FavoriteGalleryItem" in grid
    assert "FavoritesGallerySidebar" in app
    assert "data-favorite-filename" in gallery
    assert "favoriteGalleryLabel" in gallery
    print("favorites-gallery verify: one-row-per-image gallery OK")


def check_hide_variant_strip() -> None:
    app = read(APP)
    assert "VariantStrip" in app
    assert re.search(r"!app\.favoritesOnly[\s\S]*?<VariantStrip", app)
    print("favorites-gallery verify: variant strip hidden in gallery mode OK")


def check_scoped_nav() -> None:
    hook = read(HOOK)
    assert "if (favoritesOnly)" in hook
    assert hook.count("buildFavoritesGallery") >= 3
    assert "randomCharacter" in hook and "stepCharacter" in hook
    assert "setWallpaper(activeFilename)" in hook
    assert hook.count("setWallpaper(") == 1
    print("favorites-gallery verify: scoped nav + apply-only wallpaper OK")


def check_auto_exit() -> None:
    hook = read(HOOK)
    assert "updated.length === 0" in hook
    assert "setFavoritesOnly(false)" in hook
    print("favorites-gallery verify: auto-exit on last unfavorite OK")


def check_toggle_in_sidebars() -> None:
    sidebar = read(SIDEBAR)
    gallery = read(GALLERY)
    assert "favorites-only-toggle" in sidebar and "favorites-only-toggle" in gallery
    assert "onToggleFavoritesOnly" in sidebar
    print("favorites-gallery verify: toggle wired in both sidebars OK")


def check_prd() -> None:
    prd = read(PRD)
    assert "只看收藏" in prd
    assert "请至少收藏一张图片" in prd
    assert "收藏夹" in prd
    assert "取消收藏" in prd
    assert "不得只剩最后一张" in prd or "N 条" in prd
    print("favorites-gallery verify: PRD acceptance row OK")


def check_no_single_filename_mock() -> None:
    tauri = read(TAURI)
    fav_lib = read(FAVORITES_LIB)
    assert "toggleFavoriteInList" in fav_lib
    assert "toggleFavoriteInList" in tauri
    # Forbid the old bug: browser mock returns only the clicked filename
    assert not re.search(
        r"export async function toggleFavorite[\s\S]*?return \[filename\];",
        tauri,
    ), "browser toggleFavorite must not return only [filename]"
    assert "readBrowserFavorites" in tauri and "writeBrowserFavorites" in tauri
    print("favorites-gallery verify: browser mock accumulates (no single-item return) OK")


def check_multi_favorite_accumulate_logic() -> None:
    """Behavioral check: sequential toggles keep ≥2; gallery rows match."""
    favorites: list[str] = []
    favorites = toggle_favorite_in_list(favorites, "001_00.png")
    favorites = toggle_favorite_in_list(favorites, "002_00.png")
    assert len(favorites) >= 2, f"expected ≥2 favorites, got {favorites}"
    assert set(favorites) == {"001_00.png", "002_00.png"}

    characters = [
        {"id": "001", "name": "A", "files": ["001_00.png", "001_01.png"]},
        {"id": "002", "name": "B", "files": ["002_00.png", "002_01.png"]},
    ]
    rows = build_gallery(set(favorites), characters)
    assert len(rows) >= 2, f"gallery must show ≥2 rows, got {rows}"
    assert rows == ["001_00.png", "002_00.png"]

    favorites = toggle_favorite_in_list(favorites, "001_00.png")
    assert favorites == ["002_00.png"]
    print("favorites-gallery verify: multi-favorite accumulate + gallery length OK")


def check_gallery_order_logic() -> None:
    characters = [
        {"id": "002", "name": "B", "files": ["002_00.png", "002_01.png"]},
        {"id": "001", "name": "A", "files": ["001_00.png", "001_01.png"]},
    ]
    favorites = {"001_01.png", "002_00.png", "001_00.png"}
    items = build_gallery(favorites, characters)
    assert items == ["002_00.png", "001_00.png", "001_01.png"]
    characters_sorted = sorted(characters, key=lambda c: c["id"])
    items2 = build_gallery(favorites, characters_sorted)
    assert items2 == ["001_00.png", "001_01.png", "002_00.png"]
    print("favorites-gallery verify: gallery order helper logic OK")


def main() -> int:
    check_copy()
    check_unfavorite_label()
    check_session_default_off()
    check_empty_block()
    check_gallery_list()
    check_hide_variant_strip()
    check_scoped_nav()
    check_auto_exit()
    check_toggle_in_sidebars()
    check_prd()
    check_no_single_filename_mock()
    check_multi_favorite_accumulate_logic()
    check_gallery_order_logic()
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as e:
        print(f"FAILED: {e}", file=sys.stderr)
        raise SystemExit(1)
