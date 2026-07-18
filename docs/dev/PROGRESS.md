# PROGRESS.md — 项目进展

> Doc schema: v1 · 最后更新：2026-07-18

## 一句话状态

**#17 已合入（去掉旧 Test）；绿 #18 / 红 #19 复验已开，等 Actions。**

---

## Current（当前快照）

| 字段 | 值 |
|------|-----|
| 阶段 | **Stage 2 harden · 绿/红复验中** |
| 分支 | `master` @ `e50d363`（#17 已合） |
| 绿验证 | [#18](https://github.com/3279549719-dotcom/touhou-wallpaper/pull/18) |
| 红验证 | [#19](https://github.com/3279549719-dotcom/touhou-wallpaper/pull/19) |
| 阻塞 | 等 #18 / #19 Actions；通过后做清空搜索 |

---

## 模块进度

| 模块 | 状态 |
|------|------|
| 角色搜索 | [x] |
| Cursor Agent 审查 Stage 1 | [x]（手动） |
| Stage 2 红测自动修（N=3） | [x] |
| Stage 2 CI harden（无日志污染 / 只留 Autofix） | [x]（#17） |
| 清空搜索 | [ ] |

---

## Recent changes

- 2026-07-18：开绿 #18 / 红 #19 复验 PR
- 2026-07-18：#17 合入（删 test.yml；Autofix job id=`test`）
- 2026-07-18：Stage 2 autofix MVP 合入并验证

---

## Next

```
看 #18：Autofix 绿 + skip CLI；Required test 成功。
看 #19：自动修 ≤3；bot 提交里无临时日志文件。
两边 OK 后：开 feature/clear-search。
```
