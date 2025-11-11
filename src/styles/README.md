# 样式系统说明

## Emoji 系统

项目使用 [@emoji-mart/react](https://github.com/missive/emoji-mart) 来统一渲染 emoji，确保跨平台显示一致。

### Emoji 组件

```tsx
import { Emoji } from '@/components/Emoji';

<Emoji emoji="🌙" size={18} />
<Emoji emoji="📋" size={16} className="opacity-70" />
```

### 已使用的 Emoji
- 🌙 / ☀️: 主题切换
- 🗑️: 清空按钮
- 📋: 复制按钮
- ▲ / ▼: 展开/折叠

### 特点
- 使用系统原生 emoji 字体，在各平台显示一致
- 支持自定义大小和样式
- 轻量级，无需额外图标资源

## 颜色变量

在 `src/App.css` 中定义了以下颜色变量：

### 状态颜色
- `--color-success`: 成功状态 (#10b981)
- `--color-error`: 错误状态 (#ef4444)
- `--color-warning`: 警告状态 (#f59e0b)
- `--color-info`: 信息状态 (#3b82f6)

## 工具类

### Toast 样式
- `.toast-success`: 成功提示样式
- `.toast-error`: 错误提示样式
- `.toast-warning`: 警告提示样式
- `.toast-info`: 信息提示样式

### 日志背景色
- `.log-error-bg`: 错误日志背景（浅色/深色自适应）
- `.log-warn-bg`: 警告日志背景（浅色/深色自适应）
- `.log-info-bg`: 信息日志背景（浅色/深色自适应）

### 状态徽章
- `.status-success`: 成功状态文字和边框颜色
- `.status-error`: 错误状态文字和边框颜色
- `.status-warning`: 警告状态文字和边框颜色
- `.status-info`: 信息状态文字和边框颜色

### 通用样式
- `.hover-bg`: 悬停背景效果（浅色/深色自适应）
- `.card-bg`: 卡片背景样式（浅色/深色自适应）
- `.input-bg`: 输入框背景样式（浅色/深色自适应）

## 使用方式

### 在组件中使用

```tsx
// Toast 提示
toast.success('成功', { className: 'toast-success' });

// 日志背景
<div className="log-error-bg">错误日志</div>

// 悬停效果
<div className="hover-bg cursor-pointer">可点击项</div>

// 卡片样式
<div className="card-bg p-4 rounded-lg">卡片内容</div>
```

### 使用 Tailwind dark mode

所有自定义类都支持深色模式，会根据 `<html class="dark">` 自动切换。

你也可以直接使用 Tailwind 的 `dark:` 前缀：

```tsx
<div className="bg-white dark:bg-gray-800">
  自动适配主题的内容
</div>
```

## 主题切换

主题切换在 `App.tsx` 中实现：

```tsx
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme); // DaisyUI
  if (theme === 'dark') {
    document.documentElement.classList.add('dark'); // Tailwind
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [theme]);
```

这样同时支持 DaisyUI 和 Tailwind 的主题系统。
