import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  popsAPI,
  tecnicosAPI,
  atividadesAPI,
  geradoresAPI,
  abastecimentosAPI,
  manutencoesAPI,
  checklistTemplatesAPI,
  dashboardAPI,
  relatoriosAPI,
  calendarioAPI,
  usersAPI,
  utilsAPI,
} from '@/services/api'
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

// Tipos para parâmetros de paginação
interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

// === Hooks para POPs ===
export const usePOPs = (
  params?: FiltrosPOP & PaginationParams,
  options?: UseQueryOptions<RespostaPaginada<POP>>
) => {
  return useQuery({
    queryKey: ['pops', params],
    queryFn: () => popsAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    ...options,
  })
}

export const usePOP = (id: string, options?: UseQueryOptions<POP>) => {
  return useQuery({
    queryKey: ['pops', id],
    queryFn: () => popsAPI.getById(id),
    enabled: !!id,
    ...options,
  })
}

export const useCreatePOP = (options?: UseMutationOptions<POP, Error, Omit<POP, 'id' | 'created_at' | 'updated_at'>>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: popsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pops'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('POP criado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar POP: ' + error.message)
    },
    ...options,
  })
}

export const useUpdatePOP = (options?: UseMutationOptions<POP, Error, { id: string; data: Partial<POP> }>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => popsAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pops'] })
      queryClient.setQueryData(['pops', variables.id], data)
      toast.success('POP atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar POP: ' + error.message)
    },
    ...options,
  })
}

export const useDeletePOP = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: popsAPI.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['pops'] })
      queryClient.removeQueries({ queryKey: ['pops', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('POP excluído com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao excluir POP: ' + error.message)
    },
    ...options,
  })
}

export const useUploadPOPPhoto = (options?: UseMutationOptions<UploadResponse, Error, { id: string; file: File; tipo: 'principal' | 'galeria' }>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, file, tipo }) => popsAPI.uploadPhoto(id, file, tipo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pops', variables.id] })
      toast.success('Foto enviada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao enviar foto: ' + error.message)
    },
    ...options,
  })
}

export const useUploadSupplyPhoto = (options?: UseMutationOptions<UploadResponse, Error, { id: string; file: File; tipo: 'nota_fiscal' | 'bomba' }>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, file, tipo }) => abastecimentosAPI.uploadPhoto(id, file, tipo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['abastecimentos', variables.id] })
      toast.success('Evidência fotográfica enviada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao enviar evidência: ' + error.message)
    },
    ...options,
  })
}

export const useNearbyPOPs = (
  lat: number,
  lng: number,
  radius: number = 10,
  options?: UseQueryOptions<POP[]>
) => {
  return useQuery({
    queryKey: ['pops', 'nearby', lat, lng, radius],
    queryFn: () => popsAPI.getNearby(lat, lng, radius),
    enabled: !!(lat && lng),
    staleTime: 2 * 60 * 1000, // 2 minutos
    ...options,
  })
}

// === Hooks para Técnicos ===
export const useTecnicos = (
  params?: FiltrosTecnico & PaginationParams,
  options?: UseQueryOptions<RespostaPaginada<Tecnico>>
) => {
  return useQuery({
    queryKey: ['tecnicos', params],
    queryFn: () => tecnicosAPI.list(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export const useTecnico = (id: string, options?: UseQueryOptions<Tecnico>) => {
  return useQuery({
    queryKey: ['tecnicos', id],
    queryFn: () => tecnicosAPI.getById(id),
    enabled: !!id,
    ...options,
  })
}

export const useAvailableTecnicos = (options?: UseQueryOptions<Tecnico[]>) => {
  return useQuery({
    queryKey: ['tecnicos', 'available'],
    queryFn: tecnicosAPI.getAvailable,
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

export const useCreateTecnico = (options?: UseMutationOptions<Tecnico, Error, Omit<Tecnico, 'id' | 'created_at' | 'updated_at'>>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: tecnicosAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tecnicos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Técnico criado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar técnico: ' + error.message)
    },
    ...options,
  })
}

export const useUpdateTecnico = (options?: UseMutationOptions<Tecnico, Error, { id: string; data: Partial<Tecnico> }>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => tecnicosAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tecnicos'] })
      queryClient.setQueryData(['tecnicos', variables.id], data)
      toast.success('Técnico atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar técnico: ' + error.message)
    },
    ...options,
  })
}

export const useUpdateTecnicoStatus = (options?: UseMutationOptions<Tecnico, Error, { id: string; status: Tecnico['status'] }>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }) => tecnicosAPI.updateStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tecnicos'] })
      queryClient.setQueryData(['tecnicos', variables.id], data)
      toast.success('Status do técnico atualizado!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message)
    },
    ...options,
  })
}

// === Hooks para Atividades ===
export const useAtividades = (
  params?: FiltrosAtividade & PaginationParams,
  options?: UseQueryOptions<RespostaPaginada<Atividade>>
) => {
  return useQuery({
    queryKey: ['atividades', params],
    queryFn: () => atividadesAPI.list(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

export const useAtividade = (id: string, options?: UseQueryOptions<Atividade>) => {
  return useQuery({
    queryKey: ['atividades', id],
    queryFn: () => atividadesAPI.getById(id),
    enabled: !!id,
    ...options,
  })
}

export const useCreateAtividade = (options?: UseMutationOptions<Atividade, Error, Omit<Atividade, 'id' | 'created_at' | 'updated_at'>>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: atividadesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atividades'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Atividade criada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar atividade: ' + error.message)
    },
    ...options,
  })
}

export const useUpdateAtividade = (options?: UseMutationOptions<Atividade, Error, { id: string; data: Partial<Atividade> }>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => atividadesAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['atividades'] })
      queryClient.setQueryData(['atividades', variables.id], data)
      toast.success('Atividade atualizada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar atividade: ' + error.message)
    },
    ...options,
  })
}

export const useUpdateAtividadeStatus = (options?: UseMutationOptions<Atividade, Error, { id: string; status: Atividade['status'] }>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }) => atividadesAPI.updateStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['atividades'] })
      queryClient.setQueryData(['atividades', variables.id], data)
      toast.success('Status da atividade atualizado!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message)
    },
    ...options,
  })
}

export const useImportGLPI = (options?: UseMutationOptions<ImportacaoGLPI, Error, File>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: atividadesAPI.importFromGLPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atividades'] })
      toast.success('Importação iniciada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro na importação: ' + error.message)
    },
    ...options,
  })
}

export const useImportGLPIStatus = (importId: string, options?: UseQueryOptions<ImportacaoGLPI>) => {
  return useQuery({
    queryKey: ['import-glpi', importId],
    queryFn: () => atividadesAPI.getImportStatus(importId),
    enabled: !!importId,
    refetchInterval: (data) => {
      return data?.status === 'processando' ? 2000 : false
    },
    ...options,
  })
}

// === Hooks para Geradores ===
export const useGeradores = (
  params?: PaginationParams,
  options?: UseQueryOptions<RespostaPaginada<Gerador>>
) => {
  return useQuery({
    queryKey: ['geradores', params],
    queryFn: () => geradoresAPI.list(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export const useGerador = (id: string, options?: UseQueryOptions<Gerador>) => {
  return useQuery({
    queryKey: ['geradores', id],
    queryFn: () => geradoresAPI.getById(id),
    enabled: !!id,
    ...options,
  })
}

export const useCreateGerador = (options?: UseMutationOptions<Gerador, Error, Omit<Gerador, 'id' | 'created_at' | 'updated_at'>>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: geradoresAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geradores'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Gerador criado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar gerador: ' + error.message)
    },
    ...options,
  })
}

// === Hooks para Abastecimentos ===
export const useAbastecimentos = (
  params?: PaginationParams & { gerador_id?: string },
  options?: UseQueryOptions<RespostaPaginada<Abastecimento>>
) => {
  return useQuery({
    queryKey: ['abastecimentos', params],
    queryFn: () => abastecimentosAPI.list(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

export const useCreateAbastecimento = (options?: UseMutationOptions<Abastecimento, Error, Omit<Abastecimento, 'id' | 'created_at' | 'updated_at'>>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: abastecimentosAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] })
      queryClient.invalidateQueries({ queryKey: ['geradores'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Abastecimento registrado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao registrar abastecimento: ' + error.message)
    },
    ...options,
  })
}

// === Hooks para Manutenções ===
export const useManutencoes = (
  params?: PaginationParams,
  options?: UseQueryOptions<RespostaPaginada<Manutencao>>
) => {
  return useQuery({
    queryKey: ['manutencoes', params],
    queryFn: () => manutencoesAPI.list(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

export const useCreateManutencao = (options?: UseMutationOptions<Manutencao, Error, Omit<Manutencao, 'id' | 'created_at' | 'updated_at'>>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: manutencoesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Manutenção criada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar manutenção: ' + error.message)
    },
    ...options,
  })
}

// === Hooks para Templates de Checklist ===
export const useChecklistTemplates = (options?: UseQueryOptions<ChecklistTemplate[]>) => {
  return useQuery({
    queryKey: ['checklist-templates'],
    queryFn: checklistTemplatesAPI.list,
    staleTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  })
}

export const useCreateChecklistTemplate = (options?: UseMutationOptions<ChecklistTemplate, Error, Omit<ChecklistTemplate, 'id' | 'created_at' | 'updated_at'>>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: checklistTemplatesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] })
      toast.success('Template de checklist criado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar template: ' + error.message)
    },
    ...options,
  })
}

// === Hooks para Dashboard ===
export const useDashboardStats = (options?: UseQueryOptions<DashboardStats>) => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardAPI.getStats,
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 5 * 60 * 1000, // Atualiza a cada 5 minutos
    ...options,
  })
}

export const useSystemAlerts = (options?: UseQueryOptions<SystemAlert[]>) => {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: dashboardAPI.getAlerts,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 2 * 60 * 1000, // Atualiza a cada 2 minutos
    ...options,
  })
}

export const useSmartActions = (options?: UseQueryOptions<SmartAction[]>) => {
  return useQuery({
    queryKey: ['dashboard', 'smart-actions'],
    queryFn: dashboardAPI.getSmartActions,
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

export const useRecentActivities = (limit: number = 8, options?: UseQueryOptions<Atividade[]>) => {
  return useQuery({
    queryKey: ['dashboard', 'recent-activities', limit],
    queryFn: () => dashboardAPI.getRecentActivities(limit),
    staleTime: 1 * 60 * 1000,
    ...options,
  })
}

export const useUpcomingMaintenances = (limit: number = 5, options?: UseQueryOptions<Manutencao[]>) => {
  return useQuery({
    queryKey: ['dashboard', 'upcoming-maintenances', limit],
    queryFn: () => dashboardAPI.getUpcomingMaintenances(limit),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export const useCapacityMetrics = (options?: UseQueryOptions<MetricasCapacidade[]>) => {
  return useQuery({
    queryKey: ['dashboard', 'capacity-metrics'],
    queryFn: dashboardAPI.getCapacityMetrics,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// === Hooks para Relatórios ===
export const useGenerateReport = (options?: UseMutationOptions<Blob, Error, RelatorioConfig>) => {
  return useMutation({
    mutationFn: relatoriosAPI.generate,
    onSuccess: () => {
      toast.success('Relatório gerado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao gerar relatório: ' + error.message)
    },
    ...options,
  })
}

export const useExportData = (options?: UseMutationOptions<Blob, Error, { entity: string; format: 'excel' | 'csv'; filters?: any }>) => {
  return useMutation({
    mutationFn: ({ entity, format, filters }) => relatoriosAPI.export(entity, format, filters),
    onSuccess: () => {
      toast.success('Dados exportados com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao exportar dados: ' + error.message)
    },
    ...options,
  })
}

// === Hooks para Calendário ===
export const useCalendarEvents = (
  start: Date,
  end: Date,
  options?: UseQueryOptions<EventoCalendario[]>
) => {
  return useQuery({
    queryKey: ['calendario', 'events', start.toISOString(), end.toISOString()],
    queryFn: () => calendarioAPI.getEvents(start, end),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// === Hooks para Usuários ===
export const useUserProfile = (options?: UseQueryOptions<User>) => {
  return useQuery({
    queryKey: ['users', 'profile'],
    queryFn: usersAPI.getProfile,
    staleTime: 10 * 60 * 1000,
    ...options,
  })
}

export const useUpdateUserProfile = (options?: UseMutationOptions<User, Error, Partial<User>>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: usersAPI.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['users', 'profile'], data)
      toast.success('Perfil atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar perfil: ' + error.message)
    },
    ...options,
  })
}

export const useUpdateDashboardConfig = (options?: UseMutationOptions<User, Error, User['dashboard_config']>) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: usersAPI.updateDashboardConfig,
    onSuccess: (data) => {
      queryClient.setQueryData(['users', 'profile'], data)
      toast.success('Configurações do dashboard atualizadas!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar configurações: ' + error.message)
    },
    ...options,
  })
}

// === Hooks para Utilitários ===
export const useCEP = (cep: string, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['utils', 'cep', cep],
    queryFn: () => utilsAPI.getCEP(cep),
    enabled: !!(cep && cep.length === 8),
    staleTime: 60 * 60 * 1000, // 1 hora
    ...options,
  })
}

export const useGeocode = (address: string, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['utils', 'geocode', address],
    queryFn: () => utilsAPI.geocode(address),
    enabled: !!(address && address.length > 5),
    staleTime: 60 * 60 * 1000,
    ...options,
  })
}

export const useReverseGeocode = (lat: number, lng: number, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['utils', 'reverse-geocode', lat, lng],
    queryFn: () => utilsAPI.reverseGeocode(lat, lng),
    enabled: !!(lat && lng),
    staleTime: 60 * 60 * 1000,
    ...options,
  })
}

// === Hook personalizado para invalidar múltiplas queries ===
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient()
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries()
    },
    invalidateDashboard: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    invalidatePOPs: () => {
      queryClient.invalidateQueries({ queryKey: ['pops'] })
    },
    invalidateTecnicos: () => {
      queryClient.invalidateQueries({ queryKey: ['tecnicos'] })
    },
    invalidateAtividades: () => {
      queryClient.invalidateQueries({ queryKey: ['atividades'] })
    },
    invalidateGeradores: () => {
      queryClient.invalidateQueries({ queryKey: ['geradores'] })
    },
    invalidateManutencoes: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] })
    },
  }
}