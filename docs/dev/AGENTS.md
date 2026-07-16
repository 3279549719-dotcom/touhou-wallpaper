# AGENTS.md — Touhou Wallpaper（短导航）

V1 已完成。新对话**先读 [PROGRESS.md](PROGRESS.md)**，再按任务打开下表，不要全文扫文档。

## 先读谁

| 想知道什么 | 打开 |
|------------|------|
| 当前状态 / 下一步 | [PROGRESS.md](PROGRESS.md)（必读） |
| 模块切分与验收脚本 | [ARCHITECTURE.md](ARCHITECTURE.md)、[VERIFY.md](VERIFY.md) |
| 需求与验收标准 | [PRD.md](../spec/PRD.md)（需求变了才改） |
| 技术选型与 API | [TECH_DESIGN.md](TECH_DESIGN.md)（选型变了才改） |
| 文案 / 配色 | [CONTENT.md](../spec/CONTENT.md) |
| 给人看的用法 | [README.md](../../README.md) |

## 文档更新纪律（防流于形式）

| 文件 | 何时改 |
|------|--------|
| **PROGRESS.md** | 有实质进展就改（功能、验收、阻塞、提交） |
| **README.md** | 用户怎么装/怎么用变了再改 |
| **AGENTS.md** | 本导航过时再改（少动） |
| **PRD / TECH_DESIGN / ARCHITECTURE** | 需求或技术决策变了再改，不当日记 |

纯问答、零改动 → 可不改任何文档。

## 硬约束（仍有效）

- 代码与注释：English only；UI 文案来自 CONTENT.md
- 壁纸与文件 IO 在 **Rust**（`src-tauri/`），前端不直接改系统壁纸
- 仅 **应用** 可调用 `set_wallpaper`；换一张 / 滚轮 / 缩略图不行
- 勿提交 `assets/images/`；无支付、登录、云、纯热链加载图
- 改完跑 `npm run check`（或对应 `verify:mN`）直到 Assertion Passed

## 常用命令

```bash
npm install
npm run check
npm run tauri:dev
npm run tauri:build          # → dist/release/东方壁纸_Setup.exe
npm run download:assets      # 仅开发机；分享版用应用内首次下载
```

## 模块地图（历史，均已 [x]）

M0 脚手架 → M1 下载脚本 → M2 路径/manifest → M3 壁纸 → M4 收藏 → M5 侧栏 → M6 预览 → M7 ActionBar → M8 PRD → M9 安装包/首次下载。细节见 [ARCHITECTURE.md](ARCHITECTURE.md)。
