# Release Guide

## 使用 release-it 发布新版本

### 前置要求

1. 确保你有 GitHub 的访问权限
2. 设置 GitHub Personal Access Token:
   ```bash
   export GITHUB_TOKEN="your_github_token"
   ```

### 发布命令

#### Patch 版本 (0.1.0 -> 0.1.1)
```bash
pnpm release
```

#### Minor 版本 (0.1.0 -> 0.2.0)
```bash
pnpm release:minor
```

#### Major 版本 (0.1.0 -> 1.0.0)
```bash
pnpm release:major
```

### 发布流程

1. **自动执行的步骤：**
   - 运行测试（如果有）
   - 更新版本号
   - 生成 CHANGELOG.md
   - 构建 Tauri 应用（`pnpm tauri build`）
   - 创建 Git commit 和 tag
   - 推送到 GitHub
   - 创建 GitHub Release

2. **手动步骤：**
   - 将构建好的应用上传到 GitHub Release
   - 应用文件位置：
     - macOS: `src-tauri/target/release/bundle/dmg/`
     - Windows: `src-tauri/target/release/bundle/msi/`
     - Linux: `src-tauri/target/release/bundle/appimage/`

### 配置说明

配置文件：`.release-it.json`

- `git.commitMessage`: Commit 消息格式
- `git.tagName`: Tag 名称格式
- `github.release`: 自动创建 GitHub Release
- `npm.publish`: 不发布到 npm（设为 false）
- `hooks.after:bump`: 版本号更新后自动构建应用

### 注意事项

1. 确保在 `main` 分支上发布
2. 发布前确保所有改动已提交
3. 首次使用需要配置 GitHub Token
4. 构建过程可能需要几分钟时间

### Conventional Commits

使用标准的 commit 格式，自动生成 CHANGELOG：

- `feat:` - 新功能
- `fix:` - Bug 修复
- `docs:` - 文档更新
- `style:` - 代码格式
- `refactor:` - 重构
- `perf:` - 性能优化
- `test:` - 测试
- `chore:` - 构建/工具

示例：
```bash
git commit -m "feat: 添加网络请求过滤功能"
git commit -m "fix: 修复请求头显示问题"
```
