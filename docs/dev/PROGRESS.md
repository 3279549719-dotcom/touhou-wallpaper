# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-18

## 一句话状态

**角色搜索设计已写成文档，等你审阅后再写实现 plan。** 同时已固定「测试由开发 Agent 同分支编写」到 AGENTS / VERIFY。

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **Character search · 设计待审阅** |
| 分支 | `ci/auto-review-mvp`（设计提交后以 git 为准） |
| 设计 | [2026-07-18-character-search-design.md](../superpowers/specs/2026-07-18-character-search-design.md) |
| 自动审查 | [PR #11](https://github.com/3279549719-dotcom/touhou-wallpaper/pull/11) 仍建议先 Merge |
| 交接（审查 MVP） | [HANDOFF_auto-review-mvp_2026-07-18.md](../handoffs/HANDOFF_auto-review-mvp_2026-07-18.md) |
| 阻塞 | 等人审阅搜索设计；#11 未合也不阻塞写 plan，但合了更好 |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| M0–M9（V1） | [x] |
| favorites-only-view | [x] |
| Vite 开机自启 | [x] |
| Four Pillars D1–D4 / docs | [x] |
| Zustand 收藏 UI 状态 | [x] PR #10 → master |
| master 分支保护（要求 test） | [x] |
| Cursor Agent 自动审查 MVP | [x] 试跑通过；**PR #11 待 Merge** |
| 角色搜索（侧栏过滤） | [~] 设计已写；实现未开始 |
| 测试归属流程（AGENTS/VERIFY） | [~] 本会话写入；随设计一并提交 |

---

## Recent changes

- 2026-07-18：角色搜索设计稿 + AGENTS/VERIFY 测试归属规则
- 2026-07-18：写 handoff；PROGRESS 指向 Auto Review 交接地图
- 2026-07-17：Secret 同步后 Agent 审查成功；清理调试埋点
- 2026-07-17：MVP workflow + 根目录 `AGENTS.md` + 设计稿
- 2026-07-17：Zustand PR #10 合入 master

---

## Next

```
请审阅 docs/superpowers/specs/2026-07-18-character-search-design.md。
若 OK，回复「设计 OK，写 plan」→ Agent 用 writing-plans 出实现计划。
可选：先 Merge PR #11。
```
