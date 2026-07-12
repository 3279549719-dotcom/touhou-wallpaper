#!/usr/bin/env python3
"""M3 Windows wallpaper get/set verification."""

from __future__ import annotations

import ctypes
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WALLPAPER_RS = ROOT / "src-tauri" / "src" / "commands" / "wallpaper.rs"
IMAGES = ROOT / "assets" / "images"
USE_HOOK = ROOT / "src" / "hooks" / "useWallpaperApp.ts"
APP_TSX = ROOT / "src" / "App.tsx"

SPI_SETDESKTOPWALLPAPER = 20
SPIF_UPDATEINIFILE = 0x01
SPIF_SENDWININICHANGE = 0x02


def check_rust_source() -> None:
    assert WALLPAPER_RS.exists(), f"Missing {WALLPAPER_RS}"
    src = WALLPAPER_RS.read_text(encoding="utf-8")
    assert "TODO(M3)" not in src, "wallpaper.rs still has TODO(M3) stubs"
    assert "SystemParametersInfoW" in src, "set_wallpaper must use SystemParametersInfoW"
    assert "open_subkey" in src and "Wallpaper" in src, (
        "get_current_wallpaper must read registry"
    )
    assert "resolve_image_file" in src, "set_wallpaper must resolve asset path"
    assert "WallpaperStyle" in src, "set_wallpaper must apply fit style"
    print("M3 verify: Rust wallpaper.rs implementation OK")


def check_thumbnail_css() -> None:
    css = (ROOT / "src" / "styles" / "theme.css").read_text(encoding="utf-8")
    assert "object-fit: cover" not in css, "thumbnails must not crop with object-fit: cover"
    assert ".variant-thumb" in css and "object-fit: contain" in css
    print("M3 verify: thumbnail contain CSS OK")


def check_dev_wallpaper_api() -> None:
    vite = (ROOT / "vite.config.ts").read_text(encoding="utf-8")
    tauri_ts = (ROOT / "src" / "lib" / "tauri.ts").read_text(encoding="utf-8")
    assert "wallpaperDevApi" in vite, "vite dev wallpaper API missing"
    assert "/api/wallpaper" in tauri_ts, "frontend must call /api/wallpaper in dev mode"
    service = ROOT / "scripts" / "wallpaper_service.py"
    assert service.exists(), f"Missing {service}"
    print("M3 verify: dev wallpaper API wiring OK")
    hook = USE_HOOK.read_text(encoding="utf-8")
    app = APP_TSX.read_text(encoding="utf-8")
    panel = (ROOT / "src" / "components" / "CurrentWallpaperPanel.tsx").read_text(
        encoding="utf-8"
    )
    assert "setWallpaper" in hook, "useWallpaperApp must call setWallpaper"
    assert "applyWallpaper" in hook
    assert "wallpaperPathToImageUrl" in hook, "hook must resolve current wallpaper preview"
    assert "onApply" in app and "applyWallpaper" in app
    assert "randomCharacter" in app
    assert "current-wallpaper-thumb" in panel, "current wallpaper thumbnail UI missing"
    for rel in [
        "src/components/CharacterSidebar.tsx",
        "src/components/VariantStrip.tsx",
        "src/components/CurrentWallpaperPanel.tsx",
        "src/components/PreviewPane.tsx",
    ]:
        text = (ROOT / rel).read_text(encoding="utf-8")
        assert "setWallpaper" not in text, f"{rel} must not call setWallpaper"
    print("M3 verify: set_wallpaper only wired through Apply action OK")


def read_registry_wallpaper() -> str:
    import winreg

    with winreg.OpenKey(
        winreg.HKEY_CURRENT_USER, r"Control Panel\Desktop"
    ) as key:
        value, _ = winreg.QueryValueEx(key, "Wallpaper")
        return str(value)


def set_registry_wallpaper(path: str) -> None:
    wide = (path + "\0").encode("utf-16le")
    ok = ctypes.windll.user32.SystemParametersInfoW(
        SPI_SETDESKTOPWALLPAPER,
        0,
        ctypes.c_wchar_p(path),
        SPIF_UPDATEINIFILE | SPIF_SENDWININICHANGE,
    )
    assert ok, f"SystemParametersInfoW failed (GetLastError={ctypes.windll.kernel32.GetLastError()})"


def normalize_path(path: str) -> str:
    if not path:
        return ""
    return str(Path(path).resolve()).lower()


def check_windows_wallpaper_roundtrip() -> None:
    if sys.platform != "win32":
        print("M3 verify: skipped Windows wallpaper roundtrip (not win32)")
        return

    pngs = sorted(IMAGES.glob("*.png"))
    assert pngs, f"No images in {IMAGES}"
    sample = str(pngs[0].resolve())

    original = read_registry_wallpaper()
    try:
        set_registry_wallpaper(sample)
        current = read_registry_wallpaper()
        assert normalize_path(current) == normalize_path(sample), (
            f"Registry path mismatch: {current!r} != {sample!r}"
        )
        print(f"M3 verify: Windows wallpaper roundtrip OK ({pngs[0].name})")
    finally:
        if original:
            set_registry_wallpaper(original)


def check_cargo_optional() -> None:
    if not shutil.which("cargo"):
        print("M3 verify: cargo not installed — skipped rustc check")
        return
    result = subprocess.run(
        ["cargo", "check", "--manifest-path", str(ROOT / "src-tauri" / "Cargo.toml")],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode == 0:
        print("M3 verify: cargo check OK")
        return
    combined = (result.stdout or "") + (result.stderr or "")
    if "link.exe not found" in combined or "linker" in combined.lower():
        print(
            "M3 verify: cargo check skipped — install Visual Studio C++ Build Tools"
        )
        return
    print(combined, file=sys.stderr)
    raise AssertionError("cargo check failed")


def check_service_roundtrip() -> None:
    if sys.platform != "win32":
        print("M3 verify: skipped wallpaper_service roundtrip (not win32)")
        return
    pngs = sorted(IMAGES.glob("*.png"))
    assert pngs, f"No images in {IMAGES}"
    sample = pngs[0].name
    original = read_registry_wallpaper()
    try:
        result = subprocess.run(
            [sys.executable, str(ROOT / "scripts" / "wallpaper_service.py"), "set", sample],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        assert result.returncode == 0, result.stderr or result.stdout
        assert '"ok": true' in result.stdout
        current = read_registry_wallpaper()
        assert normalize_path(current) == normalize_path(str(pngs[0].resolve()))
        print(f"M3 verify: wallpaper_service roundtrip OK ({sample})")
    finally:
        if original:
            set_registry_wallpaper(original)


def main() -> int:
    check_rust_source()
    check_thumbnail_css()
    check_dev_wallpaper_api()
    check_service_roundtrip()
    check_windows_wallpaper_roundtrip()
    check_cargo_optional()
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as e:
        print(f"FAILED: {e}", file=sys.stderr)
        raise SystemExit(1)
