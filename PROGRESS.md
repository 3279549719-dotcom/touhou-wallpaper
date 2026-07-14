# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-14

## 一句话状态

**已配置开机自动启动本地 UI（localhost:1420）。** 登录 Windows 后自动 `npm run dev`。

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **V1.1 + 开发便利：Vite 登录自启** |
| GitHub | https://github.com/3279549719-dotcom/touhou-wallpaper |
| 本地 UI | 任务计划 `TouhouWallpaperViteDev` → http://localhost:1420/ |
| 阻塞 | 无 |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| M0–M9（V1） | [x] |
| favorites-only-view | [x] 已实现并归档 |
| Vite 开机自启 | [x] `npm run dev:autostart:on` |

---

## Recent changes

- 2026-07-14：Windows 任务计划开机自启 `npm run dev`（TouhouWallpaperViteDev）
- 2026-07-14：归档 `favorites-only-view`；同步主规格 `favorites-gallery`
- 2026-07-14：修多张收藏累加；按钮【取消收藏】；加强验收
- 2026-07-13：实现【只看收藏】收藏夹模式
- 2026-07-12：AGENTS 短导航；V1 自测通过

---

## Next

```
下次开机登录后打开 http://localhost:1420/ 确认自启。
取消自启：npm run dev:autostart:off
```
