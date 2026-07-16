#!/usr/bin/env python3
"""M0 scaffold verification. Run: python scripts/verify/verify_m0.py"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

REQUIRED_FILES = [
    "docs/dev/ARCHITECTURE.md",
    "docs/dev/VERIFY.md",
    "package.json",
    "src/App.tsx",
    "src/hooks/useWallpaperApp.ts",
    "src/lib/tauri.ts",
    "src/components/CharacterSidebar.tsx",
    "src/components/ActionBar.tsx",
    "src-tauri/src/lib.rs",
    "scripts/build/download_assets.py",
]

REQUIRED_PACKAGE_SCRIPTS = ["check", "dev", "verify:m0"]


def main() -> int:
    missing = [f for f in REQUIRED_FILES if not (ROOT / f).exists()]
    assert not missing, f"Missing files: {missing}"

    pkg = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    scripts = pkg.get("scripts", {})
    for name in REQUIRED_PACKAGE_SCRIPTS:
        assert name in scripts, f"package.json missing script: {name}"

    grid_ts = (ROOT / "src/lib/grid.ts").read_text(encoding="utf-8")
    assert "SIDEBAR_LAYOUT" in grid_ts, "layout constant missing in grid.ts"

    tauri_rs = (ROOT / "src-tauri/src/lib.rs").read_text(encoding="utf-8")
    assert "get_manifest" in tauri_rs, "Tauri get_manifest command stub missing"
    assert "set_wallpaper" in tauri_rs, "Tauri set_wallpaper command stub missing"

    print("M0 verify: all scaffold files present")
    print("M0 verify: package scripts OK")
    print("M0 verify: sidebar layout constant OK")
    print("M0 verify: Tauri command stubs OK")
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as e:
        print(f"FAILED: {e}", file=sys.stderr)
        raise SystemExit(1)
