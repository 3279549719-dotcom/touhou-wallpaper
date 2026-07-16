#!/usr/bin/env python3
"""Apply a local THPDP image as Windows desktop wallpaper (M3 helper)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
IMAGES = ROOT / "assets" / "images"
sys.path.insert(0, str(Path(__file__).resolve().parent))

from wallpaper_service import read_current_wallpaper, set_wallpaper_filename  # noqa: E402


def main() -> int:
    if sys.platform != "win32":
        print("This script only works on Windows.", file=sys.stderr)
        return 1

    parser = argparse.ArgumentParser(description="Set Windows desktop wallpaper")
    parser.add_argument(
        "filename",
        nargs="?",
        default="001_00.png",
        help="Image filename under assets/images (default: 001_00.png)",
    )
    args = parser.parse_args()

    image_path = IMAGES / args.filename
    if not image_path.is_file():
        print(f"Image not found: {image_path}", file=sys.stderr)
        print("Run: python scripts/build/download_assets.py", file=sys.stderr)
        return 1

    after = set_wallpaper_filename(args.filename)
    print(f"Applied: {image_path.name}")
    print(f"Registry: {after}")
    if Path(after).resolve() != image_path.resolve():
        print("Warning: registry path differs from requested file.", file=sys.stderr)
        return 1
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
