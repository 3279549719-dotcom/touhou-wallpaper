# Touhou Wallpaper（东方演舞壁纸）

个人用 Windows 桌面壁纸工具：幻想人形演舞立绘（角色 001–131）。

**当前状态：V1 已完成，本机自测通过。** 进展见 [PROGRESS.md](PROGRESS.md)。

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

## 文档怎么读（省时间）

| 想知道什么 | 看哪个 | 何时改 |
|------------|--------|--------|
| 现在做到哪、下一步 | [PROGRESS.md](PROGRESS.md) | **每次有进展必改** |
| 模块切分 / 验收脚本 | [ARCHITECTURE.md](ARCHITECTURE.md)、[VERIFY.md](VERIFY.md) | 模块增减时 |
| Agent 导航（短） | [AGENTS.md](AGENTS.md) | 命令/模块地图变了再改 |
| 需求与验收标准 | [PRD.md](PRD.md) | **需求变了才改** |
| 技术选型与 API | [TECH_DESIGN.md](TECH_DESIGN.md) | **选型/接口变了才改** |
| 文案与配色 | [CONTENT.md](CONTENT.md) | UI 文案变了再改 |

新开对话：先读 **PROGRESS.md**，再按任务打开上表对应文件即可，不必全文扫一遍。
