# PROGRESS.md — dynamic context (update every Agent session)

Agent: read this file **before** coding. User: optional glance for status.

## Current

| Field | Value |
|-------|-------|
| Phase | **M4 done** |
| Active step | **M5** — grid + wheel |
| Git | `7c7aa44` — M3完成 |

## Module status

| Module | Status |
|--------|--------|
| M0 Scaffold | [x] |
| M1 Download | [x] |
| M2 Rust assets | [x] |
| M3 Wallpaper | [x] |
| M4 Favorites | [x] |
| M5 Grid | [ ] |
| M6 Preview | [ ] |
| M7 Actions | [ ] |
| M8 Acceptance | [ ] |

## Milestones

| 模块 | 状态 | 说明 |
|------|------|------|
| M2 | **完成** | Rust 读取 `manifest.json`、assets 路径、图片绝对路径；`npm run verify:m2` 通过 |
| M3 | **完成** | Windows 读/设桌面壁纸（注册表 + SystemParametersInfoW）；`npm run verify:m3` 通过 |
| M4 | **完成** | 收藏写入 `%APPDATA%/touhou-wallpaper/favorites.json`；`npm run verify:m4` 通过 |

## Last session

- **M4完成**：`list_favorites` / `toggle_favorite` 持久化收藏列表
- **M3完成**：`get_current_wallpaper` / `set_wallpaper` 已实现；仅【应用】按钮可设壁纸
- **M2完成**：`get_manifest` / `get_assets_dir` / `resolve_image_path` 已实现；`scripts/verify_m2.py` 通过
- M1: `download_assets.py` finished — 126 characters, **591** PNGs, `manifest.json`
- M1: dev UI serves `/assets/images/`; grid can show real thumbs after `npm run dev`

## Next (pick one per chat)

```
@ARCHITECTURE.md @PROGRESS.md 本回合只做 M5
```

## PRD mapping status (update as rows pass)

| 用户原话 | 状态 |
|----------|------|
| Windows 桌面小应用 | [ ] |
| 一键设为桌面壁纸 | [ ] |
| 收藏/喜欢 | [x] |
| 换一张随机角色 | [ ] |
| 必须点应用才变壁纸 | [ ] |
| 打开看到当前壁纸 | [x] |
| 同角色其他缩略图 | [ ] |
| 6列网格 + 滚轮换角色 | [ ] |
| 点缩略图换立绘 | [ ] |
| 应用/收藏对缩略图 | [ ] |
| 001-131 图源 | [x] |
| 首次下载后离线 | [x] |
| 网格 001 博丽灵梦 | [ ] |
| 付费不能做 | [ ] |

## Notes for agents

- Assets live under `assets/`; never commit PNGs
- 换一张 = random **character**, preview only until **应用**
- After each step: run `npm run check`, tick rows above, update **Current** table
