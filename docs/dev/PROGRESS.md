# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-18

## 一句话状态

<<<<<<< HEAD
**角色搜索已合入 master（PR #12）。** 跟进：搜索框 `type=text` 避免双清空控件（小 PR）。
=======
**角色搜索已合入 master（[PR #12](https://github.com/3279549719-dotcom/touhou-wallpaper/pull/12)）。** Auto Review 试跑通过；可选小抛光另开。
>>>>>>> origin/master

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
<<<<<<< HEAD
| 阶段 | **Character search · merged；小抛光跟进** |
| 分支 | `cursor/character-search-pr-6510` @ `e700784` |
| 跟进 PR | https://github.com/3279549719-dotcom/touhou-wallpaper/pull/13 |
| 已合 | PR #12 → `master` @ `80f9796` |
| 设计 | [2026-07-18-character-search-design.md](../superpowers/specs/2026-07-18-character-search-design.md) |
=======
| 阶段 | **Character search · 已合入** |
| 分支 | `master` @ `80f9796` |
| 设计 | [2026-07-18-character-search-design.md](../superpowers/specs/2026-07-18-character-search-design.md) |
| Plan | [2026-07-18-character-search.md](../superpowers/plans/2026-07-18-character-search.md) |
>>>>>>> origin/master
| 阻塞 | 无 |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| M0–M9（V1） | [x] |
| favorites-only-view | [x] |
| Cursor Agent 自动审查 MVP | [x] |
| 测试归属流程（AGENTS/VERIFY） | [x] |
<<<<<<< HEAD
| 角色搜索（侧栏过滤） | [x] PR #12 已合入；可选 UX 抛光另开 |
=======
| 角色搜索（侧栏过滤） | [x] PR #12 → master |
>>>>>>> origin/master

---

## Recent changes

<<<<<<< HEAD
- 2026-07-18：PR #12 合入（含越界 ‹ › 步进修复）
- 2026-07-18：跟进 `type=text` 避免 native + 自定义双清空
- 2026-07-18：角色名搜索实现 + Auto Review 抛光
=======
- 2026-07-18：PR #12 合入 master（搜索 + Auto Review 反馈修复）
- 2026-07-18：Auto Review MVP（PR #11）合入 master
- 2026-07-18：搜索设计 / plan / Vitest / verify 脚本
>>>>>>> origin/master

---

## Next

```
<<<<<<< HEAD
Merge 跟进 PR（type=text search input），或忽略（非阻塞建议）。
可选：零匹配时禁用 ‹ › / 换一张。
=======
可选：开小 PR 合并 fix/search-input-type-text（搜索框 type=text，去掉双清空）。
或另开产品方向（定时换壁纸 / 多图源等）— 先 brainstorming。
>>>>>>> origin/master
```
