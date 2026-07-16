# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-17

## 一句话状态

**Zustand 在 [PR #10](https://github.com/3279549719-dotcom/touhou-wallpaper/pull/10)（等你 Merge）。** master 已要求 Actions 检查 `test` 通过才能合。

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **Four Pillars · Zustand PR + 分支保护** |
| 分支 | `feat/d3-zustand-favorites` |
| PR | https://github.com/3279549719-dotcom/touhou-wallpaper/pull/10 |
| 阻塞 | 等 Checks 绿后由你 Merge #10 |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| M0–M9（V1） | [x] |
| favorites-only-view | [x] |
| Vite 开机自启 | [x] |
| Four Pillars D1 文档/脚本 | [x] PR #1 |
| Four Pillars D2 前端分层 + services | [x] PR #2 |
| Four Pillars D3 Rust services/models | [x] PR #3 |
| Four Pillars D4 Vitest + CI | [x] PR #4 |
| progress / TROUBLESHOOTING | [x] PR #5 / #6 |
| Zustand 收藏 UI 状态 | [~] [PR #10](https://github.com/3279549719-dotcom/touhou-wallpaper/pull/10) |
| master 分支保护（要求 test） | [x] 已 API 开启（strict + contexts: test） |

---

## Recent changes

- 2026-07-17：Zustand — `wallpaperStore` + hook 接线；等 PR Merge
- 2026-07-16：合入 #4–#6；CI Test 绿；MCP 开 PR 可用
- 2026-07-14：Vite 开机自启；favorites-only 归档

---

## Next

```
Merge PR #10（Checks 绿后）。
Settings → Branches 确认 master 要求 status check「test」。
可选：本机 npm run test:watch。
```
