# touhou-wallpaper — Auto Review / Autofix Setup

> Last aligned: 2026-07-18 with Stage 2 design

## What runs on PRs (Stage 2 MVP)

Workflow: `.github/workflows/cursor-agent-autofix.yml`

1. Run `tsc` + `vitest`
2. If **green** → success (no Cursor CLI)
3. If **red** → Cursor CLI autofix + retest, up to **3** attempts (in-job)
4. Push fixes once if the tree changed; comment outcome
5. **Human Merges**

Stage 1 comment-only workflow is **manual only** (`workflow_dispatch` on `cursor-agent-review.yml`).

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
| Tiny green change | Job green; logs show skip CLI |
| Deliberate failing test (TDD) | Autofix ≤3 or give-up comment |

## Billing

CLI usage only when checks are red (or on failed retry runs). Mechanical checks alone do not use Cursor.
