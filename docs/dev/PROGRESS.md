# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-16

## 一句话状态

**Four Pillars D1–D3 已合入 master；D4（测试/CI）在 PR #4，冲突与 vitest 依赖已修好，等 Checks 绿后合并。**

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **Four Pillars · stage4 testing/CI** |
| 分支 | `refactor/stage4-testing` @ `07575ce` |
| GitHub | https://github.com/3279549719-dotcom/touhou-wallpaper |
| PR | https://github.com/3279549719-dotcom/touhou-wallpaper/pull/4 |
| 阻塞 | 等 PR #4 Checks 绿后由你 Merge；再合 #5/#6 |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| M0–M9（V1） | [x] |
| favorites-only-view | [x] 已实现并归档 |
| Vite 开机自启 | [x] `npm run dev:autostart:on` |
| Four Pillars D1 | [x] docs/scripts 已合 master |
| Four Pillars D2 | [x] components/services 已合 master（PR #2） |
| Four Pillars D3 | [x] Rust services/models 已合 master（PR #3） |
| Four Pillars D4 | [~] Vitest + CI workflows；PR #4 |
| Four Pillars D5 | [ ] |

---

## Recent changes

- 2026-07-16：stage4 rebase 到 master；解决 package.json / vitest.config.ts；补 vitest/jsdom；本地 npm test (24) + build 通过
- 2026-07-16：D1–D3 已合入 master（PR #1–#3）
- 2026-07-14：Windows 任务计划开机自启 `npm run dev`（TouhouWallpaperViteDev）
- 2026-07-14：归档 `favorites-only-view`；同步主规格 `favorites-gallery`
- 2026-07-14：修多张收藏累加；按钮【取消收藏】；加强验收

---

## Next

```
Merge PR #4（Checks 绿后）→ 再 Merge #5 → #6。
口令：合并 stage4 后继续 D5 / Zustand 或下一轮计划。
```
