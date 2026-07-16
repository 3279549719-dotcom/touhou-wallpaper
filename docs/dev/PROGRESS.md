# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-16

## 一句话状态

**D1–D4 已进 master**（文档重组、前端分层、Rust 分层、Vitest+CI）。剩 PR #6 踩坑笔记；GitHub MCP 开 PR 已可用。

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **Four Pillars · 收尾文档 PR #6** |
| master | 含 PR #1–#5（D1–D4 + progress stub） |
| 打开的 PR | [#6 troubleshooting](https://github.com/3279549719-dotcom/touhou-wallpaper/pull/6) |
| 阻塞 | 无（合完 #6 即可本机验收） |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| M0–M9（V1） | [x] |
| favorites-only-view | [x] 已实现并归档 |
| Vite 开机自启 | [x] `npm run dev:autostart:on` |
| Four Pillars D1 文档/脚本 | [x] PR #1 |
| Four Pillars D2 前端分层 + services | [x] PR #2 |
| Four Pillars D3 Rust services/models | [x] PR #3 |
| Four Pillars D4 Vitest + CI | [x] PR #4 |
| progress stub | [x] PR #5 |
| TROUBLESHOOTING 踩坑笔记 | [~] PR #6 |
| Four Pillars D5 / Zustand（原计划） | [ ] 可选下一轮 |

---

## Recent changes

- 2026-07-16：合入 #4/#5；修 PR #6 与 master 的 PROGRESS 冲突
- 2026-07-16：stage4 — rebase + vitest/jsdom；修 verify_m0 路径；Actions Test 绿
- 2026-07-16：D1–D3 合入 master（PR #1–#3）；GitHub MCP 开 PR 修好
- 2026-07-14：Vite 开机自启；favorites-only 归档

---

## Next

```
Merge PR #6（TROUBLESHOOTING）。
然后本机：git checkout master && git pull && npm test && npm run build；
再手动点收藏 / 应用壁纸验收。
可选下一轮：Zustand（原 D3/D5）或分支保护。
```
