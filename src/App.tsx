import { useState, useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'
import { useTranslation } from 'react-i18next'
import { Toaster } from 'react-hot-toast'
import { Emoji } from './components/Emoji'
import { NetworkPage } from './pages/NetworkPage'
import { ConsolePage } from './pages/ConsolePage'
import { usePreferencesStore } from './stores/usePreferencesStore'
import { THEME, LANGUAGE, TAB } from './constants'
import type { NetworkRequest, ConsoleLog, WebSocketUpdate } from './types'

import './App.css'

function App() {
  const { t, i18n } = useTranslation()
  const { theme, language, toggleTheme, toggleLanguage } = usePreferencesStore()
  const [activeTab, setActiveTab] = useState<typeof TAB.NETWORK | typeof TAB.CONSOLE>(TAB.NETWORK)
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([])
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    // 为 Tailwind dark mode 添加 class
    if (theme === THEME.DARK) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // 同步语言到 i18n
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language, i18n])

  useEffect(() => {
    const unlistenNetwork = listen<NetworkRequest>('network-log', event => {
      setNetworkRequests(prev => [event.payload, ...prev])
    })

    const unlistenConsole = listen<ConsoleLog>('console-log', event => {
      setConsoleLogs(prev => [event.payload, ...prev])
    })

    const unlistenWebSocket = listen<{ ws_id: string; update: WebSocketUpdate }>('websocket-update', event => {
      const { ws_id, update } = event.payload

      setNetworkRequests(prev => {
        const index = prev.findIndex(req => req.id === ws_id)
        if (index === -1) return prev

        const updated = [...prev]
        const wsRequest = { ...updated[index] }

        // Update state
        if (update.state) {
          wsRequest.ws_state = update.state
        }

        // Update status
        if (update.status !== undefined) {
          wsRequest.status = update.status
        }

        // Update response time
        if (update.response_time !== undefined) {
          wsRequest.response_time = update.response_time
        }

        // Add message
        if (update.message) {
          if (!wsRequest.ws_messages) {
            wsRequest.ws_messages = []
          }
          wsRequest.ws_messages.push(update.message)
        }

        // Update error or close reason
        if (update.error) {
          wsRequest.response = `Error: ${update.error}`
        } else if (update.close_reason) {
          wsRequest.response = `Closed: ${update.close_reason}`
        }

        updated[index] = wsRequest
        return updated
      })
    })

    return () => {
      unlistenNetwork.then(f => f())
      unlistenConsole.then(f => f())
      unlistenWebSocket.then(f => f())
    }
  }, [])

  const handleClear = () => {
    if (activeTab === TAB.NETWORK) {
      setNetworkRequests([])
    } else {
      setConsoleLogs([])
    }
  }

  return (
    <div className="flex flex-col h-screen bg-base-100">
      {/* Navbar */}
      <div className="navbar bg-base-100 border-b border-base-300">
        <div className="navbar-start">
          <div className="flex items-center gap-2">
            <img src='/logo.svg' className="w-8 h-8" />
            <span className="text-xl font-bold">{t('appName')}</span>
          </div>
        </div>
        <div className="navbar-center">
          <div role="tablist" className="tabs tabs-boxed">
            <a
              role="tab"
              className={`tab outline-none ${activeTab === TAB.NETWORK ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(TAB.NETWORK)}
            >
              {t('network')}
            </a>
            <a
              role="tab"
              className={`tab outline-none ${activeTab === TAB.CONSOLE ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(TAB.CONSOLE)}
            >
              {t('console')}
            </a>
          </div>
        </div>
        <div className="navbar-end gap-2">
          <button
            className="btn btn-ghost btn-sm btn-circle outline-none"
            onClick={toggleTheme}
            title={t('theme')}
          >
            {theme === THEME.LIGHT ? <Emoji native="🌙" size={18} /> : <Emoji native="☀️" size={18} />}
          </button>
          <button
            className="btn btn-ghost btn-sm outline-none"
            onClick={toggleLanguage}
            title={t('language')}
          >
            {language === LANGUAGE.ZH ? 'EN' : '中'}
          </button>
          <button
            className="btn btn-outline btn-sm outline-none hover:btn-error"
            onClick={handleClear}
            title={t('clearAll')}
          >
            <Emoji native="🗑️" size={16} /> {t('clear')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="grow p-4 overflow-y-auto">
        {activeTab === TAB.NETWORK && <NetworkPage networkRequests={networkRequests} />}
        {activeTab === TAB.CONSOLE && <ConsolePage consoleLogs={consoleLogs} />}
      </main>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}

export default App
