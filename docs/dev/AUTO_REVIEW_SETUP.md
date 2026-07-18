# touhou-wallpaper — Auto Review / Autofix Setup

> Last aligned: 2026-07-18 with Stage 2 harden

## What runs where

| Trigger | Workflow | What it does |
|---------|----------|--------------|
| **Pull request** → `master` | `cursor-agent-autofix.yml` | `tsc` + `vitest`; if red → Cursor CLI autofix ≤3; push fixes; comment; **human Merges** |
| **Push** → `master` | `test.yml` | `tsc` + `vitest` + `verify_m0` |

Stage 1 comment-only workflow is **manual only** (`workflow_dispatch` on `cursor-agent-review.yml`).

## Autofix details (PR)

1. Run `tsc` + `vitest`
2. If **green** → success (no Cursor CLI)
3. If **red** → Cursor CLI autofix + retest, up to **3** attempts (in-job)
4. Push fixes once if the tree changed; comment outcome
5. Temp artifacts (`autofix-outcome.txt`, `check-summary.txt`, `tsc.log`, `vitest.log`, `agent-autofix.log`) are **never committed** (gitignore + push-step reset)

## Requirements

| Item | Status |
|------|--------|
| GitHub Secret `CURSOR_API_KEY` | Required |
| Autofix workflow | `.github/workflows/cursor-agent-autofix.yml` |
| Autofix prompt | `.github/cursor-agent-autofix-prompt.md` |
| Agent door | Root `AGENTS.md` |

## Validation

| PR | Expect |
|----|--------|
| Tiny green change | Job green; logs show skip CLI; no `Test / test (push)` on feature/`ci/*` branches |
| Deliberate failing test (TDD) | Autofix ≤3 or give-up comment; **no** temp log files in the bot commit |

## Billing

CLI usage only when checks are red (or on failed retry runs). Mechanical checks alone do not use Cursor.
