import { http, HttpResponse } from 'msw'
import {
  mockPOPs,
  mockTecnicos,
  mockAtividades,
  mockGeradores,
  mockAbastecimentos,
  mockManutencoes,
  mockChecklistTemplates,
  mockDashboardStats,
  mockSystemAlerts,
  mockSmartActions,
  mockCapacityMetrics,
  mockCalendarEvents,
  mockUser,
  generateMockPagination
} from '@/data/mockData'
import type {
  POP,
  Tecnico,
  Atividade,
  Gerador,
  Manutencao,
  ChecklistTemplate,
  Abastecimento,
  FiltrosPOP,
  FiltrosAtividade,
  FiltrosTecnico
} from '@/types/entities'

// Simulação de delay de rede
const networkDelay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200))

// Utilitário para filtrar dados
const filterData = <T extends Record<string, any>>(data: T[], filters: Record<string, any>): T[] => {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true
      
      if (typeof value === 'string') {
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase())
      }
      
      return item[key] === value
    })
  })
}

// Utilitário para ordenar dados
const sortData = <T>(data: T[], sort?: string, order: 'asc' | 'desc' = 'asc'): T[] => {
  if (!sort) return data
  
  return [...data].sort((a, b) => {
    const aVal = (a as any)[sort]
    const bVal = (b as any)[sort]
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

export const handlers = [
  // === Handlers para POPs ===
  http.get('/api/pops', async ({ request }) => {
    await networkDelay()
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const sort = url.searchParams.get('sort') || undefined
    const order = (url.searchParams.get('order') as 'asc' | 'desc') || 'asc'
    
    const filters: FiltrosPOP = {
      busca: url.searchParams.get('busca') || undefined,
      status: url.searchParams.get('status') as any || undefined,
      tipo: url.searchParams.get('tipo') as any || undefined,


    }
    
    let filteredData = filterData(mockPOPs, filters)
    filteredData = sortData(filteredData, sort, order)
    
    const result = generateMockPagination(filteredData, page, limit)
    
    return HttpResponse.json(result)
  }),

  http.get('/api/pops/:id', async ({ params }) => {
    await networkDelay()
    
    const pop = mockPOPs.find(p => p.id === params.id)
    if (!pop) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(pop)
  }),

  http.post('/api/pops', async ({ request }) => {
    await networkDelay()
    
    const newPOP = await request.json() as Omit<POP, 'id' | 'created_at' | 'updated_at'>
    const pop: POP = {
      ...newPOP,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date(),
      updated_at: new Date()
    }
    
    mockPOPs.push(pop)
    return HttpResponse.json(pop, { status: 201 })
  }),

  http.put('/api/pops/:id', async ({ params, request }) => {
    await networkDelay()
    
    const updates = await request.json() as Partial<POP>
    const index = mockPOPs.findIndex(p => p.id === params.id)
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    mockPOPs[index] = {
      ...mockPOPs[index],
      ...updates,
      updated_at: new Date()
    }
    
    return HttpResponse.json(mockPOPs[index])
  }),

  http.delete('/api/pops/:id', async ({ params }) => {
    await networkDelay()
    
    const index = mockPOPs.findIndex(p => p.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    mockPOPs.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/pops/nearby', async ({ request }) => {
    await networkDelay()
    
    const url = new URL(request.url)
    const lat = parseFloat(url.searchParams.get('lat') || '0')
    const lng = parseFloat(url.searchParams.get('lng') || '0')
    const radius = parseFloat(url.searchParams.get('radius') || '10')
    
    // Simulação simples de busca por proximidade
    const nearbyPOPs = mockPOPs.filter(pop => {
      const distance = Math.sqrt(
        Math.pow(pop.coordenadas?.lat || 0 - lat, 2) +
        Math.pow(pop.coordenadas?.lng || 0 - lng, 2)
      )
      return distance <= radius / 100 // Conversão aproximada
    })
    
    return HttpResponse.json(nearbyPOPs)
  }),

  // === Handlers para Técnicos ===
  http.get('/api/tecnicos', async ({ request }) => {
    await networkDelay()
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const sort = url.searchParams.get('sort') || undefined
    const order = (url.searchParams.get('order') as 'asc' | 'desc') || 'asc'
    
    const filters: FiltrosTecnico = {
      busca: url.searchParams.get('busca') || undefined,
      status: url.searchParams.get('status') as any || undefined,
      cargo: url.searchParams.get('cargo') as any || undefined,
      especializacao: url.searchParams.get('especializacao') as any || undefined
    }
    
    let filteredData = filterData(mockTecnicos, filters)
    filteredData = sortData(filteredData, sort, order)
    
    const result = generateMockPagination(filteredData, page, limit)
    
    return HttpResponse.json(result)
  }),

  http.get('/api/tecnicos/:id', async ({ params }) => {
    await networkDelay()
    
    const tecnico = mockTecnicos.find(t => t.id === params.id)
    if (!tecnico) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(tecnico)
  }),

  http.get('/api/tecnicos/available', async () => {
    await networkDelay()
    
    const availableTecnicos = mockTecnicos.filter(t => t.status === 'disponivel')
    return HttpResponse.json(availableTecnicos)
  }),

  http.post('/api/tecnicos', async ({ request }) => {
    await networkDelay()
    
    const newTecnico = await request.json() as Omit<Tecnico, 'id' | 'created_at' | 'updated_at'>
    const tecnico: Tecnico = {
      ...newTecnico,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date(),
      updated_at: new Date()
    }
    
    mockTecnicos.push(tecnico)
    return HttpResponse.json(tecnico, { status: 201 })
  }),

  http.patch('/api/tecnicos/:id/status', async ({ params, request }) => {
    await networkDelay()
    
    const { status } = await request.json() as { status: Tecnico['status'] }
    const index = mockTecnicos.findIndex(t => t.id === params.id)
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    mockTecnicos[index] = {
      ...mockTecnicos[index],
      status,
      updated_at: new Date()
    }
    
    return HttpResponse.json(mockTecnicos[index])
  }),

  // === Handlers para Atividades ===
  http.get('/api/atividades', async ({ request }) => {
    await networkDelay()
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const sort = url.searchParams.get('sort') || undefined
    const order = (url.searchParams.get('order') as 'asc' | 'desc') || 'asc'
    
    const filters: FiltrosAtividade = {
      busca: url.searchParams.get('busca') || undefined,
      status: url.searchParams.get('status') as any || undefined,
      tipo: url.searchParams.get('tipo') as any || undefined,
      prioridade: url.searchParams.get('prioridade') as any || undefined,
      pop_id: url.searchParams.get('pop_id') || undefined,
      tecnico_id: url.searchParams.get('tecnico_id') || undefined
    }
    
    let filteredData = filterData(mockAtividades, filters)
    filteredData = sortData(filteredData, sort, order)
    
    const result = generateMockPagination(filteredData, page, limit)
    
    return HttpResponse.json(result)
  }),

  http.get('/api/atividades/:id', async ({ params }) => {
    await networkDelay()
    
    const atividade = mockAtividades.find(a => a.id === params.id)
    if (!atividade) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(atividade)
  }),

  http.post('/api/atividades', async ({ request }) => {
    await networkDelay()
    
    const newAtividade = await request.json() as Omit<Atividade, 'id' | 'created_at' | 'updated_at'>
    const atividade: Atividade = {
      ...newAtividade,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date(),
      updated_at: new Date()
    }
    
    mockAtividades.push(atividade)
    return HttpResponse.json(atividade, { status: 201 })
  }),

  http.patch('/api/atividades/:id/status', async ({ params, request }) => {
    await networkDelay()
    
    const { status } = await request.json() as { status: Atividade['status'] }
    const index = mockAtividades.findIndex(a => a.id === params.id)
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    mockAtividades[index] = {
      ...mockAtividades[index],
      status,
      updated_at: new Date()
    }
    
    return HttpResponse.json(mockAtividades[index])
  }),

  // === Handlers para Geradores ===
  http.get('/api/geradores', async ({ request }) => {
    await networkDelay()
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    const result = generateMockPagination(mockGeradores, page, limit)
    return HttpResponse.json(result)
  }),

  http.get('/api/geradores/:id', async ({ params }) => {
    await networkDelay()
    
    const gerador = mockGeradores.find(g => g.id === params.id)
    if (!gerador) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(gerador)
  }),

  http.post('/api/geradores', async ({ request }) => {
    await networkDelay()
    
    const newGerador = await request.json() as Omit<Gerador, 'id' | 'created_at' | 'updated_at'>
    const gerador: Gerador = {
      ...newGerador,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date(),
      updated_at: new Date()
    }
    
    mockGeradores.push(gerador)
    return HttpResponse.json(gerador, { status: 201 })
  }),

  // === Handlers para Abastecimentos ===
  http.get('/api/abastecimentos', async ({ request }) => {
    await networkDelay()
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const gerador_id = url.searchParams.get('gerador_id')
    
    let data = mockAbastecimentos
    if (gerador_id) {
      data = data.filter(a => a.gerador_id === gerador_id)
    }
    
    const result = generateMockPagination(data, page, limit)
    return HttpResponse.json(result)
  }),

  http.post('/api/abastecimentos', async ({ request }) => {
    await networkDelay()
    
    const newAbastecimento = await request.json() as Omit<Abastecimento, 'id' | 'created_at' | 'updated_at'>
    const abastecimento: Abastecimento = {
      ...newAbastecimento,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date(),
      updated_at: new Date()
    }
    
    mockAbastecimentos.push(abastecimento)
    return HttpResponse.json(abastecimento, { status: 201 })
  }),

  // === Handlers para Manutenções ===
  http.get('/api/manutencoes', async ({ request }) => {
    await networkDelay()
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    const result = generateMockPagination(mockManutencoes, page, limit)
    return HttpResponse.json(result)
  }),

  http.post('/api/manutencoes', async ({ request }) => {
    await networkDelay()
    
    const newManutencao = await request.json() as Omit<Manutencao, 'id' | 'created_at' | 'updated_at'>
    const manutencao: Manutencao = {
      ...newManutencao,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date(),
      updated_at: new Date()
    }
    
    mockManutencoes.push(manutencao)
    return HttpResponse.json(manutencao, { status: 201 })
  }),

  // === Handlers para Templates de Checklist ===
  http.get('/api/checklist-templates', async () => {
    await networkDelay()
    return HttpResponse.json(mockChecklistTemplates)
  }),

  http.post('/api/checklist-templates', async ({ request }) => {
    await networkDelay()
    
    const newTemplate = await request.json() as Omit<ChecklistTemplate, 'id' | 'created_at' | 'updated_at'>
    const template: ChecklistTemplate = {
      ...newTemplate,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date(),
      updated_at: new Date()
    }
    
    mockChecklistTemplates.push(template)
    return HttpResponse.json(template, { status: 201 })
  }),

  // === Handlers para Dashboard ===
  http.get('/api/dashboard/stats', async () => {
    await networkDelay()
    return HttpResponse.json(mockDashboardStats)
  }),

  http.get('/api/dashboard/alerts', async () => {
    await networkDelay()
    return HttpResponse.json(mockSystemAlerts)
  }),

  http.get('/api/dashboard/smart-actions', async () => {
    await networkDelay()
    return HttpResponse.json(mockSmartActions)
  }),

  http.get('/api/dashboard/recent-activities', async ({ request }) => {
    await networkDelay()
    
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '8')
    
    const recentActivities = mockAtividades
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
    
    return HttpResponse.json(recentActivities)
  }),

  http.get('/api/dashboard/upcoming-maintenances', async ({ request }) => {
    await networkDelay()
    
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '5')
    
    const upcomingMaintenances = mockManutencoes
      .filter(m => m.status === 'agendada')
      .sort((a, b) => new Date(a.data_agendada).getTime() - new Date(b.data_agendada).getTime())
      .slice(0, limit)
    
    return HttpResponse.json(upcomingMaintenances)
  }),

  http.get('/api/dashboard/technicians-vacation', async () => {
    await networkDelay()
    
    const techniciansOnVacation = mockTecnicos.filter(t => t.status === 'ferias')
    return HttpResponse.json(techniciansOnVacation)
  }),

  http.get('/api/dashboard/capacity-metrics', async () => {
    await networkDelay()
    return HttpResponse.json(mockCapacityMetrics)
  }),

  // === Handlers para Calendário ===
  http.get('/api/calendario/events', async ({ request }) => {
    await networkDelay()
    
    const url = new URL(request.url)
    const start = new Date(url.searchParams.get('start') || '')
    const end = new Date(url.searchParams.get('end') || '')
    
    const events = mockCalendarEvents.filter(event => {
      const eventDate = new Date(event.data_inicio)
      return eventDate >= start && eventDate <= end
    })
    
    return HttpResponse.json(events)
  }),

  // === Handlers para Usuários ===
  http.get('/api/users/profile', async () => {
    await networkDelay()
    return HttpResponse.json(mockUser)
  }),

  http.put('/api/users/profile', async ({ request }) => {
    await networkDelay()
    
    const updates = await request.json() as Partial<typeof mockUser>
    const updatedUser = {
      ...mockUser,
      ...updates,
      updated_at: new Date()
    }
    
    return HttpResponse.json(updatedUser)
  }),

  http.put('/api/users/dashboard-config', async ({ request }) => {
    await networkDelay()
    
    const config = await request.json()
    const updatedUser = {
      ...mockUser,
      dashboard_config: config,
      updated_at: new Date()
    }
    
    return HttpResponse.json(updatedUser)
  }),

  // === Handlers para Utilitários ===
  http.get('/api/utils/cep/:cep', async ({ params }) => {
    await networkDelay()
    
    // Simulação de busca de CEP
    const mockCEPData = {
      cep: params.cep as string,
      logradouro: 'Rua Exemplo',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP'
    }
    
    return HttpResponse.json(mockCEPData)
  }),

  http.get('/api/utils/geocode', async ({ request }) => {
    await networkDelay()
    
    const url = new URL(request.url)
    const address = url.searchParams.get('address')
    
    // Simulação de geocoding
    const mockGeoData = {
      lat: -23.5505 + (Math.random() - 0.5) * 0.1,
      lng: -46.6333 + (Math.random() - 0.5) * 0.1,
      formatted_address: address || 'Endereço não encontrado'
    }
    
    return HttpResponse.json(mockGeoData)
  }),

  http.get('/api/utils/reverse-geocode', async ({ request }) => {
    await networkDelay()
    
    const url = new URL(request.url)
    const lat = url.searchParams.get('lat')
    const lng = url.searchParams.get('lng')
    
    // Simulação de reverse geocoding
    const mockReverseGeoData = {
      formatted_address: `Endereço próximo a ${lat}, ${lng}`,
      components: {
        street: 'Rua Exemplo',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil'
      }
    }
    
    return HttpResponse.json(mockReverseGeoData)
  }),

  // === Handlers para Upload de arquivos ===
  http.post('/api/pops/:id/photos', async ({ params }) => {
    await networkDelay()
    
    const mockUploadResponse = {
      url: `/images/pops/pop-${params.id}-${Date.now()}.jpg`,
      filename: `photo-${Date.now()}.jpg`,
      size: Math.floor(Math.random() * 1000000) + 100000
    }
    
    return HttpResponse.json(mockUploadResponse)
  }),

  http.post('/api/tecnicos/:id/avatar', async ({ params }) => {
    await networkDelay()
    
    const mockUploadResponse = {
      url: `/images/avatars/tecnico-${params.id}-${Date.now()}.jpg`,
      filename: `avatar-${Date.now()}.jpg`,
      size: Math.floor(Math.random() * 500000) + 50000
    }
    
    return HttpResponse.json(mockUploadResponse)
  }),

  // === Handlers para Relatórios ===
  http.post('/api/relatorios/generate', async () => {
    await networkDelay()
    
    // Simulação de geração de relatório PDF
    const mockPDFContent = new Blob(['Mock PDF content'], { type: 'application/pdf' })
    return HttpResponse.arrayBuffer(await mockPDFContent.arrayBuffer(), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="relatorio.pdf"'
      }
    })
  }),

  http.post('/api/relatorios/export/:entity', async ({ params, request }) => {
    await networkDelay()
    
    const { format } = await request.json() as { format: 'excel' | 'csv' }
    const contentType = format === 'excel' 
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv'
    
    const mockContent = new Blob([`Mock ${format} content for ${params.entity}`], { type: contentType })
    return HttpResponse.arrayBuffer(await mockContent.arrayBuffer(), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${params.entity}.${format}"`
      }
    })
  })
]