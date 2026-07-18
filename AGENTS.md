# AGENTS.md — Touhou Wallpaper

Tauri desktop app for browsing and applying Touhou wallpapers (React + TypeScript frontend, Rust backend).

## Start here

1. Read [docs/dev/PROGRESS.md](docs/dev/PROGRESS.md) for current status.
2. Open other docs only if the task needs them:
   - [docs/dev/ARCHITECTURE.md](docs/dev/ARCHITECTURE.md) — modules
   - [docs/dev/TECH_DESIGN.md](docs/dev/TECH_DESIGN.md) — stack / APIs
   - [docs/dev/VERIFY.md](docs/dev/VERIFY.md) — acceptance scripts
   - [docs/spec/PRD.md](docs/spec/PRD.md) — product requirements
   - [docs/spec/CONTENT.md](docs/spec/CONTENT.md) — UI copy

## Hard rules

- Code and comments: English only. UI strings come from CONTENT.md.
- Wallpaper and file I/O live in Rust (`src-tauri/`). Frontend must not set the system wallpaper directly.
- Only the **Apply** action may call `set_wallpaper`. Next / wheel / thumbnail must not.
- Do not commit `assets/images/`. No payment, login, or cloud-only image loading.
- After changes, run `npm test` and `npm run check` (or the matching `verify:mN`) until Assertion Passed.

## CI autofix (Stage 2)

- GitHub Action may call Cursor CLI **only when** `tsc` or `vitest` fails on a PR.
- Max **3** autofix attempts per job; then stop and comment.
- Autofix Agent must **not** edit `.github/workflows/**` or auto-Merge.
- Autofix must **not** commit CI temp log files (`autofix-outcome.txt`, `check-summary.txt`, `tsc.log`, `vitest.log`, `agent-autofix.log`).
- Green mechanical checks: no Cursor CLI.
- **Test** workflow (`test.yml`, includes `verify_m0`) runs on **master pushes only**; PR mechanical checks are owned by the Autofix workflow.

## Tests (who writes what)

- **Implementing Agent** writes automated tests on the **same feature branch** (Vitest for `lib`/logic; update `verify_*.py` when the module needs wiring checks). Not optional.
- **CI Autofix Agent** may patch the PR branch to make `tsc`/`vitest` green (capped). It does not replace feature tests the author should have written.
- **Patrick** does manual UI smoke only; he does not write automated tests.
- Ladder detail: [docs/dev/VERIFY.md](docs/dev/VERIFY.md).

## Done means

- Local / full gate: `npm test` + `npm run check`
- PR CI (Stage 2): `tsc` + `vitest`; autofix loop only if red; human merges

## Light conventions

- Prefer existing `components` / `hooks` / `services` / `lib` / `stores` boundaries.
- Match nearby file style; do not invent new layers without need.
