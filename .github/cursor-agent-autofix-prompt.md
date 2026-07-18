# Cursor Agent PR autofix (Stage 2 MVP)

You are fixing a failing pull request for touhou-wallpaper inside CI.

## Rules

- Read **only** these for context (do not scan other docs):
  - repository root `AGENTS.md` (required)
  - `check-summary.txt`, `tsc.log`, `vitest.log` (failure evidence)
  - `docs/spec/CONTENT.md` / `src/lib/strings.ts` **only when** the fix needs UI copy
- Make the **smallest** change so these commands succeed:
  - `npx tsc -b --noEmit`
  - `npx vitest run`
- **Do not** modify `.github/workflows/**` or disable/delete tests to force a pass.
- **Do not** git commit, git push, or Merge.
- Do not expand scope (no unrelated refactors).
- Code and comments: English only.

## Done

When finished editing, stop. CI will re-run the mechanical checks.
