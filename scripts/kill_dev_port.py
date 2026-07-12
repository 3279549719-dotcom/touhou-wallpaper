#!/usr/bin/env python3
"""Stop process listening on the Vite dev port (1420)."""

from __future__ import annotations

import subprocess
import sys

PORT = 1420


def kill_on_windows(port: int) -> bool:
    result = subprocess.run(
        ["netstat", "-ano"],
        capture_output=True,
        text=True,
        check=False,
    )
    pids: set[str] = set()
    for line in result.stdout.splitlines():
        if f":{port} " in line and "LISTENING" in line.upper():
            parts = line.split()
            if parts:
                pids.add(parts[-1])
    if not pids:
        return False
    for pid in pids:
        subprocess.run(
            ["taskkill", "/PID", pid, "/F"],
            capture_output=True,
            text=True,
            check=False,
        )
        print(f"Stopped process {pid} on port {port}")
    return True


def main() -> int:
    if sys.platform != "win32":
        print("kill_dev_port: Windows only; skipped")
        return 0
    killed = kill_on_windows(PORT)
    if not killed:
        print(f"Port {PORT} is free")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
