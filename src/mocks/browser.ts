import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Configurar o service worker para interceptar requisições no navegador
export const worker = setupWorker(...handlers)

// Função para inicializar o mock server
export const startMockServer = async () => {
  if ((import.meta as any).env?.DEV && (import.meta as any).env?.VITE_USE_MOCK_API === 'true') {
    try {
      await worker.start({
        onUnhandledRequest: 'warn',
        serviceWorker: {
          url: '/mockServiceWorker.js'
        }
      })
      console.log('🚀 Mock Service Worker iniciado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao iniciar Mock Service Worker:', error)
    }
  }
}

// Função para parar o mock server
export const stopMockServer = () => {
  if (worker) {
    worker.stop()
    console.log('🛑 Mock Service Worker parado')
  }
}

// Função para resetar os handlers
export const resetMockServer = () => {
  if (worker) {
    worker.resetHandlers()
    console.log('🔄 Mock Service Worker resetado')
  }
}

// Função para adicionar handlers dinamicamente
export const addMockHandlers = (...newHandlers: Parameters<typeof worker.use>) => {
  if (worker) {
    worker.use(...newHandlers)
    console.log('➕ Novos handlers adicionados ao Mock Service Worker')
  }
}

export default worker