# Touhou Wallpaper（东方演舞壁纸）

Personal Windows desktop wallpaper picker for 幻想人形演舞 tachie (character IDs 001–131).

## Planning docs (fish-pi 5-step)

| Step | File | Role |
|------|------|------|
| 1 Research | [RESEARCH.md](RESEARCH.md) | Sources, legal, image findings |
| 2 PRD | [PRD.md](PRD.md) | Features + verifiable acceptance |
| 3 Tech | [TECH_DESIGN.md](TECH_DESIGN.md) | Stack, layout, APIs |
| 4 Agent nav | [AGENTS.md](AGENTS.md) | Build map (short) |
| — Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) | V1 module map |
| — Self-test guide | [VERIFY.md](VERIFY.md) | Plain Chinese: how each module is verified |
| — Harness | [PROGRESS.md](PROGRESS.md) | Dynamic context per session |
| 5 Build | `src/`, `src-tauri/` | Application code |

## Harness (this project)

- **PROGRESS.md** — agents update each session (what's done, what's next)
- **npm run check** — TypeScript compile + `verify_m0.py` (more `verify_mN` per module)
- **VERIFY.md** — what each script checks; what you can click-test manually

## Commands

```bash
npm install
npm run dev              # browser UI (works without Rust)
npm run check            # tsc + verify_m0
npm run verify:m0
python scripts/download_assets.py   # M1: once, requires network
npm run tauri dev        # needs Rust: https://rustup.rs
npm run tauri build
```

## Assets

Images are **not** in git. Run `scripts/download_assets.py` to populate `assets/images/`.

**Personal use only.** Do not redistribute the downloaded image pack. Credit: [thpdp.ver.moe](https://thpdp.ver.moe/) and 幻想人形演舞.

## Build sessions

See [AGENTS.md](AGENTS.md) — one step per Agent chat, e.g. `@AGENTS.md 本回合只做 S1`.
