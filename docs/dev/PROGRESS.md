# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-18

## 一句话状态

**角色搜索：设计 + 实现 plan 已就绪，等你选执行方式。** 测试归属已写入 AGENTS / VERIFY。

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **Character search · plan 已写，待实现** |
| 分支 | `ci/auto-review-mvp`（实现时应新建 `feature/character-search`） |
| 设计 | [2026-07-18-character-search-design.md](../superpowers/specs/2026-07-18-character-search-design.md) |
| Plan | [2026-07-18-character-search.md](../superpowers/plans/2026-07-18-character-search.md) |
| 自动审查 | [PR #11](https://github.com/3279549719-dotcom/touhou-wallpaper/pull/11) 建议先 Merge |
| 阻塞 | 等人选 Subagent / Inline 开始实现 |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| M0–M9（V1） | [x] |
| favorites-only-view | [x] |
| Vite 开机自启 | [x] |
| Four Pillars D1–D4 / docs | [x] |
| Zustand 收藏 UI 状态 | [x] |
| master 分支保护（要求 test） | [x] |
| Cursor Agent 自动审查 MVP | [x] **PR #11 待 Merge** |
| 测试归属流程（AGENTS/VERIFY） | [x] |
| 角色搜索（侧栏过滤） | [~] 设计+plan 齐；代码未开 |

---

## Recent changes

- 2026-07-18：写出 character-search 实现 plan（TDD 任务拆分）
- 2026-07-18：角色搜索设计稿 + AGENTS/VERIFY 测试归属
- 2026-07-18：Auto Review handoff
- 2026-07-17：Agent 审查试跑通过；Zustand #10 合入

---

## Next

```
实现 docs/superpowers/plans/2026-07-18-character-search.md。
选：1) Subagent-Driven  或  2) Inline Execution。
可选：先 Merge PR #11，再从 master 拉 feature/character-search。
```
