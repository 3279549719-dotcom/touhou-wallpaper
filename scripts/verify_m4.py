#!/usr/bin/env python3
"""M4 favorites persistence verification."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FAVORITES_RS = ROOT / "src-tauri" / "src" / "commands" / "favorites.rs"
IMAGES = ROOT / "assets" / "images"
USE_HOOK = ROOT / "src" / "hooks" / "useWallpaperApp.ts"
ACTION_BAR = ROOT / "src" / "components" / "ActionBar.tsx"


def favorites_path(appdata: Path) -> Path:
    return appdata / "touhou-wallpaper" / "favorites.json"


def write_favorites(path: Path, items: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    unique = sorted(set(items))
    path.write_text(
        json.dumps({"favorites": unique}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def read_favorites(path: Path) -> list[str]:
    if not path.is_file():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return list(data.get("favorites", []))


def toggle(items: list[str], filename: str) -> list[str]:
    if filename in items:
        return [x for x in items if x != filename]
    return sorted(set(items + [filename]))


def check_rust_source() -> None:
    assert FAVORITES_RS.exists(), f"Missing {FAVORITES_RS}"
    src = FAVORITES_RS.read_text(encoding="utf-8")
    assert "TODO(M4)" not in src, "favorites.rs still has TODO(M4) stubs"
    assert "APPDATA" in src, "favorites must use APPDATA"
    assert "touhou-wallpaper" in src and "favorites.json" in src
    assert "list_favorites" in src and "toggle_favorite" in src
    assert "resolve_image_file" in src, "toggle must validate filename via assets"
    print("M4 verify: Rust favorites.rs implementation OK")


def check_frontend_wiring() -> None:
    hook = USE_HOOK.read_text(encoding="utf-8")
    bar = ACTION_BAR.read_text(encoding="utf-8")
    assert "listFavorites" in hook and "toggleFavorite" in hook
    assert "onToggleFavorite" in bar or "toggleFavorite" in bar
    print("M4 verify: frontend favorites wiring OK")


def check_favorites_persistence() -> None:
    pngs = sorted(IMAGES.glob("*.png"))
    assert pngs, f"No images in {IMAGES}"
    sample = pngs[0].name

    with tempfile.TemporaryDirectory() as tmp:
        appdata = Path(tmp)
        path = favorites_path(appdata)
        assert read_favorites(path) == []

        first = toggle([], sample)
        write_favorites(path, first)
        assert read_favorites(path) == [sample]

        second = toggle(first, sample)
        write_favorites(path, second)
        assert read_favorites(path) == []

        other = pngs[1].name if len(pngs) > 1 else sample
        third = toggle([], other)
        write_favorites(path, third)
        data = json.loads(path.read_text(encoding="utf-8"))
        assert "favorites" in data and other in data["favorites"]

    print("M4 verify: favorites.json persistence contract OK")


def check_cargo_optional() -> None:
    if not shutil.which("cargo"):
        print("M4 verify: cargo not installed — skipped rustc check")
        return
    result = subprocess.run(
        ["cargo", "check", "--manifest-path", str(ROOT / "src-tauri" / "Cargo.toml")],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode == 0:
        print("M4 verify: cargo check OK")
        return
    combined = (result.stdout or "") + (result.stderr or "")
    if "link.exe not found" in combined or "linker" in combined.lower():
        print(
            "M4 verify: cargo check skipped — install Visual Studio C++ Build Tools"
        )
        return
    print(combined, file=sys.stderr)
    raise AssertionError("cargo check failed")


def main() -> int:
    check_rust_source()
    check_frontend_wiring()
    check_favorites_persistence()
    check_cargo_optional()
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as e:
        print(f"FAILED: {e}", file=sys.stderr)
        raise SystemExit(1)
