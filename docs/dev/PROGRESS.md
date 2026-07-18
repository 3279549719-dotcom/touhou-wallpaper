# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-18

## 一句话状态

**Stage 2 已验证；CI 加固分支 `ci/stage2-ci-harden` 进行中（等合入后绿/红复验）。**

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **Stage 2 CI harden** |
| 分支 | `ci/stage2-ci-harden`（基线 `master` @ `aea221e`） |
| 绿验证 | [#15](https://github.com/3279549719-dotcom/touhou-wallpaper/pull/15) 已合 |
| 红验证 | [#16](https://github.com/3279549719-dotcom/touhou-wallpaper/pull/16) 已合（残留日志将在本分支清理） |
| 阻塞 | 等 harden PR 合入后重开绿/红验证 |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| 角色搜索 | [x] |
| Cursor Agent 审查 Stage 1 | [x]（手动 `workflow_dispatch`） |
| Stage 2 红测自动修（N=3） | [x] 绿/红验证均通过 |
| Stage 2 CI harden | [~] 进行中 |

---

## Recent changes

- 2026-07-18：开 `ci/stage2-ci-harden`（忽略日志、Test 仅 master、提示词/文档对齐）
- 2026-07-18：Stage 2 绿 #15 / 红 #16 验证均通过；红路径产出 bot 修复提交
- 2026-07-18：Stage 2 autofix MVP 合入 master（#14）
- 2026-07-18：写出 Stage 2 设计与实现 plan
- 2026-07-18：角色搜索合入 master

---

## Next

```
合入 ci/stage2-ci-harden 后：重开绿验证 PR（期望无 Test/test push、跳过 CLI），再开红验证 PR（期望 bot 修复且 diff 无临时日志文件），然后做「清空搜索」小功能。
```
