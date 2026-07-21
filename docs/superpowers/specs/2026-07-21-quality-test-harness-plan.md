# Plan 1 — 质量闭环（测网 + 薄本地催测）【已合并 Plan 3.1】

> Doc schema: v1 · 起草：2026-07-21 · **合并拍板：2026-07-22**  
> 状态：**设计已确认，待按实现计划执行**  
> 分支约定：**一律在功能分支上改，禁止直接在 `master` 上堆改动**  
> 原 Plan 3（本地门禁全文）→ **已归档**，仅吸收其中 **3.1 Cursor stop 钩子（核心测子集）**

## 已拍板决策（含 2026-07-22 澄清）

| 项 | 选择 |
|----|------|
| 改造范围 | 质量流程 + 测试网 + **薄本地催测**；重构另挂 |
| 测试政策 | **B**：默认边界表 + Vitest；纯文案/样式可跳过 |
| 写测时机 | **B**：同一次交付「测试 + 实现」；**重要规则可轻量 TDD（先红后绿）** |
| 第一批核心用例 | **A**：搜索、清空搜索、收藏切换、「仅应用才设壁纸」 |
| 手测 | **C**：尽量少；真壁纸等保留短手测 |
| 审查清单语言 | **英文**（给 Agent）；给人看的说明仍可用中文 |
| 本地门禁 | **薄钩子**：Cursor `stop` 跑 **`npm run test:core`**（子集，非全量） |
| Git commit / ESLint / Husky | **本次不做** |
| 合入裁判 | 仍是 **GitHub Actions**（`tsc` + `vitest` / Autofix） |
| 清空搜索功能 | **另开分支 / 另 PR**（本计划只补测与流程；功能练手在下一步） |
| 结构重构（原 Plan 2） | **挂起**，PROGRESS 标明暂不做 |

## 目标（一句话）

把交付闭环写进仓库并跑通：**标准 → 边界表 → Vitest → 英文审查清单 → 本地核心测催修 → GitHub 全量机械门禁 → 极少手测**。

## 非目标（本次不做）

- 大拆 `useWallpaperApp` / 抽 Mock（→ 原 Plan 2，已挂起）
- Git pre-commit、ESLint、Prettier、Husky
- 全量 Playwright E2E
- 削弱或替换现有 GitHub Autofix
- 在本 PR 内实现「清空搜索」产品改动（仅允许补与现有 `clearSearch` 相关的单测）

## 分层（够用版）

| 层 | 谁 | 干什么 |
|----|-----|--------|
| 规矩 | AGENTS / VERIFY / 英文审查清单 | 写代码时 Agent 按流程交作业 |
| 本地催测 | Cursor `stop` → `npm run test:core` | Agent 一轮结束若核心测红则催修（`loop_limit` 2～3） |
| 裁判 | GitHub Autofix | PR 上 `tsc` + 全量 `vitest`；红可自动修，N=3 |
| 人手 | 你 | 只点关键手感 / 真壁纸 |

英文审查清单 **不会**减少测哪些功能；测多少由 Vitest 范围决定。

## 完成定义（Definition of Done）

任一**非纯样式**功能，Agent 交付须同时满足：

1. 有简短中文说明：正常行为 + 边界 + 出错提示 + 桌面是否可变  
2. 有边界情况表（或明确标注「样式/文案跳过」）  
3. 有 Vitest（正常 + 边界）；相关测绿；合入前全量 `npm test` 绿  
4. 需要接线时：对应 `verify_*.py` 仍过或已更新  
5. 对照**英文审查清单**自检一遍  
6. GitHub 上 `tsc` + `vitest` 可通过  

## 质量标准（写入项目、给 AI 看）

- **正确**：行为符合 PRD/CONTENT；**只有【应用】调用 `set_wallpaper` / `setWallpaper`**
- **可读 / 可维护**：英文代码与注释；UI 文案走 CONTENT/strings
- **边界与错误**：空列表、无结果等有友好提示，不默默坏掉
- **安全（裁剪）**：不提交密钥；不把 `assets/images/` 进库；无付费/登录后门
- **性能**：本地小工具默认不专项优化，除非已感到卡顿

## 边界情况表（模板）

| 情况 | 输入/前置 | 期望 |
|------|-----------|------|
| 正常 | … | … |
| 空输入 / 清空 | … | … |
| 无结果 | … | … |
| 与其它模式 | … | … |
| 桌面 | 浏览/清空/换一张等 | **不**调用设壁纸 |

## 英文审查清单（权威副本在实现时写入仓库）

实现阶段将新增例如 `docs/dev/REVIEW_CHECKLIST.md`（English），AGENTS 只放指针。清单覆盖：behavior, edges, wallpaper rule, tests green, no secrets, scope creep。

## 实现阶段（合并后执行顺序）

### 阶段 H.1 — 规矩进仓库

- 更新 `docs/dev/VERIFY.md`、根目录 `AGENTS.md`
- 新增英文 `REVIEW_CHECKLIST.md`
- 本文件为权威计划；索引指向本文件；Plan 3 标归档
- **验收**：新 Agent 只读 AGENTS/VERIFY/清单即可按新流程做功能

### 阶段 H.2 — 核心 Vitest + `test:core`

| 主题 | 测什么 | 落点 |
|------|--------|------|
| 搜索 | 子串、空串、无结果 | `src/__tests__/search.test.ts` + `lib/search` |
| 清空搜索 | `clearSearch` 后 query 空、`isSearching` false | 扩 search 测或测 `useCharacterSearch` |
| 收藏 | 加入/取消/排序/去重 | 已有 `favorites.test.ts`，按需补 |
| 仅应用设壁纸 | 合同测：仅 apply 路径可调 set；其它 UI 路径不含调用 | 新 `wallpaper-apply-gate` 测（可对齐 verify_m7 精神） |

- `package.json` 增加 `test:core`：只跑上述核心文件  
- **验收**：`npm run test:core` 与 `npm test` 均绿

### 阶段 H.3 — Cursor `stop` 薄钩子

- `.cursor/hooks.json` + Windows 友好的 Node 脚本（勿依赖 bash-only）
- 事件：`stop`；命令：跑 `npm run test:core`
- 失败：`followup_message` 催修；`loop_limit`：3
- 跳过 `aborted` / `error` status，避免无效循环
- **不做** `afterFileEdit` 全量测、不做 Git hook
- **验收**：故意弄红一个核心测 → Agent 停后被催修；次数用尽停止

### 阶段 H.4 — CI 说明对齐（不改 workflow）

- VERIFY/README：本地日常可用 `test:core`；合入仍靠 GitHub 全量 `tsc`+`vitest`
- **验收**：文档与真实命令一致

### 阶段 H.5 — 下一步（不在本 PR）

- 分支 `feature/clear-search`：按完成定义做清空搜索产品改动（若 UI 仍缺）并短手测

## 风险与缓解

| 风险 | 缓解 |
|------|------|
| `test:core` 与全量 CI 漂移 | 核心文件名单写进 package.json；CI 仍跑全量 |
| stop 钩子死循环 | `loop_limit: 3`；失败输出截断 |
| Windows 脚本 | 用 Node `.mjs`，`shell: true` 调 npm |
| 测网变大但结构仍乱 | 接受；重构已挂起 |

## 你怎么参与（不懂代码）

1. 确认本合并计划（已完成）  
2. Agent 在 **分支** 上执行；你看测试是否通过说明  
3. 清空搜索另一次：点 1～2 下即可  
4. 重构等你以后说「开始 Plan 2」再动  

---

## Spec 自检

- [x] 无 TBD 占位  
- [x] Plan 1 + Plan 3.1 合并；Plan 2 挂起；Plan 3 余部不做  
- [x] 钩子 = 核心子集；裁判 = GitHub  
- [x] 必须开分支；清空搜索另 PR  
- [x] 英文清单不影响测覆盖范围（已写明）
