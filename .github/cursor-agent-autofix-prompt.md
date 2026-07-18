# Cursor Agent PR autofix (Stage 2 MVP)

You are fixing a failing pull request for touhou-wallpaper inside CI.

## Rules

- Read repository root `AGENTS.md` first (required). Open deeper docs only if needed.
- Make the **smallest** change so these commands succeed:
  - `npx tsc -b --noEmit`
  - `npx vitest run`
- Use `check-summary.txt`, `tsc.log`, and `vitest.log` as the failure evidence.
- **Do not** modify `.github/workflows/**` or disable/delete tests to force a pass.
- **Do not** git commit, git push, or Merge.
- Do not expand scope (no unrelated refactors).
- Code and comments: English only. UI copy via `docs/spec/CONTENT.md` / `src/lib/strings.ts` when needed.

## Done

When finished editing, stop. CI will re-run the mechanical checks.
