# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-18

## 一句话状态

**角色搜索已合入 master（[PR #12](https://github.com/3279549719-dotcom/touhou-wallpaper/pull/12)）。** 非阻塞跟进：[PR #13](https://github.com/3279549719-dotcom/touhou-wallpaper/pull/13)（`type=text`）。

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **Character search · 已合入；跟进抛光开着** |
| 分支 | `cursor/character-search-pr-6510`（PR #13） |
| 已合 | PR #12 → `master` @ `693ad22` |
| 跟进 | https://github.com/3279549719-dotcom/touhou-wallpaper/pull/13 |
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
| 角色搜索（侧栏过滤） | [x] PR #12 → master |

---

## Recent changes

- 2026-07-18：开 PR #13（`type=text` 避免双清空）
- 2026-07-18：PR #12 合入 master（搜索 + Auto Review Blocking ‹ › 修复）
- 2026-07-18：Auto Review MVP（PR #11）合入 master

---

## Next

```
Merge 或关闭 https://github.com/3279549719-dotcom/touhou-wallpaper/pull/13（非阻塞）。
可选：零匹配时禁用 ‹ › / 换一张。
```
