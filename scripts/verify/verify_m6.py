#!/usr/bin/env python3
"""M6 preview pane + variant strip verification."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
HOOK = ROOT / "src/hooks/useWallpaperApp.ts"
APP = ROOT / "src/App.tsx"
PREVIEW = ROOT / "src/components/PreviewPane.tsx"
VARIANT = ROOT / "src/components/VariantStrip.tsx"
THEME = ROOT / "src/styles/theme.css"
MANIFEST = ROOT / "assets/manifest.json"


def check_preview_pane() -> None:
    preview = PREVIEW.read_text(encoding="utf-8")
    theme = THEME.read_text(encoding="utf-8")
    assert "preview-pane" in preview and "preview-stage-body" in preview
    assert "preview-image" in preview
    assert ".preview-pane" in theme and ".preview-stage-body" in theme
    print("M6 verify: preview pane layout OK")


def check_variant_strip_wiring() -> None:
    variant = VARIANT.read_text(encoding="utf-8")
    app = APP.read_text(encoding="utf-8")
    assert "onSelectVariant" in variant
    assert "selectCharacter" not in variant
    assert "setWallpaper" not in variant
    assert "VariantStrip" in app and "onSelectVariant" in app
    assert "variant-strip" in variant
    print("M6 verify: variant strip wiring OK")


def check_variant_only_changes_index() -> None:
    hook = HOOK.read_text(encoding="utf-8")
    select_variant = re.search(
        r"const selectVariant = useCallback\(\(index: number\) => \{([^}]+)\}",
        hook,
        re.DOTALL,
    )
    assert select_variant, "selectVariant missing"
    body = select_variant.group(1)
    assert "setActiveVariantIndex" in body
    assert "setActiveCharacterId" not in body
    assert "setWallpaper" not in body
    print("M6 verify: selectVariant changes variant index only OK")


def check_manifest_multi_variant() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    chars = data.get("characters", [])
    multi = [c for c in chars if len(c.get("files", [])) > 1]
    assert len(chars) >= 126
    assert len(multi) >= 10, "need multi-variant characters for strip testing"
    print(f"M6 verify: manifest multi-variant chars OK ({len(multi)} with 2+ files)")


def main() -> int:
    check_preview_pane()
    check_variant_strip_wiring()
    check_variant_only_changes_index()
    check_manifest_multi_variant()
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as e:
        print(f"FAILED: {e}", file=sys.stderr)
        raise SystemExit(1)
