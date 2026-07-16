# ⚠️ 踩坑笔记 — touhou-wallpaper 项目维护经验

> 写于 2026-07-16 四阶段重构过程中。以后改这个项目先看这里，少走弯路。

---

## 1. Git 相关

### GitHub 连接间歇性失败

- **现象：** `git push` 报 `Recv failure: Connection was reset` 或 `Failed to connect to github.com:443`
- **原因：** 国内网络到 GitHub 不稳定，尤其在下午时段
- **解法：**
  - 重试几次通常能过（有时需等几分钟）
  - `git -c http.version=HTTP/1.1 push` 有时比默认 HTTP/2 更稳定
  - 实在不行等网络恢复再推

### wincredman 警告（不影响功能）

- **现象：** 每次 push 都打印 `fatal: Unable to persist credentials with the 'wincredman' credential store`
- **原因：** 系统级 Git 配置了 `credential.helper=manager`，和全局 `store` 冲突
- **影响：** **无**。push 每次都能成功，仅控制台输出警告
- **解法（可选）：** `git config --local credential.helper store`（项目级覆盖系统级）

### 关于 Git token 权限

- `touhou-wallpaper` 仓库使用 HTTPS + Personal Access Token 认证
- 已有 token 存于 `~/.git-credentials`，权限包含 `repo`（读写 + PR）
- 如需新建 token：Settings → Developer settings → Personal access tokens → Classic → 勾选 `repo`

---

## 2. npm / 依赖相关

### npm install 可能因 node_modules 残留失败

- **现象：** `npm install -D vitest` 报 `ENOTEMPTY: directory not empty, rmdir`
- **解法：** 手动删除 `node_modules/@vitest` 再重试，或者 `npm ci` 做干净安装

### package-lock.json 和 package.json 不一致

- **现象：** 本地测试通过，CI 上 `npm ci` 找不到 vitest
- **原因：** 只从别的分支 copy 了 `package-lock.json` 但 `package.json` 的 `devDependencies` 漏了 vitest
- **教训：** 跨分支搬依赖时，**两个文件必须一起搬**，不能只搬 lock 文件

### 项目依赖清单（CI 必需）

CI 工作流 `.github/workflows/test.yml` 需要以下依赖：
```json
"devDependencies": {
  "vitest": "^4.1.10",
  "jsdom": "^29.1.1",
  "@testing-library/jest-dom": "^6.9.1",
  "typescript": "~5.8.3",
  "vite": "^7.0.4",
  "@vitejs/plugin-react": "^4.6.0"
}
```
少了任何一个，`npm ci` + `npm test` 都会挂。

---

## 3. CI/CD (GitHub Actions)

### test.yml 的 Python 依赖

- CI 需要 Python 3.12 + `scripts/verify/verify_m0.py`
- **该项目不需要 `pip install`**（验证脚本无外部 Python 依赖），但如果以后加了，记得在 CI 里加 `pip install -r requirements.txt`

### workflow 文件名决定触发方式

- `test.yml` → push/PR 都触发
- `build.yml` → 由 `test.yml` 成功后触发（`workflow_run`）
- `release.yml` → 仅 tag `v*` 触发

### Branch Protection 需要手动设置

- CI 工作流文件本身不会锁 Merge 按钮
- 必须在仓库 Settings → Branches → Add rule → 勾选 "Require status checks"

---

## 4. Rust / Tauri 相关

### cargo check 编译速度

- 首次 `cargo check` 需下载 Rust 依赖，可能 2-5 分钟
- 后续增量编译 < 40 秒

### Windows-only 代码需要 cfg 守卫

- `registry.rs` 和 `wallpaper.rs` 中 `use windows::Win32::*` 必须在 `#[cfg(target_os = "windows")]` 下
- `mod registry` 声明也要加 `#[cfg(target_os = "windows")]`

---

## 5. 项目结构约定

### 文件分层规则

```
src/
├── components/{layout,nav,panels,sidebars,common}  ← UI 渲染
├── services/{wallpaper,favorites,assets}.ts         ← 业务逻辑层
├── hooks/                                            ← 状态调度
├── lib/{favorites,grid,imageUrl,strings,tauri}.ts    ← 纯函数工具
├── __tests__/                                        ← 单元测试
└── types/                                            ← TypeScript 类型

tests/unit/                                           ← 集成测试

src-tauri/src/
├── commands/         ← Tauri 命令入口（薄层）
├── services/         ← Rust 业务逻辑
└── models/           ← 数据结构定义
```

### 测试组织原则

- 纯函数 → `src/__tests__/`（和源码同层，快）
- 含 mock/browser API → `tests/unit/`（需要 jsdom 环境）

---

## 6. 开发工作流

### 标准分支流程

```
master (已发布主线)
  └── refactor/stage-N / feature/xxx → PR → 审批 → Merge → 删分支
```

### Merge 后记得

1. `git fetch origin && git checkout master && git pull`
2. 更新 `PROGRESS.md` 勾选对应阶段
3. 删除本地已 merge 的分支（`git branch -d xxx`）

---

## 7. 已知问题

| 问题 | 状态 |
|------|------|
| Windows GCM credential 冲突警告 | 不影响功能，不修 |
| GitHub 网络间歇性断开 | 重试解决 |
| `npm run tauri:build` 需要 Visual Studio Build Tools | 开发机已有，CI 上暂不做 Tauri 构建 |

---

_最后更新：2026-07-16 | 随项目持续补充_
