#!/usr/bin/env python3
"""Generate Tauri app icons from 088_00.png (Nagae Iku default tachie)."""

from __future__ import annotations

import struct
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
SOURCE = ROOT / "assets" / "images" / "088_00.png"
ICONS_DIR = ROOT / "src-tauri" / "icons"


def load_rgba(path: Path):
    try:
        from PIL import Image
    except ImportError:
        import subprocess

        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "pillow", "-q"],
        )
        from PIL import Image

    img = Image.open(path).convert("RGBA")
    return img


def write_png(path: Path, img) -> None:
    img.save(path, format="PNG")


def write_ico(path: Path, img) -> None:
    sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    images = []
    for size in sizes:
        resized = img.copy()
        resized.thumbnail(size, resample=3)  # BICUBIC
        images.append(resized)
    images[-1].save(path, format="ICO", sizes=[(i.width, i.height) for i in images])


def write_icns_placeholder(path: Path, img) -> None:
    """Minimal 128x128 PNG wrapped for macOS bundle slot (Windows build only)."""
    write_png(path.with_suffix(".png"), img.resize((128, 128), resample=3))
    # Tauri on Windows may still reference .icns; copy 128 png as fallback name
    target = path
    if not target.exists():
        import shutil

        shutil.copy2(ICONS_DIR / "128x128.png", target)


def main() -> int:
    if not SOURCE.is_file():
        print(f"Missing source image: {SOURCE}", file=sys.stderr)
        return 1

    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    img = load_rgba(SOURCE)

    square = img.copy()
    square.thumbnail((512, 512), resample=3)

    write_png(ICONS_DIR / "32x32.png", square.resize((32, 32), resample=3))
    write_png(ICONS_DIR / "128x128.png", square.resize((128, 128), resample=3))
    write_png(ICONS_DIR / "128x128@2x.png", square.resize((256, 256), resample=3))
    write_ico(ICONS_DIR / "icon.ico", square)
    write_icns_placeholder(ICONS_DIR / "icon.icns", square)

    print(f"Icons written to {ICONS_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
