// Try to load XHRInterceptor from different React Native versions
let XHRInterceptor = null

function loadXHRInterceptor() {
  // Try RN >= 0.80
  try {
    const module = require('react-native/src/private/devsupport/devmenu/elementinspector/XHRInterceptor')
    if (
      typeof module.setSendCallback === 'function' &&
			typeof module.setResponseCallback === 'function' &&
			typeof module.enableInterception === 'function'
    ) {
      return module
    }
    if (
      module.default &&
			typeof module.default.setSendCallback === 'function' &&
			typeof module.default.setResponseCallback === 'function' &&
			typeof module.default.enableInterception === 'function'
    ) {
      return module.default
    }
  } catch (_e) {
    // Try next
  }

  // Try RN 0.79
  try {
    const module = require('react-native/src/private/inspector/XHRInterceptor')
    if (
      typeof module.setSendCallback === 'function' &&
			typeof module.setResponseCallback === 'function' &&
			typeof module.enableInterception === 'function'
    ) {
      return module
    }
    if (
      module.default &&
			typeof module.default.setSendCallback === 'function' &&
			typeof module.default.setResponseCallback === 'function' &&
			typeof module.default.enableInterception === 'function'
    ) {
      return module.default
    }
  } catch (_e) {
    // Try next
  }

  // Try RN < 0.79
  try {
    const module = require('react-native/Libraries/Network/XHRInterceptor')
    if (
      typeof module.setSendCallback === 'function' &&
			typeof module.setResponseCallback === 'function' &&
			typeof module.enableInterception === 'function'
    ) {
      return module
    }
    if (
      module.default &&
			typeof module.default.setSendCallback === 'function' &&
			typeof module.default.setResponseCallback === 'function' &&
			typeof module.default.enableInterception === 'function'
    ) {
      return module.default
    }
  } catch (_e) {
    // All paths failed
  }

  console.warn('Dev Lens: XHRInterceptor could not be loaded. Network monitoring will be disabled.')

  // Return dummy object to prevent crashes
  return {
    setSendCallback: () => {},
    setResponseCallback: () => {},
    enableInterception: () => {},
  }
}

// Load XHRInterceptor for React Native
XHRInterceptor = loadXHRInterceptor()

const DEV_LENS_URL = 'http://127.0.0.1:9527'

class DevLens {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || DEV_LENS_URL
    this.enabled = options.enabled !== false
  }

  async sendNetworkLog(request) {
    if (!this.enabled) return

    try {
      await fetch(`${this.baseUrl}/api/network`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
    } catch (_error) {
      // Silently fail to avoid infinite loops
    }
  }

  async sendConsoleLog(log) {
    if (!this.enabled) return

    try {
      await fetch(`${this.baseUrl}/api/console`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      })
    } catch (_error) {
      // Silently fail
    }
  }

  interceptNetwork() {
    if (!this.enabled || !XHRInterceptor) return

    try {
      const self = this

      XHRInterceptor.setSendCallback((data, xhr) => {
        // Skip Dev Lens requests to avoid recursion
        if (data && data.url && data.url.includes(self.baseUrl)) {
          return
        }

        xhr._devLensStartTime = Date.now()
        xhr._devLensId = Math.random().toString(36).substring(7)
        xhr._devLensMethod = data?.method || 'GET'
        xhr._devLensUrl = data?.url || ''

        // Collect request headers
        xhr._devLensRequestHeaders = {}
        if (data && data.requestHeaders) {
          Object.assign(xhr._devLensRequestHeaders, data.requestHeaders)
        }
      })

      XHRInterceptor.setResponseCallback((status, _timeout, response, url, _type, xhr) => {
        // Skip Dev Lens requests to avoid recursion
        if (url && url.includes(self.baseUrl)) {
          return
        }

        if (!xhr._devLensStartTime) return

        const responseTime = Date.now() - xhr._devLensStartTime
        const requestHeaders = xhr._headers || {}
        const responseHeaders = xhr.responseHeaders || {}

        // Format response body
        let responseBody = ''
        try {
          if (typeof response === 'string') {
            responseBody = response
          } else if (response) {
            responseBody = JSON.stringify(response, null, 2)
          }
        } catch (_e) {
          responseBody = String(response)
        }

        self.sendNetworkLog({
          id: xhr._devLensId,
          method: xhr._devLensMethod || 'GET',
          url: url || xhr._devLensUrl || '',
          status: status || 0,
          response_time: responseTime,
          headers: {
            request: requestHeaders,
            response: responseHeaders,
          },
          response: responseBody,
          type: 'Fetch/XHR',
        })
      })

      XHRInterceptor.enableInterception()
    } catch (_error) {
      console.warn('Dev Lens: Failed to setup network interceptor', error)
    }
  }

  async sendWebSocketUpdate(wsId, update) {
    if (!this.enabled) return

    try {
      await fetch(`${this.baseUrl}/api/websocket/${wsId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      })
    } catch (_error) {
      // Silently fail
    }
  }

  interceptWebSocket() {
    if (!this.enabled || typeof WebSocket === 'undefined') return

    const self = this
    const OriginalWebSocket = WebSocket

    // Override WebSocket constructor
    global.WebSocket = function (url, protocols) {
      const ws = new OriginalWebSocket(url, protocols)
      const wsId = Math.random().toString(36).substring(7)
      const startTime = Date.now()

      // Skip Dev Lens WebSocket to avoid recursion
      if (url && url.includes(self.baseUrl)) {
        return ws
      }

      // Create initial connection log
      self.sendNetworkLog({
        id: wsId,
        method: 'WebSocket',
        url: url,
        status: 0,
        response_time: 0,
        headers: {
          request: { Upgrade: 'websocket' },
          response: {},
        },
        response: '',
        type: 'Socket',
        ws_state: 'connecting',
        ws_messages: [],
      })

      // Track connection state
      ws.addEventListener('open', () => {
        const responseTime = Date.now() - startTime
        self.sendWebSocketUpdate(wsId, {
          state: 'open',
          status: 101,
          response_time: responseTime,
        })
      })

      // Track messages sent
      const originalSend = ws.send.bind(ws)
      ws.send = function (data) {
        self.sendWebSocketUpdate(wsId, {
          message: {
            id: `${wsId}-${Date.now()}`,
            direction: 'send',
            data: typeof data === 'string' ? data : '[Binary Data]',
            timestamp: Date.now(),
          },
        })
        return originalSend(data)
      }

      // Track messages received
      ws.addEventListener('message', event => {
        self.sendWebSocketUpdate(wsId, {
          message: {
            id: `${wsId}-${Date.now()}`,
            direction: 'receive',
            data: typeof event.data === 'string' ? event.data : '[Binary Data]',
            timestamp: Date.now(),
          },
        })
      })

      // Track errors
      ws.addEventListener('error', error => {
        self.sendWebSocketUpdate(wsId, {
          state: 'error',
          error: error.message || 'Unknown error',
        })
      })

      // Track close
      ws.addEventListener('close', event => {
        self.sendWebSocketUpdate(wsId, {
          state: 'closed',
          status: event.code,
          close_reason: event.reason || 'No reason',
          response_time: Date.now() - startTime,
        })
      })

      return ws
    }

    // Copy static properties
    Object.setPrototypeOf(global.WebSocket, OriginalWebSocket)
    global.WebSocket.prototype = OriginalWebSocket.prototype
  }

  interceptConsole() {
    if (!this.enabled) return

    const self = this
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
    }

    const formatArgs = args => {
      return args
        .map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2)
            } catch (_e) {
              return String(arg)
            }
          }
          return String(arg)
        })
        .join(' ')
    }

    console.log = function (...args) {
      originalConsole.log(...args)
      self.sendConsoleLog({ level: 'info', message: formatArgs(args) })
    }

    console.info = function (...args) {
      originalConsole.info(...args)
      self.sendConsoleLog({ level: 'info', message: formatArgs(args) })
    }

    console.warn = function (...args) {
      originalConsole.warn(...args)
      self.sendConsoleLog({ level: 'warn', message: formatArgs(args) })
    }

    console.error = function (...args) {
      originalConsole.error(...args)
      self.sendConsoleLog({ level: 'error', message: formatArgs(args) })
    }
  }

  init() {
    this.interceptNetwork()
    this.interceptWebSocket()
    this.interceptConsole()
  }
}

module.exports = DevLens
