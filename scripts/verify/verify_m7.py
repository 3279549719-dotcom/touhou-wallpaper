#!/usr/bin/env python3
"""M7 action bar rules: apply/favorite/random; only Apply sets wallpaper."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
HOOK = ROOT / "src/hooks/useWallpaperApp.ts"
APP = ROOT / "src/App.tsx"
ACTION = ROOT / "src/components/ActionBar.tsx"
CURRENT = ROOT / "src/components/CurrentWallpaperPanel.tsx"
STRINGS = ROOT / "src/lib/strings.ts"

FORBIDDEN_SETTER_FILES = [
    "src/components/CharacterSidebar.tsx",
    "src/components/CharacterNav.tsx",
    "src/components/VariantStrip.tsx",
    "src/components/CurrentWallpaperPanel.tsx",
    "src/components/PreviewPane.tsx",
]


def check_action_bar_ui() -> None:
    action = ACTION.read_text(encoding="utf-8")
    app = APP.read_text(encoding="utf-8")
    strings = STRINGS.read_text(encoding="utf-8")
    assert "strings.btnApply" in action
    assert "favoriteOn" in action or "favoriteOff" in action
    assert "main-stage-actions" in app and "ActionBar" in app
    assert "btnApply" in strings and "btnRandom" in strings
    print("M7 verify: action bar UI present OK")


def check_random_wired() -> None:
    current = CURRENT.read_text(encoding="utf-8")
    app = APP.read_text(encoding="utf-8")
    assert "onRandom" in current
    assert "randomCharacter" in app
    print("M7 verify: random character button wired OK")


def check_set_wallpaper_only_on_apply() -> None:
    hook = HOOK.read_text(encoding="utf-8")
    assert hook.count("setWallpaper(") == 1, "setWallpaper must appear once in hook"
    apply_block = re.search(
        r"const applyWallpaper = useCallback\(async \(\) => \{([\s\S]*?)\n  \},",
        hook,
    )
    assert apply_block, "applyWallpaper missing"
    assert "setWallpaper" in apply_block.group(1)

    for name in ["randomCharacter", "stepCharacter", "selectCharacter", "selectVariant"]:
        pattern = r"const " + name + r" = useCallback\([\s\S]*?\n  \},"
        block = re.search(pattern, hook)
        assert block, f"{name} missing"
        assert "setWallpaper" not in block.group(0), f"{name} must not call setWallpaper"

    for rel in FORBIDDEN_SETTER_FILES:
        text = (ROOT / rel).read_text(encoding="utf-8")
        assert "setWallpaper" not in text, f"{rel} must not call setWallpaper"

    print("M7 verify: setWallpaper only on Apply OK")


def check_random_resets_variant() -> None:
    hook = HOOK.read_text(encoding="utf-8")
    random_block = re.search(
        r"const randomCharacter = useCallback\([\s\S]*?\n  \},",
        hook,
    )
    assert random_block
    assert "selectCharacter" in random_block.group(0)
    print("M7 verify: random uses selectCharacter (preview only) OK")


def main() -> int:
    check_action_bar_ui()
    check_random_wired()
    check_set_wallpaper_only_on_apply()
    check_random_resets_variant()
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as e:
        print(f"FAILED: {e}", file=sys.stderr)
        raise SystemExit(1)
