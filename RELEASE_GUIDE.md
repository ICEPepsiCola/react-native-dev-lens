# 发布指南

Dev Lens 使用**统一版本号**，一次发布同时包含桌面客户端和 SDK。

## 📦 统一版本策略

- 客户端和 SDK 使用**相同的版本号**
- 一次发布命令同时发布两个产物
- 版本号自动同步

## 🚀 发布流程

### 本地发布

```bash
# 1. 确保代码已提交
git status

# 2. 运行 lint 检查
pnpm lint

# 3. 发布补丁版本（0.1.0 -> 0.1.1）
pnpm release

# 或发布次版本（0.1.0 -> 0.2.0）
pnpm release:minor

# 或发布主版本（0.1.0 -> 1.0.0）
pnpm release:major
```

### 发布步骤

执行 `pnpm release` 后会自动：

1. ✅ 运行 lint 检查
2. ✅ 更新根目录版本号
3. ✅ 同步 SDK 版本号
4. ✅ 生成 CHANGELOG
5. ✅ 构建 Tauri 应用
6. ✅ 创建 Git tag（格式：`v1.0.0`）
7. ✅ 推送到 GitHub
8. ✅ 发布 SDK 到 NPM
9. ✅ 创建 GitHub Release

### CI/CD 自动发布

推送 tag 后，GitHub Actions 会自动：

1. 发布 SDK 到 NPM
2. 构建所有平台的客户端（macOS、Windows、Linux）
3. 上传构建产物到 GitHub Release

```bash
# 手动触发 CI/CD
git push origin v1.0.0
```

## 📋 版本管理

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

## ✅ 发布检查清单

### 发布前

- [ ] 所有测试通过
- [ ] Lint 检查通过
- [ ] 更新 README（如有必要）
- [ ] 检查 Tauri 配置
- [ ] 本地构建测试
- [ ] 确认 NPM 登录状态

### 发布后

- [ ] 验证 NPM 包已发布
- [ ] 验证 GitHub Release 已创建
- [ ] 测试安装 SDK：`npm install @react-native-dev-lens/sdk`
- [ ] 测试下载客户端安装包

## 🔧 配置要求

### NPM 发布

```bash
# 登录 NPM
npm login

# 创建组织（首次）
# 访问 https://www.npmjs.com/org/create
# 创建组织：@react-native-dev-lens
```

### GitHub Token

在 GitHub 仓库设置中添加 Secrets：

- `NPM_TOKEN` - NPM 发布 token
- `GITHUB_TOKEN` - 自动提供，无需配置

## 🔄 回滚

### 回滚 NPM 包

```bash
# 废弃版本
npm deprecate @react-native-dev-lens/sdk@1.0.0 "This version has been deprecated"
```

### 回滚 GitHub Release

1. 在 GitHub Releases 页面删除 Release
2. 删除 Git tag：

```bash
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

## 📊 发布历史

查看所有发布：

```bash
# 查看所有 tags
git tag -l

# 查看 NPM 包版本
npm view @react-native-dev-lens/sdk versions

# 查看 GitHub Releases
# https://github.com/yourusername/dev-lens/releases
```

## 🐛 常见问题

### Q: 为什么要统一版本号？

A: 因为客户端和 SDK 是配套使用的，统一版本号可以：

- 避免版本不匹配的问题
- 简化发布流程
- 用户更容易理解版本对应关系

### Q: 如何只更新 SDK 不构建客户端？

A: 不建议这样做。如果确实需要，可以手动发布：

```bash
cd packages/sdk
npm version patch
npm publish
```

### Q: 构建失败怎么办？

A:

1. 检查 Tauri 构建环境
2. 查看 GitHub Actions 日志
3. 本地测试：`pnpm tauri build`
4. 修复后重新发布

### Q: NPM 发布失败？

A:

1. 检查是否登录：`npm whoami`
2. 检查组织权限
3. 检查包名是否已存在
4. 确认 `publishConfig.access: "public"`
