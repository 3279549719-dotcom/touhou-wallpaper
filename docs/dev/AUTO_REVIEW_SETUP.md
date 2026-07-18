# touhou-wallpaper — Auto Review / Autofix Setup

> Last aligned: 2026-07-18 — Test workflow removed; PR gate is Autofix only

## What runs on PRs

Workflow: `.github/workflows/cursor-agent-autofix.yml`  
(Job id: `test` — matches GitHub branch-protection Required check name.)

1. Run `tsc` + `vitest`
2. If **green** → success (no Cursor CLI)
3. If **red** → Cursor CLI autofix + retest, up to **3** attempts (in-job)
4. Push fixes once if the tree changed; comment outcome
5. Temp artifacts are **never committed**
6. **Human Merges**

The old `test.yml` workflow is **removed**. No separate Test check on PR or push.

Stage 1 comment-only workflow is **manual only** (`workflow_dispatch` on `cursor-agent-review.yml`).

## Requirements

| Item | Status |
|------|--------|
| GitHub Secret `CURSOR_API_KEY` | Required |
| Autofix workflow | `.github/workflows/cursor-agent-autofix.yml` |
| Autofix prompt | `.github/cursor-agent-autofix-prompt.md` |
| Agent door | Root `AGENTS.md` |
| Branch protection Required check | `test` (Autofix job id) |

## Validation

| PR | Expect |
|----|--------|
| Tiny green change | Autofix green; logs show skip CLI; Required `test` reports success |
| Deliberate failing test (TDD) | Autofix ≤3 or give-up comment; **no** temp log files in the bot commit |

## Billing

CLI usage only when checks are red (or on failed retry runs). Mechanical checks alone do not use Cursor.
