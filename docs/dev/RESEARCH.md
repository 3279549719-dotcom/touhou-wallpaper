# Touhou Wallpaper — Research

## Reference

**Primary**: [立绘索引 ~ 幻想人形演舞](https://thpdp.ver.moe/)
- Like: expandable character list, lazy-loaded thumbnails, search by name/ID
- Borrow: character ID + variant structure (`001_00.png`), metadata from `id-name.json`

**UX reference**: Wallpaper Engine
- Like: in-app preview, explicit **Apply** action to set desktop wallpaper
- Borrow: preview-first workflow (see before apply), not silent auto-change

**Official asset source** (alternative): [幻想人形演舞 下载页](http://www.fo-lens.net/enbu_ap/download.html)
- Game publisher provides official tachie/asset packs with usage notes
- thpdp.ver.moe states it is **not affiliated** with FocasLens

**Index site source code**: [TH-Puppet-Dance-Performance-Tachie-index](https://github.com/valloside/TH-Puppet-Dance-Performance-Tachie-index) (fan index by ver.moe)

## Positioning and style

- **What**: Personal Windows desktop wallpaper picker for 幻想人形演舞 (THPDP) character tachie art
- **Who**: User only (self-use tool, not a public product)
- **Style**: Clean, minimal; primary palette **blue + white**
- **Core experience**: Open app → see current wallpaper and same-character variants → scroll or pick another character → preview → **Apply** / **Favorite** / **换一张** (random)

## Image source findings (001–131)

### Can we fetch the images?

**Yes, technically.** The index site exposes stable public URLs:

| Item | Finding |
|------|---------|
| Metadata | `https://thpdp.ver.moe/id-name.json` — per-character `names[]` and `variants` count |
| Image URL pattern | `https://thpdp.ver.moe/images/{id}_{nn}.png` (e.g. `001_00.png`, `131_03.png`) |
| IDs 001–131 | **126 characters**, **591 images** (IDs **011, 013, 024, 028, 034** absent on site) |
| Sample size | ~60–70 KB per PNG → full 001–131 set roughly **35–45 MB** |
| Access | HTTP 200 on sampled URLs; no auth required |

A one-time download script can enumerate `id-name.json`, probe variants `00..variants-1`, and save locally. This is feasible in a build/setup step.

### Can images be bundled inside the app?

| Scenario | Recommendation |
|----------|----------------|
| **Personal use only** (you run it yourself) | OK to download once and store under project `assets/` or user data dir; do not commit large binaries to git |
| **Ship installer / share with others** | **Not recommended** without rights — art belongs to 幻想人形演舞 / FocasLens; index site is unofficial |
| **Always online, hotlink site** | Possible but fragile (network, site changes, bandwidth); poor offline UX |

**PM conclusion for v1**: Treat images as **local assets populated by a setup/download step**, not as code. App reads local folder + cached `id-name.json`. README states personal-use only; no redistribution of image pack.

## Content structure (high level)

1. **Character rail**: buttons for each character (001–131 present on site); wheel scroll switches selection
2. **Main preview**: large image of selected variant; label shows character name + variant id
3. **Current wallpaper panel**: shows what is applied on Windows desktop now
4. **Same-character strip**: thumbnails of other variants for active character
5. **Actions**: **应用** (set desktop wallpaper — only action that changes desktop), **收藏**, **换一张** (random character browse, preview only)

## Target users

- **Primary**: User on Windows 10/11
- **Scenario**: Daily desktop wallpaper rotation among favorite THPDP tachie; quick browse by character

## Technical constraints (research only)

- Must call Windows APIs to **read** current wallpaper and **set** new wallpaper (SPI / SystemParametersInfo or equivalent)
- Favorites persist locally (JSON file in app data — no login)
- v1 is offline-first after initial asset download

## Conclusions

1. **001–131 images are obtainable** via `id-name.json` + predictable URL pattern; ~591 files, ~40 MB.
2. **Bundling for personal use** is fine if downloaded locally; **do not** publish image pack or commercialize.
3. **v1 should not depend on live hotlinking** — download once, ship app + empty assets folder + setup script.
4. Scope fits a **small second project**: one window, local data, three actions, good Harness practice (verifiable wallpaper path, favorites file, character count).

## Out of scope (v1)

- Login, accounts, cloud sync
- Paid features / store
- Mobile, web, Wallpaper Engine workshop integration
- Auto crawl/update from thpdp.ver.moe at runtime (future P2)
- IDs beyond 001–131 (site has 300+ extras; user asked 001–131 only)

## Decisions (user confirmed 2026-07-12)

1. **换一张** random pool: **all 126 characters** (not auto-apply); lands on that character's grid + thumbnails; **应用** required to set wallpaper
2. **滚轮** switches **character**; **thumbnail click** switches **variant** within character
3. **Character picker layout**: grid **N rows × 6 columns**, ordered from ID 001
4. **First run**: accept one-time `scripts/download_assets` (network required), then offline
