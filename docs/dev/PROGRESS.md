# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-17

## 一句话状态

**Auto Review MVP 已 push，PR 待 Actions 出审查评论。** 分支 `ci/auto-review-mvp`。

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **Auto review · 等首次 PR 试跑** |
| 设计 | [docs/superpowers/specs/2026-07-17-auto-review-ci-design.md](../superpowers/specs/2026-07-17-auto-review-ci-design.md) |
| 分支 | `ci/auto-review-mvp` |
| 阻塞 | **CURSOR_API_KEY 无效** — Agent 步骤失败；需在 Dashboard 重新生成并更新 GitHub Secret |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| M0–M9（V1） | [x] |
| favorites-only-view | [x] |
| Vite 开机自启 | [x] |
| Four Pillars D1–D4 / docs | [x] |
| Zustand 收藏 UI 状态 | [x] 已合入 master（PR #10） |
| master 分支保护（要求 test） | [x] |
| Cursor Agent 自动审查 MVP | [~] 本分支已实现；待 PR 试跑 |

---

## Recent changes

- 2026-07-17：MVP — 根目录 `AGENTS.md`、审查 prompt、精简 `cursor-agent-review.yml`（tsc+vitest+英文评论）
- 2026-07-17：设计稿 `2026-07-17-auto-review-ci-design.md`
- 2026-07-17：合入 Zustand PR #10

---

## Next

```
push 分支 ci/auto-review-mvp 并开 PR 到 master，确认 Actions 出现 Cursor Agent Review 评论。
```
