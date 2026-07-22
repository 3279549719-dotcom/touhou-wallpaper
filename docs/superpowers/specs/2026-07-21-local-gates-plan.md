# Plan 3 — 本地机械门禁（已归档）

> **ARCHIVED 2026-07-22**  
> 本文件不再作为执行依据。  
> **已吸收进**：[质量闭环 Plan 1（合并版）](./2026-07-21-quality-test-harness-plan.md) 的阶段 **H.3**（仅 Cursor `stop` + `npm run test:core`）。  
> **明确不做（仍适用）**：ESLint/Prettier/Husky、Git pre-commit、用 AI 审查替代机械测试。

以下为归档原文，仅供对照。

---

# Plan 3 — 本地机械门禁（最后）

> Doc schema: v1 · 日期：2026-07-21  
> 依赖：**Plan 1 完成**；**Plan 2 建议至少完成 2.1**（路径稳定后再挂钩）  
> 状态：大纲已定；本地力度 = **B（中等）**

## 已拍板

| 项 | 选择 |
|----|------|
| 本地力度 | **B**：Agent 一轮结束时，若测试未绿可自动催再修（有次数上限） |
| 合入裁判 | 仍是 **GitHub Actions**（tsc + vitest / Autofix） |
| AI 审查 | **不**取代机械测试；可选后置，默认不上 Gemini pre-commit |

## 目标

- 开发阶段**更早**发现红测（少等云端）  
- 与云端门禁互补：本地快、云端严  
- 配置进仓库，可复制到下一项目

## 非目标

- 用 AI Code Review 挡住所有提交（贵、吵、不稳）  
- 关掉或削弱 GitHub Autofix  
- 在 Plan 1 未完成时强行上钩子

## 与文章第六节的对应

| 文章 | 本计划落地 |
|------|------------|
| ESLint / Prettier | **可选阶段 3.2**；先门禁测试，再格式化 |
| Husky + lint-staged | 可作 Git 侧补充；优先 Cursor `stop` 钩子（贴合 Agent 工作流） |
| 提交前检查 | 机械：`npm test`（或更快的子集，但不得弱于「核心测」） |

## 阶段

### 3.1 Cursor Hook（力度 B）

- 项目级 `.cursor/hooks.json`  
- 事件：`stop`（Agent 一轮结束）  
- 行为：跑 `npm test`（或约定的 `npm run test`）；失败则通过 hook 的 follow-up 催 Agent 再修，**限制次数**（如 2～3，对齐现有 Autofix N=3 心智）  
- 可选：`afterFileEdit` 只做极轻量提醒，**不要**每次改文件都跑全量测  

**验收**：故意弄红一个测试时，Agent 结束会被催修；次数用尽后停止死循环。

### 3.2（可选）格式与静态检查

- 若团队需要再上 ESLint / Prettier  
- 保存时或提交时只处理暂存文件  
- 规则从简，避免与现有 TS 配置大战  

**验收**：`lint`/`format` 有文档；不阻塞正当提交过久。

### 3.3（可选）Git pre-commit 机械测

- 仅跑快速测试；失败则中止 commit  
- **不要**默认接交互式 AI 审查（掘金文那种）  
- 与 Cursor Hook 二选一或互补：Hook 服务 Agent，pre-commit 服务人手 commit  

**验收**：本机 `git commit` 在测红时失败；测绿时可提交。

### 3.4 文档

- AGENTS / VERIFY 写明：本地 B 门禁 vs GitHub 裁判  
- 复制到模板项目时的最小 hooks 清单  

## 分层复习（给不懂代码的你）

| 层 | 谁 | 干什么 |
|----|-----|--------|
| Cursor Hook | 你电脑上的 Cursor | Agent 写完催测试 |
| Git Hook | 你电脑上的 Git | 提交前再拦一道（可选） |
| GitHub Actions | 网上考场 | 合入说了算 |

## 风险

| 风险 | 缓解 |
|------|------|
| stop 钩子死循环 | `loop_limit`；失败次数封顶 |
| 每次全量测太慢 | 先全量 Vitest；若慢再拆「快速子集」，但 CI 仍全量 |
| Windows 脚本权限 | hook 用 node/python 明确路径；文档写清 |

## 完成标准

- [ ] Plan 1 测网稳定  
- [ ] `.cursor/hooks.json` 已提交且力度符合 B  
- [ ] 文档说明本地 vs 云端  
- [ ] 未用 AI 审查替代 tsc/vitest  
