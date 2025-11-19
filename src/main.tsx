import React from 'react'
import ReactDOM from 'react-dom/client'
import data from '@emoji-mart/data'
import { init } from 'emoji-mart'
import { ErrorBoundary } from 'react-error-boundary'
import App from './app.tsx'
import { ErrorFallback } from './components/error-fallback'
import './app.css'
import './i18n'

// 初始化 emoji-mart（只需要一次）
init({ data })

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
