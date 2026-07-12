#!/usr/bin/env python3
"""Apply a local THPDP image as Windows desktop wallpaper (M3 helper)."""

from __future__ import annotations

import argparse
import ctypes
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "assets" / "images"

SPI_SETDESKTOPWALLPAPER = 20
SPIF_UPDATEINIFILE = 0x01
SPIF_SENDWININICHANGE = 0x02


def set_wallpaper(path: Path) -> None:
    resolved = str(path.resolve())
    ok = ctypes.windll.user32.SystemParametersInfoW(
        SPI_SETDESKTOPWALLPAPER,
        0,
        ctypes.c_wchar_p(resolved),
        SPIF_UPDATEINIFILE | SPIF_SENDWININICHANGE,
    )
    if not ok:
        err = ctypes.windll.kernel32.GetLastError()
        raise RuntimeError(f"SystemParametersInfoW failed (error {err})")


def read_current_wallpaper() -> str:
    import winreg

    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Control Panel\Desktop") as key:
        value, _ = winreg.QueryValueEx(key, "Wallpaper")
        return str(value)


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
        print("Run: python scripts/download_assets.py", file=sys.stderr)
        return 1

    before = read_current_wallpaper()
    set_wallpaper(image_path)
    after = read_current_wallpaper()
    print(f"Applied: {image_path.name}")
    print(f"Registry: {after}")
    if Path(after).resolve() != image_path.resolve():
        print("Warning: registry path differs from requested file.", file=sys.stderr)
        return 1
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
