import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { startMockServer } from './mocks/browser'

async function startApp() {
  if (import.meta.env.VITE_USE_MOCK_API === 'true') {
    await startMockServer()
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

startApp()