# 发布指南

Dev Lens 项目包含两个独立的发布产物：

1. **客户端（Desktop App）** - Tauri 桌面应用
2. **SDK（NPM Package）** - React Native SDK

## 前置要求

### 客户端发布

- 配置 GitHub Token：`export GITHUB_TOKEN=your_token`
- 确保 Tauri 构建环境已配置

### SDK 发布

- 登录 NPM：`npm login`
- 确保有 NPM 发布权限

## 发布流程

### 发布客户端

```bash
# 1. 确保代码已提交
git status

# 2. 运行 lint 检查
pnpm lint

# 3. 发布补丁版本（0.1.0 -> 0.1.1）
pnpm release:client

# 或发布次版本（0.1.0 -> 0.2.0）
pnpm release:client:minor

# 或发布主版本（0.1.0 -> 1.0.0）
pnpm release:client:major
```

**发布流程：**

1. 运行 lint 检查
2. 更新版本号
3. 生成 CHANGELOG
4. 构建 Tauri 应用（所有平台）
5. 创建 Git tag（格式：`client-v1.0.0`）
6. 推送到 GitHub
7. 创建 GitHub Release
8. 上传构建产物到 Release

### 发布 SDK

```bash
# 1. 确保代码已提交
git status

# 2. 发布补丁版本（0.1.0 -> 0.1.1）
pnpm release:sdk

# 或发布次版本（0.1.0 -> 0.2.0）
pnpm release:sdk:minor

# 或发布主版本（0.1.0 -> 1.0.0）
pnpm release:sdk:major
```

**发布流程：**

1. 运行 lint 检查
2. 更新版本号
3. 生成 CHANGELOG
4. 创建 Git tag（格式：`sdk-v1.0.0`）
5. 推送到 GitHub
6. 创建 GitHub Release
7. 发布到 NPM

## 版本管理策略

### 独立版本

- 客户端和 SDK 使用独立的版本号
- 可以独立发布，互不影响
- Tag 格式区分：`client-v1.0.0` 和 `sdk-v1.0.0`

### 语义化版本

遵循 [Semantic Versioning](https://semver.org/)：

- **MAJOR（主版本）**：不兼容的 API 变更
- **MINOR（次版本）**：向后兼容的功能新增
- **PATCH（补丁版本）**：向后兼容的问题修复

### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` - 新功能
- `fix:` - 修复 bug
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `refactor:` - 重构
- `perf:` - 性能优化
- `test:` - 测试相关
- `chore:` - 构建/工具相关

## 发布检查清单

### 客户端发布前

- [ ] 所有测试通过
- [ ] Lint 检查通过
- [ ] 更新 README（如有必要）
- [ ] 检查 Tauri 配置
- [ ] 本地构建测试

### SDK 发布前

- [ ] 所有测试通过
- [ ] Lint 检查通过
- [ ] 更新 README（如有必要）
- [ ] 更新类型定义
- [ ] 检查 package.json 的 files 字段

## 回滚

### 客户端

```bash
# 删除 GitHub Release
# 删除 Git tag
git tag -d client-v1.0.0
git push origin :refs/tags/client-v1.0.0
```

### SDK

```bash
# 废弃 NPM 版本
npm deprecate dev-lens-sdk@1.0.0 "This version has been deprecated"

# 删除 Git tag
git tag -d sdk-v1.0.0
git push origin :refs/tags/sdk-v1.0.0
```

## 自动化 CI/CD（可选）

可以使用 GitHub Actions 自动化发布流程：

```yaml
# .github/workflows/release-client.yml
name: Release Client
on:
  push:
    tags:
      - 'client-v*'

# .github/workflows/release-sdk.yml
name: Release SDK
on:
  push:
    tags:
      - 'sdk-v*'
```

## 常见问题

### Q: 如何同时发布客户端和 SDK？

A: 分别运行两个发布命令，它们会创建不同的 tag 和 release。

### Q: 版本号不同步会有问题吗？

A: 不会，它们是独立的产物，可以有不同的版本号。

### Q: 如何查看发布历史？

A: 查看 GitHub Releases 页面，或使用 `git tag -l` 查看所有 tag。

### Q: 构建失败怎么办？

A: 检查 Tauri 构建环境，查看错误日志，修复后重新发布。
