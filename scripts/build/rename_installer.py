#!/usr/bin/env python3
"""Copy/rename Tauri NSIS output to 东方壁纸_Setup.exe."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
BUNDLE_DIR = ROOT / "src-tauri" / "target" / "release" / "bundle" / "nsis"
OUTPUT_DIR = ROOT / "dist" / "release"
TARGET_NAME = "东方壁纸_Setup.exe"


def main() -> int:
    if not BUNDLE_DIR.is_dir():
        print(f"Bundle dir not found: {BUNDLE_DIR}", file=sys.stderr)
        print("Run: npm run tauri:build", file=sys.stderr)
        return 1

    installers = sorted(BUNDLE_DIR.glob("*-setup.exe"))
    if not installers:
        installers = sorted(BUNDLE_DIR.glob("*.exe"))
    if not installers:
        print(f"No installer exe in {BUNDLE_DIR}", file=sys.stderr)
        return 1

    source = installers[0]
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    dest = OUTPUT_DIR / TARGET_NAME
    shutil.copy2(source, dest)
    print(f"Installer ready: {dest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
