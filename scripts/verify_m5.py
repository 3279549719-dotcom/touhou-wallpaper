#!/usr/bin/env python3
"""M5 layout A: sidebar list + prev/next nav (wheel scroll only)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SIDEBAR = ROOT / "src/components/CharacterSidebar.tsx"
NAV = ROOT / "src/components/CharacterNav.tsx"
SHELL = ROOT / "src/components/layout/AppShell.tsx"
APP = ROOT / "src/App.tsx"
HOOK = ROOT / "src/hooks/useWallpaperApp.ts"
THEME = ROOT / "src/styles/theme.css"
MANIFEST = ROOT / "assets/manifest.json"
STRINGS = ROOT / "src/lib/strings.ts"
GRID = ROOT / "src/lib/grid.ts"


def check_split_layout() -> None:
    shell = SHELL.read_text(encoding="utf-8")
    theme = THEME.read_text(encoding="utf-8")
    assert "app-shell-split" in shell and "main-stage" in shell
    assert "character-sidebar" in theme
    assert "app-shell-split" in theme
    print("M5 verify: split layout shell OK")


def check_sidebar_scroll_only() -> None:
    sidebar = SIDEBAR.read_text(encoding="utf-8")
    theme = THEME.read_text(encoding="utf-8")
    assert "character-sidebar-scroll" in sidebar
    assert "scrollIntoView" not in sidebar, (
        "sidebar must not auto-scroll on character change"
    )
    assert "onWheel" not in sidebar, "sidebar must not hijack wheel for character change"
    assert "overflow: hidden" in theme and "min-height: 0" in theme
    assert "preview-pane" in theme and "preview-stage-body" in theme
    print("M5 verify: sidebar scroll-only + fixed viewport OK")


def check_prev_next_nav() -> None:
    nav = NAV.read_text(encoding="utf-8")
    app = APP.read_text(encoding="utf-8")
    hook = HOOK.read_text(encoding="utf-8")
    assert "CharacterNav" in app
    assert "stepCharacter" in hook
    assert "wheelCharacter" not in hook, "removed wheel-based character switch"
    assert "onPrevious" in nav and "onNext" in nav
    print("M5 verify: prev/next character nav OK")


def check_label_format() -> None:
    sidebar = SIDEBAR.read_text(encoding="utf-8")
    assert "characterLabel" in sidebar
    assert "data-character-id" in sidebar
    strings = STRINGS.read_text(encoding="utf-8")
    assert "sidebarScrollHint" in strings
    assert "gridWheelHint" not in strings
    print("M5 verify: label + strings OK")


def check_manifest_order() -> None:
    assert MANIFEST.is_file(), f"Missing {MANIFEST}"
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    chars = data.get("characters", [])
    assert len(chars) >= 126
    assert chars[0]["id"] == "001" and chars[0]["name"] == "博丽灵梦"
    print("M5 verify: manifest starts with 001 博丽灵梦")


def check_no_old_grid() -> None:
    assert not (ROOT / "src/components/CharacterGrid.tsx").exists()
    grid = GRID.read_text(encoding="utf-8")
    assert "SIDEBAR_LAYOUT" in grid
    print("M5 verify: old 6-column grid removed")


def main() -> int:
    check_split_layout()
    check_sidebar_scroll_only()
    check_prev_next_nav()
    check_label_format()
    check_manifest_order()
    check_no_old_grid()
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as e:
        print(f"FAILED: {e}", file=sys.stderr)
        raise SystemExit(1)
