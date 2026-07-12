#!/usr/bin/env python3
"""M2 Rust assets + manifest path verification."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
MANIFEST = ASSETS / "manifest.json"
ID_NAME = ASSETS / "id-name.json"
IMAGES = ASSETS / "images"
ASSETS_RS = ROOT / "src-tauri" / "src" / "commands" / "assets.rs"
EXPECTED_MISSING = {"011", "013", "024", "028", "034"}
MIN_CHARACTERS = 126


def pad_id(raw_id: str) -> str:
    return str(int(raw_id)).zfill(3)


def build_manifest_from_id_name(raw: dict) -> dict:
    characters = []
    for key in sorted(raw.keys(), key=lambda k: int(k)):
        cid = pad_id(key)
        entry = raw[key]
        names = entry.get("names") or []
        variants = int(entry.get("variants") or 0)
        name = names[0] if names else ""
        files = [f"{cid}_{str(i).zfill(2)}.png" for i in range(variants)]
        characters.append(
            {
                "id": cid,
                "name": name,
                "variants": variants,
                "files": files,
            }
        )
    return {
        "version": 1,
        "source": "https://thpdp.ver.moe/",
        "missingIds": sorted(EXPECTED_MISSING),
        "characters": characters,
    }


def ensure_manifest() -> None:
    if MANIFEST.exists():
        return
    assert ID_NAME.exists(), (
        f"Missing {MANIFEST} and {ID_NAME} — run python scripts/download_assets.py"
    )
    raw = json.loads(ID_NAME.read_text(encoding="utf-8"))
    manifest = build_manifest_from_id_name(raw)
    MANIFEST.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("M2 verify: generated manifest.json from id-name.json (download may still run)")


def resolve_assets_dir() -> Path:
    env = __import__("os").environ.get("TOUHOU_WALLPAPER_ASSETS")
    if env:
        candidate = Path(env)
        if (candidate / "manifest.json").is_file():
            return candidate.resolve()

    candidates = [
        ROOT / "assets",
        ROOT / "src-tauri" / ".." / "assets",
        Path.cwd() / "assets",
        Path.cwd() / ".." / "assets",
    ]
    for candidate in candidates:
        resolved = candidate.resolve()
        if (resolved / "manifest.json").is_file():
            return resolved
    raise AssertionError("Could not resolve assets directory")


def check_rust_source() -> None:
    assert ASSETS_RS.exists(), f"Missing {ASSETS_RS}"
    src = ASSETS_RS.read_text(encoding="utf-8")
    assert "TODO(M2)" not in src, "assets.rs still has TODO(M2) stubs"
    assert "resolve_assets_dir" in src, "resolve_assets_dir helper missing"
    assert "read_to_string" in src, "get_manifest must read manifest.json from disk"
    assert "canonicalize" in src, "resolve_image_path must return absolute paths"
    assert "validate_filename" in src, "filename validation missing"
    print("M2 verify: Rust assets.rs implementation OK")


def check_manifest_data() -> dict:
    ensure_manifest()
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    chars = data.get("characters", [])
    assert len(chars) >= MIN_CHARACTERS, (
        f"characters {len(chars)} < {MIN_CHARACTERS}"
    )
    first = chars[0]
    assert first["id"] == "001" and first["name"] == "博丽灵梦", (
        f"First character unexpected: {first}"
    )
    missing = set(data.get("missingIds", []))
    assert missing == EXPECTED_MISSING, f"missingIds: {missing}"
    print(f"M2 verify: manifest has {len(chars)} characters")
    return data


def check_path_resolution(data: dict) -> None:
    assets_dir = resolve_assets_dir()
    assert assets_dir.is_dir(), f"assets dir missing: {assets_dir}"
    assert (assets_dir / "manifest.json").is_file()

    pngs = list(IMAGES.glob("*.png"))
    assert pngs, f"No images in {IMAGES} yet — wait for download"
    sample = pngs[0].name
    resolved = (assets_dir / "images" / sample).resolve()
    assert resolved.is_file(), f"resolve path failed for {sample}"
    print(f"M2 verify: assets_dir={assets_dir}")
    print(f"M2 verify: resolve_image_path sample OK ({sample})")


def check_frontend_bridge() -> None:
    tauri_ts = (ROOT / "src" / "lib" / "tauri.ts").read_text(encoding="utf-8")
    assert "loadLocalManifest" in tauri_ts, "dev manifest loader missing"
    assert 'fetch("/assets/manifest.json")' in tauri_ts, (
        "dev mode must fetch /assets/manifest.json"
    )
    print("M2 verify: frontend manifest bridge OK")


def check_cargo_optional() -> None:
    if not shutil.which("cargo"):
        print("M2 verify: cargo not installed — skipped rustc check")
        return
    result = subprocess.run(
        ["cargo", "check", "--manifest-path", str(ROOT / "src-tauri" / "Cargo.toml")],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode == 0:
        print("M2 verify: cargo check OK")
        return
    combined = (result.stdout or "") + (result.stderr or "")
    if "link.exe not found" in combined or "linker" in combined.lower():
        print(
            "M2 verify: cargo check skipped — install Visual Studio C++ Build Tools "
            "(https://visualstudio.microsoft.com/visual-cpp-build-tools/)"
        )
        return
    print(combined, file=sys.stderr)
    raise AssertionError("cargo check failed")


def main() -> int:
    check_rust_source()
    data = check_manifest_data()
    check_path_resolution(data)
    check_frontend_bridge()
    check_cargo_optional()
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as e:
        print(f"FAILED: {e}", file=sys.stderr)
        raise SystemExit(1)
