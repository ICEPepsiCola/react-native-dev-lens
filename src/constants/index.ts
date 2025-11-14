// 主题常量
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const

export type Theme = typeof THEME[keyof typeof THEME]

// 语言常量
export const LANGUAGE = {
  EN: 'en',
  ZH: 'zh',
} as const

export type Language = typeof LANGUAGE[keyof typeof LANGUAGE]

// 标签页常量
export const TAB = {
  NETWORK: 'network',
  CONSOLE: 'console',
} as const

export type Tab = typeof TAB[keyof typeof TAB]

// 网络请求类型常量
export const REQUEST_TYPE = {
  ALL: 'All',
  FETCH: 'Fetch',
  XHR: 'XHR',
  WEBSOCKET: 'WebSocket',
} as const

export type RequestType = typeof REQUEST_TYPE[keyof typeof REQUEST_TYPE]

// 日志级别常量
export const LOG_LEVEL = {
  ALL: 'all',
  LOG: 'log',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const

export type LogLevel = typeof LOG_LEVEL[keyof typeof LOG_LEVEL]

// WebSocket 方向常量
export const WS_DIRECTION = {
  SEND: 'send',
  RECEIVE: 'receive',
} as const

export type WsDirection = typeof WS_DIRECTION[keyof typeof WS_DIRECTION]

// 详情标签页常量
export const DETAIL_TAB = {
  GENERAL: 'General',
  HEADERS: 'Headers',
  RESPONSE: 'Response',
} as const

export type DetailTab = typeof DETAIL_TAB[keyof typeof DETAIL_TAB]
