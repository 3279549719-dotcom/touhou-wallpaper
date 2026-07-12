# AGENTS.md — Touhou Wallpaper (navigation map)

Short pointers only. Do not duplicate PRD or TECH_DESIGN prose here.

## Start here (every session)

1. Read **[PROGRESS.md](PROGRESS.md)** — module status, blockers
2. Read **[ARCHITECTURE.md](ARCHITECTURE.md)** — module scope for this chat only
3. Implement **one module** (M0–M8)
4. Run **`npm run check`** and **`npm run verify:mN`** when available
5. Fix until terminal shows **Assertion Passed**
6. Update PROGRESS.md; user can read [VERIFY.md](VERIFY.md)

## Source of truth

| Topic | File |
|-------|------|
| Module map | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Self-test guide (user) | [VERIFY.md](VERIFY.md) |
| What / acceptance | [PRD.md](PRD.md) |
| Stack / APIs | [TECH_DESIGN.md](TECH_DESIGN.md) |
| UI copy / colors | [CONTENT.md](CONTENT.md) |
| Session state | [PROGRESS.md](PROGRESS.md) |

## Build order (modules M0–M8)

| Module | Scope | Verify |
|--------|-------|--------|
| **M0** | Full scaffold + layout shell | `npm run verify:m0` |
| **M1** | `download_assets.py` | `verify_m1.py` (M1) |
| **M2** | Rust manifest/paths | `verify_m2.py` |
| **M3** | Wallpaper get/set | `verify_m3.py` |
| **M4** | Favorites | `verify_m4.py` |
| **M5** | Grid + wheel | `verify_m5.py` |
| **M6** | Preview + variants | `verify_m6.py` |
| **M7** | ActionBar rules | `verify_m7.py` |
| **M8** | PRD pass | `verify_m8.py` |

## Global acceptance (mirror PRD — verify at S6)

- [ ] Windows native app launches
- [ ] Apply only on **应用**; browse/换一张 do not change desktop
- [ ] 6-column grid, 001 order, wheel = character
- [ ] Thumbnail click = variant only
- [ ] Current wallpaper visible on start
- [ ] Favorites survive restart
- [ ] 591 images via manifest after download script
- [ ] `npm run check` passes

## Coding rules

- English code and comments only
- UI strings from CONTENT.md
- Wallpaper + file IO in **Rust** (`src-tauri/`), not frontend hacks
- No payment, login, cloud, or hotlink-only image loading

## Forbidden

- Do not commit `assets/images/`
- Do not call `set_wallpaper` from 换一张 / wheel / thumbnail handlers
- Do not expand scope beyond current PROGRESS step
- Do not skip `npm run check` after a step

## Commands

```bash
npm install
python scripts/download_assets.py
npm run tauri dev
npm run check
npm run tauri build
```

## Handoff

End long sessions with `/handoff` → save under `docs/handoffs/`, then update PROGRESS.md **Next** section.
