# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-18

## 一句话状态

**角色搜索 PR #12 merge-ready：Auto Review Blocking none；等你 Merge。**

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **Character search · merge-ready** |
| 分支 | `feature/character-search` @ `dd354be` |
| PR | https://github.com/3279549719-dotcom/touhou-wallpaper/pull/12 |
| 设计 | [2026-07-18-character-search-design.md](../superpowers/specs/2026-07-18-character-search-design.md) |
| Plan | [2026-07-18-character-search.md](../superpowers/plans/2026-07-18-character-search.md) |
| 阻塞 | 无代码阻塞；等人 Merge（不自动合） |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| M0–M9（V1） | [x] |
| favorites-only-view | [x] |
| Cursor Agent 自动审查 MVP | [x] PR #11 已合入 master |
| 测试归属流程（AGENTS/VERIFY） | [x] |
| 角色搜索（侧栏过滤） | [~] 实现 + Auto Review 反馈已处理；待人 Merge |

---

## Recent changes

- 2026-07-18：修 `stepInList` 越界首次步进跳过首项；空收藏进 favorites-only 不误清搜索
- 2026-07-18：抛光 trim/clear aria/VERIFY；开 PR #12
- 2026-07-18：实现角色名搜索 + working-set 导航 + Vitest + verify
- 2026-07-18：PR #11 Auto Review MVP 合入 master

---

## Next

```
打开 https://github.com/3279549719-dotcom/touhou-wallpaper/pull/12
确认 Checks 全绿后 Merge（人合；勿自动合）。
```
