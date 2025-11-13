# Dev Lens

<div align="center">
  <img src="https://raw.githubusercontent.com/ICEPepsiCola/react-native-dev-lens/main/public/logo.svg" width="120" height="120" alt="Dev Lens Logo">
  <p><strong>优雅的开发者网络监控工具</strong></p>
  <p>实时监控网络请求和控制台日志，支持深色/浅色主题</p>
  <p>
    <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
  </p>
</div>

## ✨ 特性

- 🌐 **网络监控** - 实时捕获 HTTP 请求和 WebSocket 连接
- 📊 **详细信息** - 查看请求/响应头、响应体、CORS 状态等
- 🎨 **主题切换** - 支持深色/浅色模式，界面美观现代
- 🌍 **国际化** - 支持中文/英文切换
- 🔍 **智能过滤** - 按 URL、请求类型过滤
- 💻 **控制台日志** - 捕获和展示应用日志（info/warn/error）

## 🚀 快速开始

### 给用户（React Native 开发者）

1. **下载 Dev Lens 应用**

   从 [GitHub Releases](https://github.com/ICEPepsiCola/react-native-dev-lens/releases) 下载最新版本

   > **macOS 用户注意**: 如果遇到"应用已损坏"错误，在终端运行：
   >
   > ```bash
   > xattr -cr /Applications/dev-lens.app
   > ```

2. **在你的 React Native 项目中安装 SDK**

   ```bash
   npm install dev-lens-sdk
   # 或
   yarn add dev-lens-sdk
   # 或
   pnpm add dev-lens-sdk
   ```

3. **在应用入口添加一行代码**（例如 `index.js` 或 `App.js`）

   ```javascript
   import DevLens from "react-native-dev-lens";

   // 就这一行！启用监控
   new DevLens().init();
   ```

4. **打开 Dev Lens 应用**

   启动 Dev Lens 桌面应用，你就能实时看到所有网络请求和控制台日志了！

### 配置（可选）

```javascript
import DevLens from "react-native-dev-lens";

// 仅在开发模式启用
if (__DEV__) {
  new DevLens().init();
}
```

## 📦 包含内容

- **Dev Lens 应用** - 桌面应用程序（macOS/Windows/Linux）
- **react-native-dev-lens** - NPM 包，方便集成

## 🛠️ 给贡献者

### 前置要求

- Node.js 18+
- Rust 1.70+
- pnpm

### 开发

```bash
# 安装依赖
pnpm install

# 开发模式运行
pnpm tauri dev

# 生产构建
pnpm tauri build
```

### 项目结构

```
dev-lens/
├── src/                    # 前端源码
│   ├── App.tsx            # 主应用组件
│   ├── i18n.ts            # 国际化配置
│   └── assets/            # 静态资源
├── src-tauri/             # Tauri 后端
│   ├── src/
│   │   └── lib.rs         # Rust 后端（包含 HTTP 服务器）
│   └── icons/             # 应用图标
├── sdk/                   # 集成 SDK
│   └── react-native-dev-lens/      # NPM 包
└── public/                # 公共资源
```

## 🔧 技术栈

- **前端**: React 19 + TypeScript
- **桌面框架**: Tauri 2.0
- **UI 组件**: DaisyUI + Tailwind CSS
- **后端**: Rust + Axum（HTTP 服务器，端口 9527）
- **国际化**: i18next + react-i18next
- **构建工具**: Vite

## 📡 工作原理

1. Dev Lens 应用启动一个 HTTP 服务器在 `http://127.0.0.1:9527`
2. SDK 使用 React Native 官方的 `XHRInterceptor` 捕获网络请求
3. SDK 拦截控制台日志（log、warn、error、info）
4. SDK 通过 HTTP POST 请求将数据发送到 Dev Lens
5. Dev Lens 实时展示数据，界面美观

**注意：** 真机调试时，需要使用电脑的 IP 地址而不是 `127.0.0.1`

## 🎯 使用场景

- 开发时调试网络请求
- 查看 API 响应数据和头信息
- 追踪 WebSocket 连接
- 监控应用日志输出
- 检查 CORS 配置
- 查看请求/响应时间

## 📝 API 端点

Dev Lens 暴露以下 HTTP 端点：

- `POST http://127.0.0.1:9527/api/network` - 接收网络日志
- `POST http://127.0.0.1:9527/api/console` - 接收控制台日志

## 🌟 为什么选择 Dev Lens？

- **零配置** - 只需一行代码即可集成
- **无侵入** - 不影响应用性能
- **界面美观** - 现代化设计，支持深色/浅色主题
- **跨平台** - 支持 macOS、Windows 和 Linux
- **开源免费** - MIT 协议

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 🔗 链接

- [GitHub 仓库](https://github.com/ICEPepsiCola/react-native-dev-lens)
- [问题追踪](https://github.com/ICEPepsiCola/react-native-dev-lens/issues)
- [发布版本](https://github.com/ICEPepsiCola/react-native-dev-lens/releases)

---

<div align="center">
  Made with ❤️ by Dev Lens Team
</div>
