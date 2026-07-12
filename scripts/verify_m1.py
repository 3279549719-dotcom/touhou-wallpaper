#!/usr/bin/env python3
"""M1 download + manifest verification."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "assets" / "manifest.json"
IMAGES = ROOT / "assets" / "images"
MIN_CHARACTERS = 126
MIN_IMAGES = 591


def main() -> int:
    assert MANIFEST.exists(), f"Missing {MANIFEST} — run python scripts/download_assets.py"
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    chars = data.get("characters", [])
    assert len(chars) >= MIN_CHARACTERS, (
        f"characters {len(chars)} < {MIN_CHARACTERS}"
    )

    png_count = len(list(IMAGES.glob("*.png")))
    assert png_count >= MIN_IMAGES, f"images {png_count} < {MIN_IMAGES}"

    first = chars[0]
    assert first["id"] == "001" and first["name"] == "博丽灵梦", (
        f"First character unexpected: {first}"
    )

    missing = set(data.get("missingIds", []))
    assert missing == {"011", "013", "024", "028", "034"}, f"missingIds: {missing}"

    print(f"M1 verify: {len(chars)} characters, {png_count} images")
    print("M1 verify: manifest structure OK")
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as e:
        print(f"FAILED: {e}", file=sys.stderr)
        raise SystemExit(1)
