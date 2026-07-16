# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-16

## 一句话状态

**Four Pillars D1 进行中：** 文档/脚本已重组到 `docs/`、`scripts/build|verify`；等 PR 合并。

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **Four Pillars MVP · D1（docs/scripts）** |
| 分支 | `refactor/d1-docs-scripts` |
| GitHub | https://github.com/3279549719-dotcom/touhou-wallpaper |
| 阻塞 | 无 |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| M0–M9（V1） | [x] |
| favorites-only-view | [x] 已实现并归档 |
| Vite 开机自启 | [x] `npm run dev:autostart:on` |
| Four Pillars D1 | [~] 文档/脚本重组；待 PR 合并 |
| Four Pillars D2–D5 | [ ] |

---

## Recent changes

- 2026-07-16：D1 — 文档迁入 `docs/{dev,spec,guide}`，脚本拆到 `scripts/{build,verify}`，脚手架 `services/` `stores/`
- 2026-07-14：Windows 任务计划开机自启 `npm run dev`（TouhouWallpaperViteDev）
- 2026-07-14：归档 `favorites-only-view`；同步主规格 `favorites-gallery`
- 2026-07-14：修多张收藏累加；按钮【取消收藏】；加强验收
- 2026-07-13：实现【只看收藏】收藏夹模式

---

## Next

```
合并 D1 PR 后：按计划做 D2（components panels/sidebars + services 抽取）。
口令：执行 Four Pillars 计划 Task 2（D2）。
```
