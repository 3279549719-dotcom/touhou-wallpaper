# 🎯 东方壁纸重构计划

## 项目概述

本重构计划分为 **4 个阶段**，通过逐步分层来提高项目的可维护性和可扩展性。

---

## 📊 4 个重构阶段

### 🟢 **阶段 1：重组文件结构和文档** 
**预计时间**：1-2 天  
**分支**：`refactor/stage1-structure`

#### 具体改动
1. **创建 docs/ 目录结构**
   ```
   docs/
   ├── dev/                    # 开发者文档
   │   ├── architecture.md     # （从根目录迁移）
   │   ├── tech-design.md      # （从根目录迁移）
   │   └── module-checklist.md # 模块验收清单
   ├── guide/                  # 用户指南
   │   ├── usage.md            # 使用说明
   │   └── troubleshoot.md     # 故障排除
   └── spec/                   # 功能规格
       └── prd.md              # （从根目录迁移）
   ```

2. **重组 scripts/ 目录**
   ```
   scripts/
   ├── build/                  # 构建相关
   │   ├── generate_icon.py
   │   ├── rename_installer.py
   │   └── kill_dev_port.py
   ├── verify/                 # 验收脚本
   │   ├── verify_m0.py
   │   ├── verify_m1.py
   │   ├── verify_m2.py
   │   ├── verify_m3.py
   │   ├── verify_m4.py
   │   ├── verify_m5.py
   │   ├── verify_m6.py
   │   ├── verify_m7.py
   │   ├── verify_m8.py
   │   ├── verify_m9.py
   │   └── verify_favorites_gallery.py
   └── tools/                  # 工具脚本
       ├── download_assets.py
       ├── wallpaper_service.py
       └── apply_wallpaper.py
   ```

3. **重组 openspec/ 目录**
   ```
   openspec/
   ├── active/                 # 当前活跃功能规格
   │   └── specs/
   │       └── favorites-gallery/
   ├── archived/               # 已完成或弃用的规格
   │   └── 2026-07-14-favorites-only-view/
   └── README.md               # OpenSpec 流程说明
   ```

4. **更新根目录文档**
   - 保留 README.md（更新链接指向 docs/）
   - 保留 PROGRESS.md（当前进展）
   - 删除已迁移的文档

#### 验收标准
- [ ] docs/ 目录结构创建完成
- [ ] 所有文档正确迁移到 docs/
- [ ] scripts/ 按功能分类
- [ ] openspec/ 按状态分类
- [ ] README.md 和根目录文档更新
- [ ] npm run check 通过
- [ ] npm run dev 正常工作

#### 预期改动
- 新增 7 个目录
- 移动 15+ 个文件
- 删除 0 个文件
- 修改 2-3 个文件

---

### 🟡 **阶段 2：前端组件分层和 services 层**
**预计时间**：3-5 天  
**分支**：`refactor/stage2-frontend`

#### 具体改动
1. **重新组织 components/ 目录**
   ```
   src/components/
   ├── layout/                 # 布局容器
   │   └── AppShell.tsx
   ├── panels/                 # 面板组件
   │   ├── CurrentWallpaperPanel.tsx
   │   ├── PreviewPane.tsx
   │   └── VariantStrip.tsx
   ├── sidebars/               # 侧栏组件
   │   ├── CharacterSidebar.tsx
   │   └── FavoritesGallerySidebar.tsx
   ├── nav/                    # 导航组件
   │   ├── CharacterNav.tsx
   │   └── ActionBar.tsx
   └── common/                 # 通用组件
       ├── AssetImage.tsx
       ├── DownloadScreen.tsx
       ├── EmptyAssetsBanner.tsx
       └── LoadingSpinner.tsx  # 新增
   ```

2. **创建 services/ 业务逻辑层**
   ```
   src/lib/services/
   ├── wallpaper.ts            # 壁纸相关（get/set 操作）
   ├── favorites.ts            # 收藏管理
   ├── assets.ts               # 资源管理（manifest、下载等）
   └── index.ts                # 统一导出
   ```

3. **提取 utils/ 工具函数**
   ```
   src/lib/utils/
   ├── grid.ts                 # 网格、位置计算
   ├── imageUrl.ts             # 图片 URL 生成
   ├── strings.ts              # 字符串常量
   └── index.ts                # 统一导出
   ```

4. **重构 useWallpaperApp hook**
   - 职责改为"组织状态和调度"
   - 业务逻辑调用 services/ 中的函数
   - 状态管理可选用 Zustand

#### 验收标准
- [ ] components/ 按功能分类
- [ ] services/ 层创建并实现
- [ ] utils/ 层创建并迁移
- [ ] useWallpaperApp 简化
- [ ] 所有导入路径正确
- [ ] npm run check 通过
- [ ] npm run dev 功能正常
- [ ] 所有功能（收藏、换图、应用）正常工作

#### 预期改动
- 移动 11 个组件文件
- 创建 3-4 个新 services 文件
- 创建 3-4 个新 utils 文件
- 修改 1 个 hook 文件
- 更新 15+ 个导入语句

---

### 🟠 **阶段 3：后端 Rust 代码分层**
**预计时间**：2-3 天  
**分支**：`refactor/stage3-backend`

#### 具体改动
1. **保持 commands/ 目录（接口层）**
   ```
   src-tauri/src/commands/
   ├── mod.rs
   ├── assets.rs
   ├── download.rs
   ├── favorites.rs
   └── wallpaper.rs
   ```

2. **创建 services/ 目录（业务逻辑层）**
   ```
   src-tauri/src/services/
   ├── mod.rs
   ├── manifest.rs             # manifest 管理
   ├── registry.rs             # Windows 注册表操作
   ├── http.rs                 # HTTP 请求封装
   └── favorites_storage.rs    # 收藏数据持久化
   ```

3. **创建 models/ 目录（数据模型层）**
   ```
   src-tauri/src/models/
   ├── mod.rs
   ├── types.rs                # 共享数据类型定义
   └── errors.rs               # 错误类型定义
   ```

#### 架构关系
```
commands/ (接收请求) → services/ (业务逻辑) → models/ (数据和错误)
```

#### 验收标准
- [ ] services/ 目录创建
- [ ] 业务逻辑从 commands/ 提取到 services/
- [ ] models/ 目录创建并定义数据类型
- [ ] 错误处理集中化
- [ ] 所有 Tauri 命令正常工作
- [ ] npm run tauri:dev 正常运行
- [ ] npm run tauri:build 成功编译

#### 预期改动
- 创建 5-6 个新 Rust 模块文件
- 重构 5 个 commands 文件
- 创建 1 个 errors.rs
- 更新 Cargo.toml（如需新依赖）

---

### 🔴 **阶段 4：测试框架和 GitHub Actions CI/CD**
**预计时间**：3-5 天  
**分支**：`refactor/stage4-testing`

#### 具体改动
1. **添加 Vitest 测试框架**
   ```
   tests/
   └── unit/
       ├── favorites.test.ts
       ├── imageUrl.test.ts
       └── grid.test.ts

   src/__tests__/
   └── services/
       ├── wallpaper.test.ts
       ├── favorites.test.ts
       └── assets.test.ts
   ```

2. **配置 GitHub Actions 工作流**
   ```
   .github/workflows/
   ├── test.yml                # 运行 npm run check + 单元测试
   ├── build.yml               # 构建 exe 安装包
   └── release.yml             # 自动发布到 GitHub Releases
   ```

3. **更新 package.json 脚本**
   ```json
   "test": "vitest",
   "test:ui": "vitest --ui",
   "test:coverage": "vitest --coverage",
   "ci": "npm run check && npm run test"
   ```

4. **增强验收机制**
   - verify_m*.py 逐步退役
   - 核心检查转为 Vitest 测试
   - 保留宏观验收脚本（可选）

#### 验收标准
- [ ] Vitest 框架配置完成
- [ ] 编写 10-15 个单元测试
- [ ] 测试覆盖率 > 70%
- [ ] GitHub Actions 三个工作流配置完成
- [ ] npm test 通过所有测试
- [ ] npm run ci 完整检查通过
- [ ] git push 后自动触发 CI，构建成功

#### 预期改动
- 新增 5 个测试文件
- 新增 3 个 GitHub Actions workflow 文件
- 更新 package.json（添加 test 依赖和脚本）
- 更新 .gitignore（忽略测试覆盖率报告）
- 创建 .github/workflows/ 目录

---

## 🔄 工作流程

### 每个阶段的流程

1. **我创建分支** → `refactor/stage-X`
2. **我在分支上改代码** → 5-10 个清晰的 commit
3. **我 push 到 GitHub** → GitHub Actions 自动检查
4. **我创建 Pull Request** → 在这个对话里通知你链接
5. **你审核 PR** → 在 GitHub 上点击文件变更检查
6. **你批准 PR** → 点 "Approve"
7. **我 merge** → 自动合并到 master
8. **准备下一阶段** → 重复上面的流程

### GitHub Projects 看板状态

```
TODO （待做）
  ├─ 阶段 1 文件结构 ← 现在
  ├─ 阶段 2 前端分层
  ├─ 阶段 3 后端分层
  └─ 阶段 4 测试 + CI

IN PROGRESS （进行中）
  └─ 当前做的阶段

IN REVIEW （审核中）
  └─ 等待你批准的 PR

DONE （完成）
  └─ 已 merge 的阶段
```

---

## 📅 总时间估算

| 阶段 | 预计时间 | 累计时间 |
|------|---------|---------|
| 1 | 1-2 天 | 1-2 天 |
| 2 | 3-5 天 | 4-7 天 |
| 3 | 2-3 天 | 6-10 天 |
| 4 | 3-5 天 | 9-15 天 |

**总计**：9-15 天（2-3 周）

---

## ✅ 技术栈决策总结

| 项 | 决定 | 原因 |
|---|------|------|
| 文档组织 | 创建 docs/ 分类 | 提高新手入门体验 |
| 前端分层 | components/services/utils | 提高可测试性和复用性 |
| 状态管理 | 添加 Zustand | 更清晰的状态流 |
| 测试 | 添加 Vitest | 自动化验证代码质量 |
| CI/CD | 添加 GitHub Actions | 自动化构建和发布 |
| 分支策略 | 一个分支一个阶段 | 清晰的进度追踪 |

---

## 🎯 关键里程碑

- ✅ **阶段 1 完成** → 项目结构更清晰，文档更易找
- ✅ **阶段 2 完成** → 前端代码更模块化，更易测试
- ✅ **阶段 3 完成** → 后端代码更清晰，易于扩展
- ✅ **阶段 4 完成** → 自动化测试和发布，项目成熟度提升

---

## 📞 问题反馈

如果任何阶段有问题或需要调整，直接在这个对话里告诉我，我会：
1. 解释为什么这样做
2. 提供替代方案
3. 及时修改 commit 和 PR

---

**现在准备开始阶段 1！** 🚀
