/* eslint-disable @typescript-eslint/no-explicit-any */
import qs from 'qs'

const DEFAULT_WS_URL = 'ws://127.0.0.1:3927/ws'

interface DevLensOptions {
  enabled?: boolean
  wsUrl?: string
}

class DevLens {
  private wsUrl: string
  private enabled: boolean
  private ws: WebSocket | null
  private messageQueue: any[]
  private connecting: boolean
  private reconnectDelay: number
  private maxReconnectDelay: number

  constructor(options: DevLensOptions = {}) {
    this.wsUrl = options.wsUrl || DEFAULT_WS_URL
    this.enabled = options.enabled !== false
    this.ws = null
    this.messageQueue = []
    this.connecting = false
    this.reconnectDelay = 1000
    this.maxReconnectDelay = 30000
  }

  connectWebSocket(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }

    if (this.connecting) {
      return
    }

    this.connecting = true

    try {
      this.ws = new WebSocket(this.wsUrl)

      this.ws.onopen = () => {
        this.connecting = false
        this.reconnectDelay = 1000

        while (this.messageQueue.length > 0) {
          const msg = this.messageQueue.shift()
          this.sendMessage(msg)
        }
      }

      this.ws.onerror = () => {
        // Silent error handling
      }

      this.ws.onclose = () => {
        this.connecting = false
        this.ws = null

        setTimeout(() => {
          this.reconnectDelay = Math.min(
            this.reconnectDelay * 2,
            this.maxReconnectDelay,
          )
          this.connectWebSocket()
        }, this.reconnectDelay)
      }
    } catch (error) {
      console.warn('Dev Lens: Failed to create WebSocket', error)
      this.connecting = false
    }
  }

  sendMessage(message: any): void {
    if (!this.enabled) return

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.messageQueue.push(message)
      this.connectWebSocket()
      return
    }

    try {
      this.ws.send(JSON.stringify(message))
    } catch (_error) {
      this.messageQueue.push(message)
    }
  }

  async sendNetworkLog(request: any): Promise<void> {
    this.sendMessage({
      type: 'network',
      data: request,
    })
  }

  async sendConsoleLog(log: any): Promise<void> {
    this.sendMessage({
      type: 'console',
      data: log,
    })
  }

  private async extractRequestConfig(input: RequestInfo | URL, init?: RequestInit) {
    // Extract URL
    let url: string
    if (typeof input === 'string') {
      url = input
    } else if (input instanceof URL) {
      url = input.toString()
    } else if (input instanceof Request) {
      url = input.url
    } else {
      url = ''
    }

    // Get Request object if input is Request
    const requestObj = input instanceof Request ? input : null

    // Extract method: init > Request > 'GET'
    const method = init?.method || requestObj?.method || 'GET'

    // Extract headers: Request first, then init overrides
    const headers: Record<string, string> = {}

    if (requestObj) {
      requestObj.headers.forEach((value: string, key: string) => {
        headers[key] = value
      })
    }

    if (init?.headers) {
      const initHeaders = init.headers
      if (initHeaders instanceof Headers) {
        initHeaders.forEach((value: string, key: string) => {
          headers[key] = value
        })
      } else if (Array.isArray(initHeaders)) {
        initHeaders.forEach(([key, value]) => {
          headers[key] = value
        })
      } else {
        Object.entries(initHeaders).forEach(([key, value]) => {
          headers[key] = value
        })
      }
    }

    // Extract body: init > Request
    let body = ''
    const bodySource = init?.body || (requestObj && !requestObj.bodyUsed ? requestObj : null)

    if (bodySource) {
      try {
        if (bodySource instanceof Request) {
          const cloned = bodySource.clone()
          body = await cloned.text()
        } else if (typeof bodySource === 'string') {
          body = bodySource
        } else if (bodySource instanceof FormData) {
          body = '[FormData]'
        } else if (bodySource instanceof Blob) {
          body = '[Blob]'
        } else if (bodySource instanceof ArrayBuffer || bodySource instanceof Uint8Array) {
          body = '[Binary Data]'
        } else {
          body = JSON.stringify(bodySource)
        }
      } catch (_e) {
        body = '[Unable to serialize body]'
      }
    }

    return { url, method, headers, body }
  }

  interceptNetwork(): void {
    if (!this.enabled) return

    try {
      const self = this
      const originalFetch = globalThis.fetch

      globalThis.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
        // Extract request config
        const config = await self.extractRequestConfig(input, init)

        if (config.url && config.url.includes('127.0.0.1:3927')) {
          return originalFetch(input, init)
        }

        const requestId = Math.random().toString(36).substring(7)
        const startTime = Date.now()

        // Capture cookies
        const cookies: Record<string, string> = {}
        try {
          if (typeof document !== 'undefined' && document.cookie) {
            document.cookie.split(';').forEach(cookie => {
              const [key, value] = cookie.trim().split('=')
              if (key && value) {
                cookies[key] = decodeURIComponent(value)
              }
            })
          }
        } catch (_e) {
          // Cookie access might be restricted
        }

        // Parse query params using qs
        let queryParams: Record<string, any> = {}
        try {
          const queryString = config.url.split('?')[1]
          if (queryString) {
            queryParams = qs.parse(queryString)
          }
        } catch (_e) {
          // Invalid query string
        }

        try {
          const response = await originalFetch(input, init)
          const responseTime = Date.now() - startTime

          const clonedResponse = response.clone()

          const responseHeaders: Record<string, string> = {}
          response.headers.forEach((value: string, key: string) => {
            responseHeaders[key] = value
          })

          let responseBody = ''
          try {
            const contentType = response.headers.get('content-type') || ''
            if (contentType.includes('application/json')) {
              const json = await clonedResponse.json()
              responseBody = JSON.stringify(json, null, 2)
            } else if (contentType.includes('text/')) {
              responseBody = await clonedResponse.text()
            } else {
              responseBody = '[Binary Data]'
            }
          } catch (_e) {
            responseBody = '[Unable to read response]'
          }

          self.sendNetworkLog({
            id: requestId,
            method: config.method,
            url: config.url,
            status: response.status,
            response_time: responseTime,
            headers: {
              request: config.headers,
              response: responseHeaders,
            },
            cookies,
            query_params: queryParams,
            request_body: config.body,
            response_body: responseBody,
            type: 'Fetch/XHR',
          })

          return response
        } catch (error: any) {
          const responseTime = Date.now() - startTime

          self.sendNetworkLog({
            id: requestId,
            method: config.method,
            url: config.url,
            status: 0,
            response_time: responseTime,
            headers: {
              request: config.headers,
              response: {},
            },
            cookies,
            query_params: queryParams,
            request_body: config.body,
            response_body: `Error: ${error.message}`,
            type: 'Fetch/XHR',
          })

          throw error
        }
      }
    } catch (_error) {
      // Silent error handling
    }
  }



  async sendWebSocketUpdate(wsId: string, update: any): Promise<void> {
    this.sendMessage({
      type: 'websocket-update',
      ws_id: wsId,
      data: update,
    })
  }

  interceptWebSocket(): void {
    if (!this.enabled || typeof WebSocket === 'undefined') return

    const self = this
    const OriginalWebSocket = WebSocket

    globalThis.WebSocket = class extends OriginalWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols)
        const ws = this
        const wsId = Math.random().toString(36).substring(7)
        const startTime = Date.now()
        const urlString = typeof url === 'string' ? url : url.toString()

        if (urlString && urlString.includes('127.0.0.1:3927')) {
          return
        }

        self.sendNetworkLog({
          id: wsId,
          method: 'WebSocket',
          url: urlString,
          status: 0,
          response_time: 0,
          headers: {
            request: { Upgrade: 'websocket' },
            response: {},
          },
          response_body: '',
          type: 'Socket',
          ws_state: 'connecting',
          ws_messages: [],
        })

        ws.addEventListener('open', () => {
          const responseTime = Date.now() - startTime
          self.sendWebSocketUpdate(wsId, {
            state: 'open',
            status: 101,
            response_time: responseTime,
          })
        })

        const originalSend = ws.send.bind(ws)
        ws.send = function (data: any) {
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

        ws.addEventListener('message', (event: MessageEvent) => {
          self.sendWebSocketUpdate(wsId, {
            message: {
              id: `${wsId}-${Date.now()}`,
              direction: 'receive',
              data: typeof event.data === 'string' ? event.data : '[Binary Data]',
              timestamp: Date.now(),
            },
          })
        })

        ws.addEventListener('error', () => {
          self.sendWebSocketUpdate(wsId, {
            state: 'error',
            error: 'WebSocket error',
          })
        })

        ws.addEventListener('close', (event: CloseEvent) => {
          self.sendWebSocketUpdate(wsId, {
            state: 'closed',
            status: event.code,
            close_reason: event.reason || 'No reason',
            response_time: Date.now() - startTime,
          })
        })
      }
    }
  }

  interceptConsole(): void {
    if (!this.enabled) return

    const self = this
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
    }

    console.log = function (...args: any[]) {
      originalConsole.log(...args)
      self.sendConsoleLog({ level: 'log', args })
    }

    console.info = function (...args: any[]) {
      originalConsole.info(...args)
      self.sendConsoleLog({ level: 'info', args })
    }

    console.warn = function (...args: any[]) {
      originalConsole.warn(...args)
      self.sendConsoleLog({ level: 'warn', args })
    }

    console.error = function (...args: any[]) {
      originalConsole.error(...args)
      self.sendConsoleLog({ level: 'error', args })
    }
  }

  init(): void {
    this.connectWebSocket()
    this.interceptNetwork()
    this.interceptWebSocket()
    this.interceptConsole()
  }
}

export default DevLens
