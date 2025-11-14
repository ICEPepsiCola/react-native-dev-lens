import React from 'react'
import ReactDOM from 'react-dom/client'
import data from '@emoji-mart/data'
import { init } from 'emoji-mart'
import App from './app.tsx'
import './app.css'
import './i18n'

// 初始化 emoji-mart（只需要一次）
init({ data })

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
