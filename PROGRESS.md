# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-12

## 一句话状态

**V1 已完成并本机自测通过。** 分享文件：`dist/release/东方壁纸_Setup.exe`（约 1.9MB）。

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **V1 / M9 完成（本机自测通过）** |
| Git | `5998ff5` M9完成：安装包、首次下载与分享发布 |
| 安装包 | `dist/release/东方壁纸_Setup.exe` |
| 本机自测 | 安装 → 首次下载 → 浏览/应用 — **已通过** |
| 阻塞 | 无 |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| M0 脚手架 | [x] |
| M1 资源下载脚本 | [x] |
| M2 Manifest / 路径 | [x] |
| M3 壁纸 get/set | [x] |
| M4 收藏 | [x] |
| M5 侧栏 + 滚轮切角色 | [x] |
| M6 预览 + 变体 | [x] |
| M7 ActionBar | [x] |
| M8 PRD 验收 | [x] |
| M9 安装包 + 首次下载 | [x] |

---

## M9 验收（含自测）

| 项 | 状态 |
|----|------|
| NSIS 安装包 + WebView2 bootstrapper | [x] |
| 首次启动下载页 → 主界面 | [x] |
| 图标：永江衣玖 `088_00.png` | [x] |
| 文件名 `东方壁纸_Setup.exe` | [x] |
| 图存 `%APPDATA%/touhou-wallpaper/assets/` | [x] |
| 本机安装→下载→应用自测 | [x] |

---

## Recent changes

- 2026-07-12：AGENTS 收成短导航；progress-harness 改为「PROGRESS 优先、契约少改」
- 2026-07-12：本机自测通过；PROGRESS / README 改为 V1 收工状态
- 2026-07-12：M9 安装包、首次下载、分享发布（`5998ff5`）

---

## Next

```
V1 已收工。无必做开发项。
可选：把 dist/release/东方壁纸_Setup.exe 发给朋友；或提出下一版想改的点。
```
