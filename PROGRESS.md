# PROGRESS.md — dynamic context (update every Agent session)



Agent: read this file **before** coding. User: optional glance for status.



## Current



| Field | Value |

|-------|-------|

| Phase | **M5 done (layout A)** |

| Active step | **M6** — preview + variant strip |

| Git | `7c7aa44` — M3完成 |



## Module status



| Module | Status |

|--------|--------|

| M0 Scaffold | [x] |

| M1 Download | [x] |

| M2 Rust assets | [x] |

| M3 Wallpaper | [x] |

| M4 Favorites | [x] |

| M5 Layout A (sidebar) | [x] |

| M6 Preview | [ ] |

| M7 Actions | [ ] |

| M8 Acceptance | [ ] |



## Milestones



| 模块 | 状态 | 说明 |

|------|------|------|

| M2 | **完成** | Rust 读取 `manifest.json`、assets 路径、图片绝对路径；`npm run verify:m2` 通过 |

| M3 | **完成** | Windows 读/设桌面壁纸（注册表 + SystemParametersInfoW）；`npm run verify:m3` 通过 |

| M5 | **完成** | 布局 A：左侧角色列表、‹ › 换角色、滚轮只滚动列表；`npm run verify:m5` 通过 |



## Last session



- **M5 布局 A 修正**：整页固定高度；左侧列表独立滚动；换角色不再自动滚列表；右侧大图始终可见



## Next (pick one per chat)



```

@ARCHITECTURE.md @PROGRESS.md 本回合只做 M6

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

| 左侧列表 + ‹ › 换角色，滚轮只滚动 | [x] |

| 点缩略图换立绘 | [ ] |

| 应用/收藏对缩略图 | [ ] |

| 001-131 图源 | [x] |

| 首次下载后离线 | [x] |

| 列表 001 博丽灵梦 | [x] |

| 付费不能做 | [ ] |



## Notes for agents



- Assets live under `assets/`; never commit PNGs

- 换一张 = random **character**, preview only until **应用**

- Layout A: sidebar scroll = wheel only; character change = list click or ‹ ›

- After each step: run `npm run check`, tick rows above, update **Current** table

