# Touhou Wallpaper PRD v0.1

## Overview

A personal **Windows desktop** wallpaper app for 幻想人形演舞 (THPDP) character tachie (IDs 001–131). User browses by character, previews art in-app (Wallpaper Engine–style), then applies, favorites, or picks a random wallpaper. Visual design: clean, blue-white. v1 is self-use only; images are local assets after a one-time download, not hotlinked.

## Structure / features

### P0 (v1 must-have)

1. **Main window** — single desktop app; blue-white minimal UI
2. **Current wallpaper** — show image currently set on Windows desktop
3. **Character grid** — **6 columns**, N rows, ordered from 001; wheel switches character; click cell selects character
4. **Preview** — large preview of selected tachie; thumbnail strip for **other variants of same character**
5. **应用** — set previewed image as Windows desktop wallpaper
6. **收藏** — toggle favorite; persist to local file across restarts
7. **换一张** — random jump to a **character** (not auto-apply): load that character's column in the grid, show its default variant in preview + all variant thumbnails; user must click **应用** to set desktop wallpaper

### P1 (future)

- Search character by name/ID
- Favorites-only browse view
- Scheduled auto-rotate
- Tray icon / minimize to tray

### P2 (future)

- Re-fetch / update assets from thpdp.ver.moe
- Extend beyond ID 131
- Login, cloud, mobile

## Design notes

| Item | Rule |
|------|------|
| Palette | Blue + white; ample whitespace |
| Layout | **Character grid**: N rows × **6 columns**, IDs from 001 in order; center: large preview; variant thumbnails for active character |
| Navigation | **Mouse wheel** on grid area → previous/next character; **click thumbnail** → switch variant (not wheel) |
| Grid cell | Each cell shows `_00` thumb + label **`[ID] 名称`** (e.g. `001 博丽灵梦`); click cell → select character + load variants |
| Reference | Wallpaper Engine: preview then explicit **应用** |
| Typography | Readable Chinese character names; show `[ID] 名称` |

## Priority

| P0 | P1 | P2 |
|----|----|-----|
| Preview, Apply, Favorite, 换一张, character wheel, current wallpaper, local assets 001–131 | Search, favorites view, schedule | Online update, extra IDs |

## 用户原话与验收映射

| 用户原话 | 可核对验收 | 状态 |
|----------|------------|------|
| 我自己的 Windows 桌面壁纸小应用 | `README` states Windows-only; app launches on Win10/11 without browser | [ ] |
| 一键设为桌面壁纸 | Click **应用** → PowerShell/script reads registry `Wallpaper` path matches applied file; or integration test sets known image | [ ] |
| 收藏/喜欢 | Toggle favorite → `%APPDATA%/touhou-wallpaper/favorites.json` contains image id; restart app → still marked | [ ] |
| 换一张从全部591张随机 | Click **换一张** → jumps to random character from full 126-char set; preview + variant thumbnails update; **desktop wallpaper unchanged** until user clicks **应用** | [ ] |
| 必须点应用才变壁纸 | **换一张** / wheel / thumbnail / grid click only change in-app preview; Windows wallpaper changes **only** on **应用** click | [ ] |
| 打开能看到当前壁纸 | Panel shows path/thumbnail of current Windows wallpaper on startup | [ ] |
| 能看到所属角色的其他壁纸 | Selecting character shows ≥2 variant thumbnails when `variants>1` in metadata | [ ] |
| 滚轮换角色，6列网格从001排布 | Character area is grid with **6 columns**, row-major from 001; wheel changes `activeCharacterId`; click grid cell selects character; preview updates | [ ] |
| 点缩略图换立绘 | Click variant thumbnail changes `activeVariant` only; wheel does **not** change variant | [ ] |
| 对其他壁纸可【应用】、收藏 | Any visible variant thumbnail: **应用** and **收藏** work | [ ] |
| 图片来自 thpdp.ver.moe 的 001–131 | `scripts/download_assets` succeeds; `assets/manifest.json` lists ≥126 characters, **591** images; IDs 011/013/024/028/034 documented absent | [ ] |
| 首次可联网下载，之后离线 | Fresh clone without assets → run download script once → app works offline on second launch | [ ] |
| 网格显示 001 博丽灵梦 | Grid cell label matches `[ID] 名称` format; e.g. first cell shows `001 博丽灵梦` | [ ] |
| 付费不能做 | No payment UI, no license gate in codebase | [ ] |

## Content / asset checklist

- [ ] Copy/cache `id-name.json` → `assets/id-name.json` (001–131 subset)
- [ ] Run download step: all `{id}_{nn}.png` per manifest (~591 files)
- [ ] `assets/manifest.json` generated with `id`, `name`, `variants`, `files[]`
- [ ] README: personal use only; images not redistributed; credit thpdp.ver.moe + 幻想人形演舞

## Acceptance (post-build)

- [ ] App starts offline with assets present
- [ ] All P0 mapping rows checked
- [ ] `npm run check` or equivalent build+lint passes (defined in tech-pack)

## Non-functional

- Startup with assets loaded: < 3 s on user machine
- Apply wallpaper: < 2 s perceived
- Favorites file human-readable JSON
- No telemetry, no account

## Explicitly not in v1

Login, database, CMS, paid features, public distribution of image pack, live hotlink-only mode, phone/web clients.
