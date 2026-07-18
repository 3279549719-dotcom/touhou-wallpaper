# Touhou Wallpaper（东方演舞壁纸）

个人用 Windows 桌面壁纸工具：幻想人形演舞立绘（角色 001–131）。

**当前状态：V1 已完成，本机自测通过。** 进展见 [docs/dev/PROGRESS.md](docs/dev/PROGRESS.md)。

## 发给别人怎么用

1. 把 `dist/release/东方壁纸_Setup.exe`（约 1.9MB）发给对方  
2. 双击安装（开始菜单名：**东方壁纸**；窗口标题：东方演舞壁纸）  
3. 首次打开点「开始下载」，下完即可浏览、收藏、点【应用】换壁纸  

图不进安装包，装好后下载到对方电脑的 `%APPDATA%/touhou-wallpaper/assets/`。

**仅限个人使用。** 请勿二次分发立绘图包。来源：[thpdp.ver.moe](https://thpdp.ver.moe/) · 幻想人形演舞。

## 本机重新打包

```bash
npm install
npm run tauri:build
```

产出：`dist/release/东方壁纸_Setup.exe`（需已装 [Rust](https://rustup.rs)）。

## 开发者命令

```bash
npm install
npm run dev              # 仅浏览器 UI（无壁纸能力）；地址 http://localhost:1420/
npm run dev:autostart:on # 开机登录后自动启动上面的本地 UI（任务计划）
npm run dev:autostart:off# 取消开机自动启动
npm run check            # tsc + verify_m0
npm run tauri:dev        # 完整桌面应用
npm run download:assets  # 开发用：下载到仓库 assets/（分享版不依赖此步）
```

开机自动启动后，登录进 Windows 等十几秒，浏览器打开 `http://localhost:1420/` 即可。日志在 `logs/dev-autostart.log`。这只是网页预览，换壁纸请用 `tauri:dev` 或安装包。

## 文件夹地图

| 路径 | 放什么 |
|------|--------|
| `docs/dev/` | 开发导航、进展、架构、验收 |
| `docs/spec/` | 需求与文案（PRD、CONTENT） |
| `docs/guide/` | 给人看的分享说明 |
| `scripts/build/` | 下载、图标、安装包改名、自启等 |
| `scripts/verify/` | 模块验收脚本 |
| `src/components/` | UI（即将分 panels / sidebars） |
| `src/lib/` | 纯函数助手 |
| `src/services/` | Tauri/API 编排（脚手架） |
| `src/stores/` | Zustand 状态（脚手架） |
| `openspec/` | 规格变更；见 [openspec/README.md](openspec/README.md) |

## 文档怎么读（省时间）

| 想知道什么 | 看哪个 | 何时改 |
|------------|--------|--------|
| 现在做到哪、下一步 | [docs/dev/PROGRESS.md](docs/dev/PROGRESS.md) | **每次有进展必改** |
| 模块切分 / 验收脚本 | [ARCHITECTURE](docs/dev/ARCHITECTURE.md)、[VERIFY](docs/dev/VERIFY.md) | 模块增减时 |
| Agent 导航（短） | [docs/dev/AGENTS.md](docs/dev/AGENTS.md) | 命令/模块地图变了再改 |
| 需求与验收标准 | [docs/spec/PRD.md](docs/spec/PRD.md) | **需求变了才改** |
| 技术选型与 API | [docs/dev/TECH_DESIGN.md](docs/dev/TECH_DESIGN.md) | **选型/接口变了才改** |
| 文案与配色 | [docs/spec/CONTENT.md](docs/spec/CONTENT.md) | UI 文案变了再改 |

新开对话：先读 **docs/dev/PROGRESS.md**（根目录有 stub 指向它），再按任务打开上表即可。

Autofix validated green path.


Autofix validated green path (round 2).

