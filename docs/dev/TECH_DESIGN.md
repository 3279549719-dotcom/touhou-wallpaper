# Touhou Wallpaper — Technical Design

## Stack decision

- **Chosen**: Tauri 2 + Vite + React + TypeScript (frontend) + Rust (Tauri commands) + Python 3 (`scripts/download_assets.py`)
- **Why (from PRD)**:
  - Windows-only desktop app; must read/set system wallpaper via native APIs (not a browser tab)
  - React fits 6-column character grid, preview pane, thumbnail strip
  - Tauri keeps binary smaller than Electron for a personal long-lived tool
  - Python download script with `tqdm` suits 591-image batch fetch (PRD: one-time network, then offline)
- **Rejected**:
  - **Vite SPA only** — cannot set Windows desktop wallpaper without a shell
  - **Electron** — works, but heavier runtime for a single-window personal utility
  - **Live hotlink to thpdp.ver.moe** — RESEARCH rejects; offline-first after download

## Harness (v1 — two practices only)

| Practice | File / command | Role |
|----------|----------------|------|
| **Dynamic context** | `PROGRESS.md` | Agent reads first each session: current step, blockers, PRD row status |
| **Feedback loop** | `npm run check` | `tsc` + `eslint` + `cargo check` (Tauri); agent must run after each Build step |

Deferred to later: context garbage collection, custom MCP tools, automated session injection.

`AGENTS.md` is a **navigation map** (pointers + build table), not a full tutorial. Details live in `TECH_DESIGN.md` and `PRD.md`.

## Directory layout

```text
touhou-wallpaper/
  RESEARCH.md
  PRD.md
  TECH_DESIGN.md
  AGENTS.md              # nav map for agents
  PROGRESS.md            # dynamic context (update every session)
  CONTENT.md
  README.md
  .gitignore
  assets/                # not committed (large binaries)
    id-name.json         # cached metadata subset 001-131
    manifest.json        # generated: characters + file list
    images/              # 001_00.png ...
  scripts/
    download_assets.py   # fetch from thpdp.ver.moe, write manifest
  src/                   # React UI
    components/
    hooks/
    types/
    App.tsx
  src-tauri/             # Rust: wallpaper + paths + favorites IO
    src/
      lib.rs
      wallpaper.rs
      favorites.rs
    tauri.conf.json
  docs/handoffs/         # optional HANDOFF_*.md from /handoff skill
```

## Data / config

### `assets/manifest.json` (generated)

```json
{
  "version": 1,
  "source": "https://thpdp.ver.moe/",
  "missingIds": ["011", "013", "024", "028", "034"],
  "characters": [
    {
      "id": "001",
      "name": "博丽灵梦",
      "variants": 11,
      "files": ["001_00.png", "001_01.png"]
    }
  ]
}
```

### Favorites (runtime, user data)

- Path: `%APPDATA%/touhou-wallpaper/favorites.json`
- Shape: `{ "favorites": ["001_03.png", "044_01.png"] }`

### App state (in-memory)

- `activeCharacterId`, `activeVariantIndex`
- Preview changes on grid / wheel / thumbnail / 换一张; **desktop changes only on 应用**

## Windows wallpaper

- **Read current**: registry `HKCU\Control Panel\Desktop\Wallpaper` or `SystemParametersInfoW` (SPI_GETDESKTOPWALLPAPER)
- **Set wallpaper**: `SystemParametersInfoW` with `SPI_SETDESKTOPWALLPAPER` + absolute path to PNG under `assets/images/`
- Implemented in `src-tauri/src/wallpaper.rs`; exposed as Tauri commands `get_current_wallpaper`, `set_wallpaper`

## PRD mapping → technical checks

| 用户原话 | 可核对验收 | Tech verification |
|----------|------------|-------------------|
| Windows 桌面小应用 | Win10/11 可启动 | `npm run tauri dev` opens native window |
| 一键设为桌面壁纸 | 应用后注册表路径匹配 | `set_wallpaper` command + registry readback test |
| 收藏/喜欢 | favorites.json 持久化 | `toggle_favorite` + restart app state test |
| 换一张随机角色 | 预览变、桌面不变 | UI state change without `set_wallpaper` call |
| 必须点应用才变壁纸 | 浏览操作不调 set | Unit/integration: wheel/thumbnail/换一张 do not invoke `set_wallpaper` |
| 打开看到当前壁纸 | 启动显示系统壁纸 | `get_current_wallpaper` on mount |
| 同角色其他缩略图 | variants>1 时多条 | manifest-driven thumbnail list |
| 6列网格从001排布 | 6 columns row-major | CSS grid `grid-cols-6`; order from manifest |
| 滚轮换角色 | wheel → character id | `wheel` handler on grid; not variant index |
| 点缩略图换立绘 | click → variant only | thumbnail `onClick` updates variant index |
| 应用/收藏对任意缩略图 | 两按钮绑定当前 selection | actions use `activeCharacterId` + `activeVariantIndex` |
| 001-131 图源 | ≥126 角色, 591 图 | `download_assets.py` exit 0; manifest counts |
| 首次下载后离线 | 二次启动无网可用 | launch with assets, airplane mode OK |
| 001 博丽灵梦 | 格子标签格式 | cell renders `` `${id} ${name}` `` |
| 付费不能做 | 无付费代码 | grep payment/license gate = empty |
| npm run check | 构建门禁 | `package.json` script passes |

## Build and deploy

| Step | Command |
|------|---------|
| Install frontend deps | `npm install` |
| Download assets (once, online) | `python scripts/download_assets.py` |
| Dev | `npm run tauri dev` |
| Typecheck + lint + Rust check | `npm run check` |
| Production build | `npm run tauri build` |
| Output | `src-tauri/target/release/bundle/` (`.exe` installer) |

## UI layout (implementation hint)

```text
+--------------------------------------------------+
| Current wallpaper (small)          [换一张]      |
+--------------------------------------------------+
|           Large preview + [应用] [收藏]            |
|           Variant thumbnails (horizontal)        |
+--------------------------------------------------+
| Character grid 6 cols × N rows (wheel here)      |
| [001 博丽灵梦] [002 雾雨魔理沙] ...              |
+--------------------------------------------------+
```

Palette from CONTENT.md: blue primary, white background.

## Constraints

- Do not commit `assets/images/` or full PNG set to git
- Personal use only; README credits thpdp.ver.moe and 幻想人形演舞
- Code and comments: English only
- All user-facing strings: Chinese (from CONTENT.md)
