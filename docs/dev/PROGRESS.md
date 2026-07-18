# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-18

## 一句话状态

**角色搜索已合入 master（PR #12）。** 可选跟进：搜索框 `type="text"` 避免双 clear（分支 `fix/search-input-type-text`）。

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **Character search · merged；可选 UX 抛光** |
| 分支 | `fix/search-input-type-text`（基于 master `80f9796`） |
| 已合 | https://github.com/3279549719-dotcom/touhou-wallpaper/pull/12 → `80f9796` |
| 设计 | [2026-07-18-character-search-design.md](../superpowers/specs/2026-07-18-character-search-design.md) |
| 阻塞 | 无。可选：合入 `type="text"` 搜索框（防 WebKit 原生 clear + 自定义 ×） |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| M0–M9（V1） | [x] |
| favorites-only-view | [x] |
| Cursor Agent 自动审查 MVP | [x] PR #11 已合入 master |
| 测试归属流程（AGENTS/VERIFY） | [x] |
| 角色搜索（侧栏过滤） | [x] PR #12 已合入；可选双 clear 抛光未上 master |

---

## Recent changes

- 2026-07-18：PR #12 由人 Merge（`80f9796`）；跟进分支修 `type="text"` 双 clear
- 2026-07-18：修 `stepInList` 越界首次步进；空收藏进 favorites-only 不误清搜索
- 2026-07-18：抛光 trim/clear aria/VERIFY；开 PR #12
- 2026-07-18：实现角色名搜索 + working-set 导航 + Vitest + verify
- 2026-07-18：PR #11 Auto Review MVP 合入 master

---

## Next

```
可选：开/合小 PR，把 CharacterSearchField 从 type=search 改为 type=text（分支 fix/search-input-type-text）。
否则可直接开始下一功能。
```
