# touhou-wallpaper — Auto Review Setup (MVP)

> Last aligned: 2026-07-17 with [design spec](../superpowers/specs/2026-07-17-auto-review-ci-design.md)

## What MVP does

On pull requests targeting `master`:

1. Run `tsc` + `vitest` (continue even if they fail)
2. Run Cursor Agent CLI with a **thin** prompt (read root `AGENTS.md` + diff + check summary)
3. Post an **English** review comment on the PR
4. **Do not** auto-fix, commit, push, or merge

## Requirements

| Item | Status |
|------|--------|
| GitHub Secret `CURSOR_API_KEY` | Required |
| Workflow | `.github/workflows/cursor-agent-review.yml` |
| Agent door | Root `AGENTS.md` |
| Push CI | `.github/workflows/test.yml` (push only; avoids duplicate PR noise) |

## Not in MVP

- Bugbot / Cursor Automations
- `verify_m*` / `cargo check` inside the Agent review job
- Autofix (`agent --force`)

## How to try

1. Open a PR against `master` that includes the workflow file
2. Wait for the **Cursor Agent Review** Action
3. Read the PR comment; merge only if you accept the change

## Billing

CLI usage consumes Cursor plan usage (same family as chat/agent). Mechanical `tsc`/`vitest` do not.
