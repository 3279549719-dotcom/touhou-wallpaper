# 质量改造总览（三计划 → 两项）

> 2026-07-21 起草 · **2026-07-22 合并拍板**

## 现在怎么走

1. **[质量闭环（测网 + 薄 Cursor 催测）](./2026-07-21-quality-test-harness-plan.md)** ← **当前执行**（已合并原 Plan 3.1）  
2. **清空搜索练手** — 质量闭环合入后，另开 `feature/clear-search`  
3. **[结构重构](./2026-07-21-refactor-structure-plan.md)** — **挂起**，等你点头再开  

## 归档

- [原 Plan 3 本地门禁全文](./2026-07-21-local-gates-plan.md) — **已归档**（仅 3.1 子集进质量闭环；ESLint/Husky/Git hook 不做）

## 拍板摘要（2026-07-22）

| 项 | 选择 |
|----|------|
| 测试政策 | B（边界表 + Vitest；纯样式可跳过） |
| 写测时机 | B + 重要规则可轻量 TDD |
| 核心用例 | 搜索 / 清空 / 收藏 / 仅应用设壁纸 |
| 手测 | C（尽量少） |
| 审查清单 | 英文（给 Agent） |
| 本地钩子 | Cursor `stop` → `npm run test:core`（子集） |
| 合入裁判 | GitHub Autofix（不变） |
| 分支 | **必须**功能分支，禁止在 master 上乱改 |
| 重构 | 挂起 |

实现计划：`docs/superpowers/plans/2026-07-22-quality-harness.md`
