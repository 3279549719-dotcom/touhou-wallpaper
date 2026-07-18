# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-18

## 一句话状态

**角色搜索已合入 master（PR #12）。** 跟进：搜索框 `type=text` 避免双清空控件（小 PR）。

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **Character search · merged；小抛光跟进** |
| 分支 | `cursor/character-search-pr-6510` @ `e700784` |
| 跟进 PR | https://github.com/3279549719-dotcom/touhou-wallpaper/pull/13 |
| 已合 | PR #12 → `master` @ `80f9796` |
| 设计 | [2026-07-18-character-search-design.md](../superpowers/specs/2026-07-18-character-search-design.md) |
| 阻塞 | 无 |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| M0–M9（V1） | [x] |
| favorites-only-view | [x] |
| Cursor Agent 自动审查 MVP | [x] |
| 测试归属流程（AGENTS/VERIFY） | [x] |
| 角色搜索（侧栏过滤） | [x] PR #12 已合入；可选 UX 抛光另开 |

---

## Recent changes

- 2026-07-18：PR #12 合入（含越界 ‹ › 步进修复）
- 2026-07-18：跟进 `type=text` 避免 native + 自定义双清空
- 2026-07-18：角色名搜索实现 + Auto Review 抛光

---

## Next

```
Merge 跟进 PR（type=text search input），或忽略（非阻塞建议）。
可选：零匹配时禁用 ‹ › / 换一张。
```
