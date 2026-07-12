#!/usr/bin/env python3
"""Windows wallpaper helpers for dev API and CLI."""

from __future__ import annotations

import argparse
import ctypes
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "assets" / "images"

SPI_SETDESKTOPWALLPAPER = 20
SPIF_UPDATEINIFILE = 0x01
SPIF_SENDWININICHANGE = 0x02


def ensure_windows() -> None:
    if sys.platform != "win32":
        raise RuntimeError("Wallpaper API only works on Windows")


def read_current_wallpaper() -> str:
    import winreg

    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Control Panel\Desktop") as key:
        value, _ = winreg.QueryValueEx(key, "Wallpaper")
        return str(value)


def set_wallpaper_file(path: Path) -> str:
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
    current = read_current_wallpaper()
    if Path(current).resolve() != path.resolve():
        raise RuntimeError(
            f"Wallpaper registry mismatch: expected {resolved}, got {current}"
        )
    return current


def set_wallpaper_filename(filename: str) -> str:
    if (
        not filename
        or ".." in filename
        or "/" in filename
        or "\\" in filename
        or not filename.endswith(".png")
    ):
        raise ValueError(f"Invalid filename: {filename}")
    image_path = IMAGES / filename
    if not image_path.is_file():
        raise FileNotFoundError(f"Image not found: {image_path}")
    return set_wallpaper_file(image_path)


def cmd_get() -> int:
    ensure_windows()
    print(json.dumps({"ok": True, "path": read_current_wallpaper()}, ensure_ascii=False))
    return 0


def cmd_set(filename: str) -> int:
    ensure_windows()
    path = set_wallpaper_filename(filename)
    print(
        json.dumps(
            {"ok": True, "path": path, "filename": filename},
            ensure_ascii=False,
        )
    )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Wallpaper service")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("get", help="Read current wallpaper path as JSON")
    set_parser = sub.add_parser("set", help="Set wallpaper by assets/images filename")
    set_parser.add_argument("filename")
    args = parser.parse_args()

    try:
        if args.command == "get":
            return cmd_get()
        if args.command == "set":
            return cmd_set(args.filename)
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 1
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
