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

## Tests (who writes what)

- **Implementing Agent** writes automated tests on the **same feature branch** (Vitest for `lib`/logic; update `verify_*.py` when the module needs wiring checks). Not optional.
- **CI Auto Review Agent** only **runs** `tsc` + `vitest` and comments; it does not author feature tests.
- **Patrick** does manual UI smoke only; he does not write automated tests.
- Ladder detail: [docs/dev/VERIFY.md](docs/dev/VERIFY.md).

## Done means

- Local / full gate: `npm test` + `npm run check`
- PR Cursor Agent review workflow (MVP): `tsc` + `vitest` only, then an English review comment (advisory; human merges)

## Light conventions

- Prefer existing `components` / `hooks` / `services` / `lib` / `stores` boundaries.
- Match nearby file style; do not invent new layers without need.
