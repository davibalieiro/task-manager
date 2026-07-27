import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

function initTheme() {
  try {
    const stored = localStorage.getItem('tm_theme') as 'dark' | 'light' | 'system' | null
    const theme = stored || 'dark'
    const root = document.documentElement
    root.classList.remove('light-theme', 'dark-theme')
    if (theme === 'light') {
      root.classList.add('light-theme')
    } else if (theme === 'dark') {
      root.classList.add('dark-theme')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(prefersDark ? 'dark-theme' : 'light-theme')
    }
  } catch {
    document.documentElement.classList.add('dark-theme')
  }
}

initTheme()

ReactDOM.createRoot(document.getElementById('root') ?? document.body).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
