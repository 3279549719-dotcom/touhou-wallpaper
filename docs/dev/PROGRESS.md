# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-18

## 一句话状态

**Stage 2 Autofix + harden 已验证合入；下一步做「清空搜索」小功能。**

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **V1 产品小迭代 · 清空搜索待做** |
| 分支 | `master` @ `838ca53`（#20 已合） |
| CI | 仅 Autofix（job id `test`）；旧 `test.yml` 已删 |
| 交接 | [HANDOFF_stage2-autofix-harden_2026-07-18.md](../handoffs/HANDOFF_stage2-autofix-harden_2026-07-18.md) |
| 阻塞 | 无 |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| 角色搜索 | [x] |
| Cursor Agent 审查 Stage 1 | [x]（手动） |
| Stage 2 红测自动修（N=3） | [x] |
| Stage 2 CI harden | [x]（#17；绿 #18 / TDD 红 #20） |
| 清空搜索 | [ ] |

---

## Recent changes

- 2026-07-18：#20 TDD 红测合入（搜索 substring 回归由 Autofix 修好）
- 2026-07-18：#17 合入（删 Test 工作流；Required `test` = Autofix）
- 2026-07-18：Stage 2 autofix MVP + 绿/红验证

---

## Next

```
实现 feature/clear-search：有搜索文字时显示清空；一点恢复完整列表；Vitest + CONTENT/strings。
先读 docs/handoffs/HANDOFF_stage2-autofix-harden_2026-07-18.md 与 docs/dev/PROGRESS.md。
```
