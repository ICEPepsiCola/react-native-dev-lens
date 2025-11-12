# Dev Lens 架构说明

## 项目结构

````
dev-lens/
├── src/                    # 前端代码（React + Vite）
│   ├── components/         # React 组件
│   ├── pages/             # 页面组件
│   ├── utils/             # 工具函数
│   └── types/             # TypeScript 类型定义
├── src-tauri/             # Tauri 后端（Rust）
│   └── src/
│       └── lib.rs         # HTTP 服务器和事件处理
├── packages/              # Monorepo packages
│   └── sdk/               # React Native SDK
│       ├── index.js       # SDK 主文件
│       ├── index.d.ts     # TypeScript 类型定义
│       └── README.md      # SDK 文档
├── .github/               # GitHub Actions 工作流
└── docs/                  # 文档

## 产物说明

### 1. 桌面客户端（Dev Lens App）

**技术栈：**
- Tauri 2.0（Rust + WebView）
- React 19
- Vite 7
- TailwindCSS 4 + DaisyUI

**功能：**
- 接收来自 React Native 应用的网络请求和日志
- 实时显示和过滤数据
- 支持深色/浅色主题
- 支持中英文切换

**发布：**
- 平台：macOS、Windows、Linux
- 分发：GitHub Releases
- 版本：独立版本号（如 `client-v1.0.0`）

### 2. React Native SDK（dev-lens-sdk）

**技术栈：**
- Pure JavaScript（无需编译）
- React Native XHRInterceptor
- WebSocket 拦截

**功能：**
- 拦截网络请求（Fetch/XHR）
- 拦截 WebSocket 连接
- 拦截控制台日志
- 发送数据到桌面客户端

**发布：**
- 平台：NPM
- 分发：npm registry
- 版本：独立版本号（如 `sdk-v1.0.0`）

## 通信协议

### HTTP API

桌面客户端启动一个 HTTP 服务器监听 `http://127.0.0.1:9527`

**端点：**

1. `POST /api/network` - 接收网络请求日志
```json
{
  "id": "abc123",
  "method": "GET",
  "url": "https://api.example.com/users",
  "status": 200,
  "response_time": 123,
  "headers": {
    "request": {},
    "response": {}
  },
  "response": "...",
  "type": "Fetch/XHR"
}
````

2. `POST /api/console` - 接收控制台日志

```json
{
  "level": "info",
  "message": "Hello world"
}
```

3. `POST /api/websocket/:ws_id` - 接收 WebSocket 更新

```json
{
  "state": "open",
  "status": 101,
  "message": {
    "id": "msg1",
    "direction": "send",
    "data": "hello",
    "timestamp": 1234567890
  }
}
```

### Tauri Events

桌面客户端使用 Tauri 事件系统在 Rust 后端和前端之间通信：

- `network-log` - 网络请求事件
- `console-log` - 控制台日志事件
- `websocket-update` - WebSocket 更新事件

## 版本管理

### 独立版本策略

客户端和 SDK 使用独立的版本号，原因：

1. **不同的发布节奏**

   - SDK 可能需要更频繁的 bug 修复
   - 客户端功能更新相对较慢

2. **不同的用户群体**

   - SDK 用户：React Native 开发者
   - 客户端用户：所有使用 Dev Lens 的开发者

3. **向后兼容性**
   - SDK 新版本应该兼容旧版本客户端
   - 客户端新版本应该兼容旧版本 SDK

### Git Tag 规范

- 客户端：`client-v1.0.0`
- SDK：`sdk-v1.0.0`

### 兼容性矩阵

| SDK 版本 | 客户端版本 | 兼容性 |
| -------- | ---------- | ------ |
| 0.1.x    | 0.1.x      | ✅     |
| 0.2.x    | 0.1.x      | ✅     |
| 1.0.x    | 0.1.x      | ⚠️     |

## 开发工作流

### 本地开发

```bash
# 启动桌面客户端
pnpm tauri dev

# 在 React Native 项目中测试 SDK（使用 workspace）
cd your-rn-project
npm install ../dev-lens/packages/sdk

# 或者使用 pnpm link
cd dev-lens/packages/sdk
pnpm link --global
cd your-rn-project
pnpm link --global dev-lens-sdk
```

### 代码规范

- ESLint + @stylistic/eslint-plugin
- 保存时自动格式化
- Conventional Commits

### 发布流程

1. **开发** → 2. **测试** → 3. **Lint** → 4. **发布**

详见 [RELEASE_GUIDE.md](./RELEASE_GUIDE.md)

## 未来规划

### 客户端

- [ ] 支持更多过滤选项
- [ ] 导出日志功能
- [ ] 性能分析面板
- [ ] 自动更新功能

### SDK

- [ ] 支持更多平台（Web、Electron）
- [ ] 性能监控
- [ ] 崩溃报告
- [ ] 自定义插件系统

## 贡献指南

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 许可证

MIT License
