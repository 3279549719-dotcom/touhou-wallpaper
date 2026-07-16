#!/usr/bin/env python3
"""M9 release: installer + first-run download + icon."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent


def check_icon_assets() -> None:
    icons = ROOT / "src-tauri" / "icons"
    for name in ["icon.ico", "32x32.png", "128x128.png"]:
        assert (icons / name).is_file(), f"Missing icon: {icons / name}"
    print("M9 verify: app icons OK")


def check_tauri_release_config() -> None:
    conf = json.loads(
        (ROOT / "src-tauri" / "tauri.conf.json").read_text(encoding="utf-8")
    )
    assert conf.get("productName") == "东方壁纸"
    bundle = conf.get("bundle", {})
    assert bundle.get("active") is True
    assert "nsis" in bundle.get("targets", [])
    webview = bundle.get("windows", {}).get("webviewInstallMode", {})
    assert webview.get("type") == "downloadBootstrapper"
    print("M9 verify: tauri bundle config OK")


def check_download_command() -> None:
    download_rs = (ROOT / "src-tauri/src/commands/download.rs").read_text(
        encoding="utf-8"
    )
    lib_rs = (ROOT / "src-tauri/src/lib.rs").read_text(encoding="utf-8")
    assert "download_assets" in download_rs
    assert "assets_ready" in download_rs
    assert "download_assets" in lib_rs and "assets_ready" in lib_rs
    print("M9 verify: Rust download commands OK")


def check_first_run_ui() -> None:
    app = (ROOT / "src/App.tsx").read_text(encoding="utf-8")
    screen = (ROOT / "src/components/DownloadScreen.tsx").read_text(encoding="utf-8")
    hook = (ROOT / "src/hooks/useWallpaperApp.ts").read_text(encoding="utf-8")
    assert "DownloadScreen" in app and "needsDownload" in hook
    assert "downloadStart" in screen or "downloadStart" in (
        ROOT / "src/lib/strings.ts"
    ).read_text(encoding="utf-8")
    assert "download-progress" in screen
    print("M9 verify: first-run download UI OK")


def check_asset_image_tauri() -> None:
    image_url = (ROOT / "src/lib/imageUrl.ts").read_text(encoding="utf-8")
    assert "convertFileSrc" in image_url
    assert "AssetImage" in (ROOT / "src/components/AssetImage.tsx").read_text(
        encoding="utf-8"
    )
    print("M9 verify: Tauri asset image loading OK")


def check_user_assets_path() -> None:
    assets_rs = (ROOT / "src-tauri/src/commands/assets.rs").read_text(encoding="utf-8")
    assert "user_assets_dir" in assets_rs
    assert "touhou-wallpaper" in assets_rs
    print("M9 verify: user assets path OK")


def check_rename_script() -> None:
    script = (ROOT / "scripts/build/rename_installer.py").read_text(encoding="utf-8")
    assert "东方壁纸_Setup.exe" in script
    print("M9 verify: installer rename script OK")


def main() -> int:
    check_icon_assets()
    check_tauri_release_config()
    check_download_command()
    check_first_run_ui()
    check_asset_image_tauri()
    check_user_assets_path()
    check_rename_script()
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as e:
        print(f"FAILED: {e}", file=sys.stderr)
        raise SystemExit(1)
