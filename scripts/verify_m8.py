#!/usr/bin/env python3
"""M8 full harness acceptance: run all module verifies + MVP static checks."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
MANIFEST = ROOT / "assets/manifest.json"

MODULE_SCRIPTS = [
    "verify_m0.py",
    "verify_m1.py",
    "verify_m2.py",
    "verify_m3.py",
    "verify_m4.py",
    "verify_m5.py",
    "verify_m6.py",
    "verify_m7.py",
]

BANNED_PAYMENT_TERMS = ["stripe", "paypal", "payment", "付费", "checkout"]


def run_tsc() -> None:
    result = subprocess.run(
        ["npx", "tsc", "-b", "--noEmit"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        shell=True,
    )
    assert result.returncode == 0, result.stderr or result.stdout
    print("M8 verify: TypeScript compile OK")


def run_all_module_verifies() -> None:
    for script in MODULE_SCRIPTS:
        path = ROOT / "scripts" / script
        assert path.is_file(), f"Missing {path}"
        result = subprocess.run(
            [sys.executable, str(path)],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print(result.stdout, file=sys.stderr)
            print(result.stderr, file=sys.stderr)
            raise AssertionError(f"{script} failed")
        assert "Assertion Passed" in result.stdout, f"{script} missing Assertion Passed"
        print(f"M8 verify: {script} OK")


def check_docs_and_progress() -> None:
    for name in ["PRD.md", "ARCHITECTURE.md", "PROGRESS.md", "VERIFY.md", "README.md"]:
        assert (ROOT / name).is_file(), f"Missing {name}"
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    assert "Windows" in readme, "README must state Windows target"
    print("M8 verify: docs present OK")


def check_manifest_assets() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    chars = data.get("characters", [])
    file_count = sum(len(c.get("files", [])) for c in chars)
    assert len(chars) >= 126
    assert file_count >= 591
    print(f"M8 verify: manifest OK ({len(chars)} chars, {file_count} images)")


def check_no_payment_in_src() -> None:
    for path in SRC.rglob("*"):
        if path.suffix not in {".ts", ".tsx"}:
            continue
        text = path.read_text(encoding="utf-8").lower()
        for term in BANNED_PAYMENT_TERMS:
            assert term not in text, f"payment term {term!r} found in {path}"
    print("M8 verify: no payment gate in src OK")


def main() -> int:
    run_tsc()
    run_all_module_verifies()
    check_docs_and_progress()
    check_manifest_assets()
    check_no_payment_in_src()
    print("Assertion Passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as e:
        print(f"FAILED: {e}", file=sys.stderr)
        raise SystemExit(1)
