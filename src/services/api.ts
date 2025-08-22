import axios from 'axios'
import type {
  POP,
  Tecnico,
  Atividade,
  Gerador,
  Manutencao,
  ChecklistTemplate,
  Abastecimento,
  User,
  DashboardStats,
  SystemAlert,
  SmartAction,
  RespostaPaginada,
  FiltrosPOP,
  FiltrosAtividade,
  FiltrosTecnico,
  UploadResponse,
  ImportacaoGLPI,
  RelatorioConfig,
  MetricasCapacidade,
  EventoCalendario,
} from '@/types/entities'

// Configuração base do Axios
const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Tipos para parâmetros de API
interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

// === APIs de POPs ===
export const popsAPI = {
  // Listar POPs com filtros e paginação
  list: async (params?: FiltrosPOP & PaginationParams): Promise<RespostaPaginada<POP>> => {
    const response = await api.get('/pops', { params })
    return response.data
  },

  // Buscar POP por ID
  getById: async (id: string): Promise<POP> => {
    const response = await api.get(`/pops/${id}`)
    return response.data
  },

  // Criar novo POP
  create: async (data: Omit<POP, 'id' | 'created_at' | 'updated_at'>): Promise<POP> => {
    const response = await api.post('/pops', data)
    return response.data
  },

  // Atualizar POP
  update: async (id: string, data: Partial<POP>): Promise<POP> => {
    const response = await api.put(`/pops/${id}`, data)
    return response.data
  },

  // Excluir POP
  delete: async (id: string): Promise<void> => {
    await api.delete(`/pops/${id}`)
  },

  // Upload de fotos do POP
  uploadPhoto: async (id: string, file: File, tipo: 'principal' | 'galeria'): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('tipo', tipo)
    
    const response = await api.post(`/pops/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Remover foto do POP
  removePhoto: async (id: string, photoUrl: string): Promise<void> => {
    await api.delete(`/pops/${id}/photos`, { data: { photoUrl } })
  },

  // Buscar POPs próximos por coordenadas
  getNearby: async (lat: number, lng: number, radius: number = 10): Promise<POP[]> => {
    const response = await api.get('/pops/nearby', {
      params: { lat, lng, radius }
    })
    return response.data
  },
}

// === APIs de Técnicos ===
export const tecnicosAPI = {
  list: async (params?: FiltrosTecnico & PaginationParams): Promise<RespostaPaginada<Tecnico>> => {
    const response = await api.get('/technicians', { params })
    return response.data
  },

  getById: async (id: string): Promise<Tecnico> => {
    const response = await api.get(`/technicians/${id}`)
    return response.data
  },

  create: async (data: Omit<Tecnico, 'id' | 'created_at' | 'updated_at'>): Promise<Tecnico> => {
    const response = await api.post('/technicians', data)
    return response.data
  },

  update: async (id: string, data: Partial<Tecnico>): Promise<Tecnico> => {
    const response = await api.put(`/technicians/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/technicians/${id}`)
  },

  // Upload de avatar
  uploadAvatar: async (id: string, file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await api.post(`/technicians/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Buscar técnicos disponíveis
  getAvailable: async (): Promise<Tecnico[]> => {
    const response = await api.get('/technicians/available')
    return response.data
  },

  // Atualizar status do técnico
  updateStatus: async (id: string, status: Tecnico['status']): Promise<Tecnico> => {
    const response = await api.patch(`/technicians/${id}/status`, { status })
    return response.data
  },
}

// === APIs de Atividades ===
export const atividadesAPI = {
  list: async (params?: FiltrosAtividade & PaginationParams): Promise<RespostaPaginada<Atividade>> => {
    const response = await api.get('/activities', { params })
    return response.data
  },

  getById: async (id: string): Promise<Atividade> => {
    const response = await api.get(`/activities/${id}`)
    return response.data
  },

  create: async (data: Omit<Atividade, 'id' | 'created_at' | 'updated_at'>): Promise<Atividade> => {
    const response = await api.post('/activities', data)
    return response.data
  },

  update: async (id: string, data: Partial<Atividade>): Promise<Atividade> => {
    const response = await api.put(`/activities/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/activities/${id}`)
  },

  // Atualizar status da atividade
  updateStatus: async (id: string, status: Atividade['status']): Promise<Atividade> => {
    const response = await api.patch(`/atividades/${id}/status`, { status })
    return response.data
  },

  // Importar atividades do GLPI
  importFromGLPI: async (file: File): Promise<ImportacaoGLPI> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/atividades/import-glpi', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Status da importação GLPI
  getImportStatus: async (importId: string): Promise<ImportacaoGLPI> => {
    const response = await api.get(`/atividades/import-glpi/${importId}`)
    return response.data
  },

  // Operações em lote
  bulkUpdate: async (ids: string[], data: Partial<Atividade>): Promise<void> => {
    await api.patch('/atividades/bulk', { ids, data })
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.delete('/atividades/bulk', { data: { ids } })
  },
}

// === APIs de Geradores ===
export const geradoresAPI = {
  list: async (params?: PaginationParams): Promise<RespostaPaginada<Gerador>> => {
    const response = await api.get('/generators', { params })
    return response.data
  },

  getById: async (id: string): Promise<Gerador> => {
    const response = await api.get(`/generators/${id}`)
    return response.data
  },

  create: async (data: Omit<Gerador, 'id' | 'created_at' | 'updated_at'>): Promise<Gerador> => {
    const response = await api.post('/generators', data)
    return response.data
  },

  update: async (id: string, data: Partial<Gerador>): Promise<Gerador> => {
    const response = await api.put(`/generators/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/generators/${id}`)
  },

  // Upload de foto do gerador
  uploadPhoto: async (id: string, file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('photo', file)
    
    const response = await api.post(`/generators/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
}

// === APIs de Abastecimentos ===
export const abastecimentosAPI = {
  list: async (params?: PaginationParams & { gerador_id?: string }): Promise<RespostaPaginada<Abastecimento>> => {
    const response = await api.get('/supplies', { params })
    return response.data
  },

  getById: async (id: string): Promise<Abastecimento> => {
    const response = await api.get(`/supplies/${id}`)
    return response.data
  },

  create: async (data: Omit<Abastecimento, 'id' | 'created_at' | 'updated_at'>): Promise<Abastecimento> => {
    const response = await api.post('/supplies', data)
    return response.data
  },

  update: async (id: string, data: Partial<Abastecimento>): Promise<Abastecimento> => {
    const response = await api.put(`/supplies/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/supplies/${id}`)
  },

  // Upload de fotos do abastecimento
  uploadPhoto: async (id: string, file: File, tipo: 'nota_fiscal' | 'bomba'): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('tipo', tipo)
    
    const response = await api.post(`/abastecimentos/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
}

// === APIs de Manutenções ===
export const manutencoesAPI = {
  list: async (params?: PaginationParams): Promise<RespostaPaginada<Manutencao>> => {
    const response = await api.get('/maintenance', { params })
    return response.data
  },

  getById: async (id: string): Promise<Manutencao> => {
    const response = await api.get(`/maintenance/${id}`)
    return response.data
  },

  create: async (data: Omit<Manutencao, 'id' | 'created_at' | 'updated_at'>): Promise<Manutencao> => {
    const response = await api.post('/maintenance', data)
    return response.data
  },

  update: async (id: string, data: Partial<Manutencao>): Promise<Manutencao> => {
    const response = await api.put(`/maintenance/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/maintenance/${id}`)
  },

  // Upload de fotos da manutenção
  uploadPhotos: async (id: string, files: File[]): Promise<UploadResponse[]> => {
    const formData = new FormData()
    files.forEach(file => formData.append('photos', file))
    
    const response = await api.post(`/maintenance/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
}

// === APIs de Templates de Checklist ===
export const checklistTemplatesAPI = {
  list: async (): Promise<ChecklistTemplate[]> => {
    const response = await api.get('/checklists')
    return response.data
  },

  getById: async (id: string): Promise<ChecklistTemplate> => {
    const response = await api.get(`/checklists/${id}`)
    return response.data
  },

  create: async (data: Omit<ChecklistTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ChecklistTemplate> => {
    const response = await api.post('/checklists', data)
    return response.data
  },

  update: async (id: string, data: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> => {
    const response = await api.put(`/checklists/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/checklists/${id}`)
  },
}

// === APIs do Dashboard ===
export const dashboardAPI = {
  // Estatísticas principais
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  // Alertas do sistema
  getAlerts: async (): Promise<SystemAlert[]> => {
    const response = await api.get('/dashboard/alerts')
    return response.data
  },

  // Ações inteligentes
  getSmartActions: async (): Promise<SmartAction[]> => {
    const response = await api.get('/dashboard/smart-actions')
    return response.data
  },

  // Atividades recentes
  getRecentActivities: async (limit: number = 8): Promise<Atividade[]> => {
    const response = await api.get('/dashboard/recent-activities', {
      params: { limit }
    })
    return response.data
  },

  // Próximas manutenções
  getUpcomingMaintenances: async (limit: number = 5): Promise<Manutencao[]> => {
    const response = await api.get('/dashboard/upcoming-maintenances', {
      params: { limit }
    })
    return response.data
  },

  // Técnicos em férias
  getTechniciansOnVacation: async (): Promise<Tecnico[]> => {
    const response = await api.get('/dashboard/technicians-vacation')
    return response.data
  },

  // Métricas de capacidade
  getCapacityMetrics: async (): Promise<MetricasCapacidade[]> => {
    const response = await api.get('/dashboard/capacity-metrics')
    return response.data
  },
}

// === APIs de Relatórios ===
export const relatoriosAPI = {
  // Gerar relatório
  generate: async (config: RelatorioConfig): Promise<Blob> => {
    const response = await api.post('/relatorios/generate', config, {
      responseType: 'blob'
    })
    return response.data
  },

  // Exportar dados
  export: async (entity: string, format: 'excel' | 'csv', filters?: any): Promise<Blob> => {
    const response = await api.post(`/relatorios/export/${entity}`, {
      format,
      filters
    }, {
      responseType: 'blob'
    })
    return response.data
  },
}

// === APIs de Calendário ===
export const calendarioAPI = {
  // Buscar eventos do calendário
  getEvents: async (start: Date, end: Date): Promise<EventoCalendario[]> => {
    const response = await api.get('/calendario/events', {
      params: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    })
    return response.data
  },
}

// === APIs de Usuários ===
export const usersAPI = {
  // Perfil do usuário atual
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile')
    return response.data
  },

  // Atualizar perfil
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/users/profile', data)
    return response.data
  },

  // Atualizar configurações do dashboard
  updateDashboardConfig: async (config: User['dashboard_config']): Promise<User> => {
    const response = await api.put('/users/dashboard-config', config)
    return response.data
  },
}

// === Utilitários ===
export const utilsAPI = {
  // Buscar CEP
  getCEP: async (cep: string): Promise<{
    cep: string
    logradouro: string
    bairro: string
    cidade: string
    estado: string
  }> => {
    const response = await api.get(`/utils/cep/${cep}`)
    return response.data
  },

  // Geocoding - buscar coordenadas por endereço
  geocode: async (address: string): Promise<{
    lat: number
    lng: number
    formatted_address: string
  }> => {
    const response = await api.get('/utils/geocode', {
      params: { address }
    })
    return response.data
  },

  // Reverse geocoding - buscar endereço por coordenadas
  reverseGeocode: async (lat: number, lng: number): Promise<{
    formatted_address: string
    components: {
      street: string
      city: string
      state: string
      country: string
    }
  }> => {
    const response = await api.get('/utils/reverse-geocode', {
      params: { lat, lng }
    })
    return response.data
  },
}

export default api