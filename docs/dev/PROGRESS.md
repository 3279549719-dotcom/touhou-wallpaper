# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-18

## 一句话状态

**角色搜索已合入（[PR #12](https://github.com/3279549719-dotcom/touhou-wallpaper/pull/12)）。** 非阻塞跟进 [PR #13](https://github.com/3279549719-dotcom/touhou-wallpaper/pull/13) 已绿、可合。

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **Character search · #12 merged；#13 merge-ready** |
| 分支 | `cursor/character-search-pr-6510` @ `07edd82` |
| 已合 | https://github.com/3279549719-dotcom/touhou-wallpaper/pull/12 |
| 跟进 | https://github.com/3279549719-dotcom/touhou-wallpaper/pull/13（CLEAN） |
| 阻塞 | 无（等人合 #13 或忽略） |

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

- 2026-07-18：PR #13 绿（type=text + verify 锁定；PROGRESS 冲突标记已清）
- 2026-07-18：PR #12 合入（含越界 ‹ › 步进 Blocking 修复）
- 2026-07-18：Auto Review MVP（PR #11）合入 master

---

## Next

```
Merge 或关闭 https://github.com/3279549719-dotcom/touhou-wallpaper/pull/13（非阻塞 type=text）。
可选：零匹配时禁用 ‹ › / 换一张。
```
