# 分享给朋友 — 使用说明

## 你发给对方什么

只需发送一个文件：

**`dist/release/东方壁纸_Setup.exe`**

（由 `npm run tauri:build` 生成，需先在本机装好 Rust 和 Visual Studio C++ 生成工具）

## 对方怎么用（验收标准）

1. 双击 **`东方壁纸_Setup.exe`** 安装（无需 Python、无需手动配置）
2. 安装程序会自动处理运行环境（含 WebView2，如系统没有会引导安装）
3. 打开「东方演舞壁纸」
4. 看到欢迎页，点击 **「开始下载」**
5. 保持联网，等待进度条到 100%（约 591 张立绘，几分钟）
6. 下载完成后自动进入主界面，可正常选角色、预览、应用、收藏

## 注意事项

- **个人使用**：请勿将下载的立绘图包当作公共素材再分发
- **图片来源**：thpdp.ver.moe · 幻想人形演舞
- **离线使用**：首次下载完成后，之后可离线使用
- **系统**：Windows 10 / 11

## 开发者打包命令

```bash
npm install
npm run icon:generate
npm run tauri:build
```

产出：`dist/release/东方壁纸_Setup.exe`

若编译报错 `link.exe not found`，请安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) 并勾选「使用 C++ 的桌面开发」。
