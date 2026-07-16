#!/usr/bin/env python3
"""Download THPDP tachie assets 001-131 from thpdp.ver.moe. Module M1."""

from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

try:
    from tqdm import tqdm
except ImportError:
    print("Installing tqdm...", file=sys.stderr)
    import subprocess

    subprocess.check_call([sys.executable, "-m", "pip", "install", "tqdm", "-q"])
    from tqdm import tqdm

ROOT = Path(__file__).resolve().parent.parent.parent
ASSETS_DIR = ROOT / "assets"
IMAGES_DIR = ASSETS_DIR / "images"
BASE_URL = "https://thpdp.ver.moe"
ID_MIN = 1
ID_MAX = 131
EXPECTED_MISSING = {"011", "013", "024", "028", "034"}
MIN_CHARACTERS = 126
MIN_IMAGES = 591
RETRIES = 3
TIMEOUT_SEC = 30


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "touhou-wallpaper/0.1"})
    with urllib.request.urlopen(req, timeout=TIMEOUT_SEC) as resp:
        return json.loads(resp.read().decode("utf-8"))


def download_file(url: str, dest: Path) -> bool:
    if dest.exists() and dest.stat().st_size > 0:
        return True
    dest.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(1, RETRIES + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "touhou-wallpaper/0.1"})
            with urllib.request.urlopen(req, timeout=TIMEOUT_SEC) as resp:
                dest.write_bytes(resp.read())
            return True
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            if attempt == RETRIES:
                print(f"\nFailed {url}: {exc}", file=sys.stderr)
                return False
            time.sleep(attempt)
    return False


def pad_id(raw_id: str) -> str:
    return str(int(raw_id)).zfill(3)


def build_manifest(raw: dict) -> dict:
    characters = []
    for key in sorted(raw.keys(), key=lambda k: int(k)):
        cid = pad_id(key)
        num = int(cid)
        if num < ID_MIN or num > ID_MAX:
            continue
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
        "source": BASE_URL,
        "missingIds": sorted(EXPECTED_MISSING),
        "characters": characters,
    }


def main() -> int:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    print("Fetching id-name.json ...")
    raw = fetch_json(f"{BASE_URL}/id-name.json")
    subset = {
        pad_id(k): v
        for k, v in raw.items()
        if k.isdigit() and ID_MIN <= int(k) <= ID_MAX
    }
    id_name_path = ASSETS_DIR / "id-name.json"
    id_name_path.write_text(
        json.dumps(subset, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    manifest = build_manifest(raw)
    tasks: list[tuple[str, Path]] = []
    for ch in manifest["characters"]:
        for fname in ch["files"]:
            tasks.append((f"{BASE_URL}/images/{fname}", IMAGES_DIR / fname))

    print(f"Characters: {len(manifest['characters'])}, images to fetch: {len(tasks)}")
    failed: list[str] = []

    with tqdm(total=len(tasks), desc="Downloading tachie", unit="img", ncols=100) as bar:
        for url, dest in tasks:
            ok = download_file(url, dest)
            if not ok:
                failed.append(dest.name)
            bar.update(1)

    manifest_path = ASSETS_DIR / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    downloaded = len(list(IMAGES_DIR.glob("*.png")))
    print(f"Saved id-name.json, manifest.json")
    print(f"Images on disk: {downloaded}")

    if failed:
        print(f"Failed downloads ({len(failed)}): {failed[:10]}...", file=sys.stderr)
        return 1

    assert len(manifest["characters"]) >= MIN_CHARACTERS, (
        f"Expected >={MIN_CHARACTERS} characters, got {len(manifest['characters'])}"
    )
    assert downloaded >= MIN_IMAGES, (
        f"Expected >={MIN_IMAGES} images, got {downloaded}"
    )
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
