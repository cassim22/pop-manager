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
  MetricasCapacidade,
  EventoCalendario,
} from '../types/entities'
import { addDays, subDays, subHours } from 'date-fns'

// === Mock Data para POPs ===
export const mockPOPs: POP[] = [
  {
    id: '1',
    nome: 'POP Centro',

    logradouro: 'Rua das Flores, 123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    coordenadas: { lat: -23.5505, lng: -46.6333 },
    status: 'operacional',
    tipo: 'primario',
    quantidade_clientes: 750,


    racks: [
      {
        id: 'rack1',
        nome: 'Rack Principal',
        posicao: 1,
        equipamentos: [
          {
            id: 'eq1',
            nome: 'Switch Principal',

            modelo: 'Cisco Catalyst 9300',
            status: 'ativo',
             fotos: []
            },
          {
            id: 'eq2',
            nome: 'Roteador Core',

            modelo: 'Cisco ASR 1001-X',
            status: 'ativo',
             fotos: []
            }
        ],
        fotos: []
      }
    ],

    
    fotos_galeria: [],
     backup_ativo: true,
     frequencia_manutencao: 'mensal',
     created_at: subDays(new Date(), 30),
     updated_at: subDays(new Date(), 1)
  },
  {
    id: '2',
    nome: 'POP Norte',

    logradouro: 'Av. Paulista, 1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01310-100',
    coordenadas: { lat: -23.5618, lng: -46.6565 },
    status: 'manutencao',
    tipo: 'secundario',
    quantidade_clientes: 320,


    racks: [
      {
        id: 'rack2',
        nome: 'Rack Norte',
        posicao: 2,
        equipamentos: [
          {
            id: 'eq3',
            nome: 'Switch Secundário',

            modelo: 'Cisco Catalyst 2960',
            status: 'manutencao',
             fotos: []
            }
        ],
        fotos: []
      }
    ],

    
    fotos_galeria: [],
     backup_ativo: true,
     frequencia_manutencao: 'mensal',
     created_at: subDays(new Date(), 60),
     updated_at: new Date()
  },
  {
    id: '3',
    nome: 'POP Sul',

    logradouro: 'Rua Augusta, 500',
    bairro: 'Consolação',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01305-000',
    coordenadas: { lat: -23.5489, lng: -46.6388 },
    status: 'manutencao',
    tipo: 'secundario',
    quantidade_clientes: 180,


    racks: [
      {
        id: 'rack3',
        nome: 'Rack Sul',
        posicao: 3,
        equipamentos: [
          {
            id: 'eq4',
            nome: 'Switch Backup',

            modelo: 'HP ProCurve 2510',
            status: 'manutencao',
             fotos: []
            }
        ],
        fotos: []
      }
    ],

    
    fotos_galeria: [],
     backup_ativo: false,
     frequencia_manutencao: 'trimestral',
     created_at: subDays(new Date(), 90),
     updated_at: subHours(new Date(), 2)
  }
]

// === Mock Data para Técnicos ===
export const mockTecnicos: Tecnico[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@empresa.com',
    telefone: '(11) 99999-9999',

    cargo: 'especialista',
    status: 'disponivel',
    especializacao: ['rede', 'backbone'],
    nivel_acesso: 'total',
    ativo: true,
    endereco: 'Rua A, 100, Vila Madalena, São Paulo, SP, 05433-000',
    data_admissao: subDays(new Date(), 365),

    avatar: '/images/avatars/joao-silva.jpg',
    observacoes: 'Especialista em redes de alta capacidade',
    created_at: subDays(new Date(), 365),
    updated_at: subDays(new Date(), 7)
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    telefone: '(11) 88888-8888',

    cargo: 'analista',
    status: 'em_atendimento',
    especializacao: ['energia', 'climatizacao'],
    nivel_acesso: 'basico',
    ativo: true,
    endereco: 'Av. B, 200, Pinheiros, São Paulo, SP, 05422-000',
    data_admissao: subDays(new Date(), 180),
    avatar: '/images/avatars/maria-santos.jpg',
    observacoes: 'Em férias até 15/02',
    created_at: subDays(new Date(), 180),
    updated_at: subDays(new Date(), 14)
  },
  {
    id: '3',
    nome: 'Carlos Oliveira',
    email: 'carlos.oliveira@empresa.com',
    telefone: '(11) 77777-7777',

    cargo: 'tecnico',
    status: 'disponivel',
    especializacao: ['rede', 'energia'],
    nivel_acesso: 'basico',
    ativo: true,
    endereco: 'Rua C, 300, Itaim Bibi, São Paulo, SP, 04534-000',
    data_admissao: subDays(new Date(), 90),

    avatar: '/images/avatars/carlos-oliveira.jpg',
    observacoes: 'Técnico em treinamento',
    created_at: subDays(new Date(), 90),
    updated_at: subDays(new Date(), 3)
  }
]

// === Mock Data para Atividades ===
export const mockAtividades: Atividade[] = [
  {
    id: '1',
    pop_id: '1',
    pop_nome: 'POP Centro',
    tecnicos_ids: ['1'],
    tecnicos_nomes: ['João Silva'],
    tipo_atividade: 'manutencao_gerador',
    descricao: 'Realizar limpeza e verificação dos equipamentos do rack principal',
    status: 'em_andamento',
    prioridade: 'alta',
    data_agendada: subHours(new Date(), 4),
    observacoes: 'Verificar temperatura dos equipamentos',
    created_at: subHours(new Date(), 4),
    updated_at: subHours(new Date(), 1)
  },
  {
    id: '2',
    pop_id: '2',
    pop_nome: 'POP Norte',
    tecnicos_ids: ['2'],
    tecnicos_nomes: ['Maria Santos'],
    tipo_atividade: 'instalacao_equipamento',
    descricao: 'Instalar e configurar novo switch Cisco Catalyst 9300',
    status: 'pendente',
    prioridade: 'media',
    data_agendada: addDays(new Date(), 1),
    observacoes: 'Aguardando chegada do equipamento',
    created_at: subDays(new Date(), 2),
    updated_at: subDays(new Date(), 1)
  },
  {
    id: '3',
    pop_id: '3',
    pop_nome: 'POP Sul',
    tecnicos_ids: ['3'],
    tecnicos_nomes: ['Carlos Oliveira'],
    tipo_atividade: 'manutencao_gerador',
    descricao: 'Investigar e corrigir falha no switch principal',
    status: 'concluida',
    prioridade: 'critica',
    data_agendada: subDays(new Date(), 1),
    data_conclusao: subHours(new Date(), 6),
    observacoes: 'Falha resolvida com substituição de cabo',
    created_at: subDays(new Date(), 2),
    updated_at: subHours(new Date(), 6)
  }
]

// === Mock Data para Geradores ===
export const mockGeradores: Gerador[] = [
  {
    id: '1',
    nome: 'Gerador Principal - Centro',
    cidade: 'São Paulo',
    pop_id: '1',
    pop_nome: 'POP Centro',
    modelo: 'Caterpillar C15',
    fabricante: 'Caterpillar',
    potencia_kva: 500,
    numero_serie: 'CAT123456789',
    tipo_combustivel: 'diesel',
    status: 'ativo',
    proxima_manutencao: addDays(new Date(), 30),
    frequencia_manutencao: 'mensal',
    foto_url: '/images/geradores/gerador-1.jpg',
    observacoes: 'Funcionamento normal',
    created_at: subDays(new Date(), 365),
    updated_at: subHours(new Date(), 1)
  },
  {
    id: '2',
    nome: 'Gerador Backup - Norte',
    cidade: 'Campinas',
    pop_id: '2',
    pop_nome: 'POP Norte',
    modelo: 'Cummins QSK19',
    fabricante: 'Cummins',
    potencia_kva: 300,
    numero_serie: 'CUM987654321',
    tipo_combustivel: 'diesel',
    status: 'ativo',
    proxima_manutencao: addDays(new Date(), 15),
    frequencia_manutencao: 'mensal',
    foto_url: '/images/geradores/gerador-2.jpg',
    observacoes: 'Em standby',
    created_at: subDays(new Date(), 180),
    updated_at: subHours(new Date(), 2)
  }
]

// === Mock Data para Abastecimentos ===
export const mockAbastecimentos: Abastecimento[] = [
  {
    id: '1',
    gerador_id: '1',
    gerador_nome: 'Gerador Principal - Centro',
    data_abastecimento: subDays(new Date(), 7),
    quantidade_litros: 500,
    valor_total: 2425.00,
    valor_por_litro: 4.85,
    tipo_combustivel: 'diesel',
    fornecedor: 'Posto Shell',
    numero_nf: 'NF-123456',
    tecnico_responsavel_id: '1',
    tecnico_responsavel_nome: 'João Silva',
    nivel_tanque_antes: 'baixo',
    nivel_tanque_depois: 'alto',
    foto_nota_fiscal: '/images/abastecimentos/nf-1.jpg',
    foto_bomba: '/images/abastecimentos/bomba-1.jpg',
    observacoes: 'Abastecimento de rotina',
    created_at: subDays(new Date(), 7),
    updated_at: subDays(new Date(), 7)
  },
  {
    id: '2',
    gerador_id: '2',
    gerador_nome: 'Gerador Backup - Norte',
    data_abastecimento: subDays(new Date(), 3),
    quantidade_litros: 300,
    valor_total: 1470.00,
    valor_por_litro: 4.90,
    tipo_combustivel: 'diesel',
    fornecedor: 'Posto Ipiranga',
    numero_nf: 'NF-789012',
    tecnico_responsavel_id: '2',
    tecnico_responsavel_nome: 'Maria Santos',
    nivel_tanque_antes: 'medio',
    nivel_tanque_depois: 'alto',
    foto_nota_fiscal: '/images/abastecimentos/nf-2.jpg',
    foto_bomba: '/images/abastecimentos/bomba-2.jpg',
    observacoes: 'Abastecimento preventivo',
    created_at: subDays(new Date(), 3),
    updated_at: subDays(new Date(), 3)
  }
]

// === Mock Data para Manutenções ===
export const mockManutencoes: Manutencao[] = [
  {
    id: '1',
    titulo: 'Manutenção preventiva mensal - POP Centro',
    tipo_ativo: 'POP' as const,
    ativo_id: '1',
    ativo_nome: 'POP Centro',
    status: 'agendada',
    data_agendada: addDays(new Date(), 7),
    data_conclusao: undefined,
    frequencia: 'mensal' as const,
    checklist: {
       template_id: '1',
       itens: [],
       progresso: 0
     },
    observacoes: 'Manutenção de rotina mensal',
    tecnico_responsavel_id: '1',
    fotos_gerais_url: [],
    created_at: subDays(new Date(), 14),
    updated_at: subDays(new Date(), 14)
  },
  {
    id: '2',
    titulo: 'Correção de vazamento - Gerador Norte',
    tipo_ativo: 'Gerador' as const,
    ativo_id: '2',
    ativo_nome: 'Gerador Backup - Norte',
    status: 'concluida',
    data_agendada: subDays(new Date(), 2),
    data_conclusao: subDays(new Date(), 1),
    frequencia: 'unica' as const,
    checklist: {
       template_id: '2',
       itens: [],
       progresso: 100
     },
    observacoes: 'Vazamento corrigido com sucesso',
    tecnico_responsavel_id: '3',
    fotos_gerais_url: ['/images/manutencoes/manut-2-1.jpg', '/images/manutencoes/manut-2-2.jpg'],
    created_at: subDays(new Date(), 5),
    updated_at: subDays(new Date(), 1)
  }
]

// === Mock Data para Templates de Checklist ===
export const mockChecklistTemplates: ChecklistTemplate[] = [
  {
    id: '1',
    nome: 'Manutenção Preventiva - Equipamentos de Rede',
    descricao: 'Checklist para manutenção preventiva de switches e roteadores',

    itens: [
      {
        id: 'item1',
        titulo: 'Verificar temperatura dos equipamentos',
        descricao: 'Medir temperatura e verificar se está dentro dos parâmetros',
        tipo: 'sim_nao',
        obrigatorio: true,
        ordem: 1
      },
      {
        id: 'item2',
        titulo: 'Realizar limpeza externa',
        descricao: 'Limpar poeira e sujeira dos equipamentos',
        tipo: 'sim_nao',
        obrigatorio: true,
        ordem: 2
      },
      {
        id: 'item3',
        titulo: 'Verificar cabos e conexões',
        descricao: 'Inspecionar integridade dos cabos',
        tipo: 'sim_nao',
        obrigatorio: true,
        ordem: 3
      },
      {
        id: 'item4',
        titulo: 'Observações gerais',
        descricao: 'Anotações sobre o estado geral',
        tipo: 'texto_livre',
        obrigatorio: false,
        ordem: 4
      }
    ],

    created_at: subDays(new Date(), 60),
    updated_at: subDays(new Date(), 30)
  },
  {
    id: '2',
    nome: 'Instalação de Equipamentos',
    descricao: 'Checklist para instalação de novos equipamentos',

    itens: [
      {
        id: 'item1',
        titulo: 'Verificar compatibilidade do rack',
        descricao: 'Confirmar se o equipamento cabe no rack',
        tipo: 'sim_nao',
        obrigatorio: true,
        ordem: 1
      },
      {
        id: 'item2',
        titulo: 'Testar alimentação elétrica',
        descricao: 'Verificar voltagem e estabilidade',
        tipo: 'sim_nao',
        obrigatorio: true,
        ordem: 2
      },
      {
        id: 'item3',
        titulo: 'Configurar endereçamento IP',
        descricao: 'Definir IPs e configurações de rede',
        tipo: 'sim_nao',
        obrigatorio: true,
        ordem: 3
      }
    ],
    created_at: subDays(new Date(), 45),
    updated_at: subDays(new Date(), 20)
  }
]

// === Mock Data para Dashboard ===
export const mockDashboardStats: DashboardStats = {
  pops_operacionais: 1,
  pops_total: 3,
  atividades_pendentes: 1,
  atividades_total: 3,
  tecnicos_disponiveis: 2,
  tecnicos_total: 3,
  pops_criticos: 1,
  geradores_ativos: 2,
  manutencoes_atrasadas: 0
}

export const mockSystemAlerts: SystemAlert[] = [
  {
    id: '1',
    tipo: 'critico',
    titulo: 'POP Sul em estado crítico',
    descricao: 'Switch principal apresentando falhas intermitentes',
    prioridade: 'critica',
    data: subHours(new Date(), 2),
    link: '/pops/3'
  },
  {
    id: '2',
    tipo: 'manutencao',
    titulo: 'Manutenção agendada',
    descricao: 'Manutenção preventiva agendada para POP Centro em 7 dias',
    prioridade: 'media',
    data: subDays(new Date(), 1),
    link: '/maintenance'
  },
  {
    id: '3',
    tipo: 'ferias',
    titulo: 'Técnico em férias',
    descricao: 'Maria Santos estará em férias até 15/02',
    link: '/technicians/2',
    data: subDays(new Date(), 14),
    prioridade: 'baixa'
  }
]

export const mockSmartActions: SmartAction[] = [
  {
    id: '1',
    titulo: 'Verificar POP Sul',
    descricao: 'Investigar falhas no switch principal',
    tipo: 'acao_requerida',
    prioridade: 'critica',
    link: '/pops/3',
    data: subHours(new Date(), 1)
  },
  {
    id: '2',
    titulo: 'Agendar manutenção preventiva',
    descricao: 'POP Norte está próximo da data de manutenção',
    tipo: 'sugestao',
    prioridade: 'media',
    link: '/maintenance/new',
    data: subDays(new Date(), 1)
  },
  {
    id: '3',
    titulo: 'Reabastecer gerador',
    descricao: 'Nível de combustível baixo no gerador principal',
    tipo: 'alerta',
    prioridade: 'alta',
    link: '/supplies/new',
    data: subHours(new Date(), 3)
  }
]

export const mockCapacityMetrics: MetricasCapacidade[] = [
  {
    pop_id: '1',
    pop_nome: 'POP Centro',
    capacidade_maxima: 1000,
    clientes_atuais: 750,
    percentual_utilizacao: 75,
    projecao_crescimento: 5,
    meses_para_capacidade_maxima: 10
  },
  {
    pop_id: '2',
    pop_nome: 'POP Norte',
    capacidade_maxima: 500,
    clientes_atuais: 320,
    percentual_utilizacao: 64,
    projecao_crescimento: 8,
    meses_para_capacidade_maxima: 6
  },
  {
    pop_id: '3',
    pop_nome: 'POP Sul',
    capacidade_maxima: 200,
    clientes_atuais: 180,
    percentual_utilizacao: 90,
    projecao_crescimento: 2,
    meses_para_capacidade_maxima: 2
  }
]

// === Mock Data para Calendário ===
export const mockCalendarEvents: EventoCalendario[] = [
  {
    id: '1',
    titulo: 'Manutenção POP Centro',
    descricao: 'Manutenção preventiva mensal',
    data_inicio: addDays(new Date(), 7),
    data_fim: addDays(new Date(), 7),
    tipo: 'manutencao',
    cor: '#3b82f6',
    link: '/maintenance/1'
  },
  {
    id: '2',
    titulo: 'Instalação Switch - POP Norte',
    descricao: 'Instalação de novo switch Cisco',
    data_inicio: addDays(new Date(), 1),
    data_fim: addDays(new Date(), 1),
    tipo: 'atividade',
    cor: '#10b981',
    link: '/activities/2'
  },
  {
    id: '3',
    titulo: 'Férias - Maria Santos',
    descricao: 'Período de férias da técnica Maria Santos',
    data_inicio: subDays(new Date(), 14),
    data_fim: addDays(new Date(), 1),
    tipo: 'ferias',
    cor: '#f59e0b'
  }
]

// === Mock Data para Usuário ===
export const mockUser: User = {
  id: '1',
  nome: 'Administrador',
  email: 'admin@empresa.com',
  role: 'admin',

  dashboard_config: {
    widgets: [
      'stats',
      'alerts',
      'smart_actions',
      'recent_activities',
      'capacity_metrics',
      'upcoming_maintenances'
    ],
    widgets_enabled: {
      'stats': true,
      'alerts': true,
      'smart_actions': true,
      'recent_activities': true,
      'capacity_metrics': true,
      'upcoming_maintenances': true
    }
  },
  created_at: subDays(new Date(), 365),
  updated_at: subDays(new Date(), 7)
}

// === Funções utilitárias para mock data ===
export const getMockData = () => ({
  pops: mockPOPs,
  tecnicos: mockTecnicos,
  atividades: mockAtividades,
  geradores: mockGeradores,
  abastecimentos: mockAbastecimentos,
  manutencoes: mockManutencoes,
  checklistTemplates: mockChecklistTemplates,
  dashboardStats: mockDashboardStats,
  systemAlerts: mockSystemAlerts,
  smartActions: mockSmartActions,
  capacityMetrics: mockCapacityMetrics,
  calendarEvents: mockCalendarEvents,
  user: mockUser
})

export const generateMockPagination = <T>(data: T[], page: number = 1, limit: number = 10) => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const items = data.slice(startIndex, endIndex)
  
  return {
    data: items,
    pagination: {
      current_page: page,
      per_page: limit,
      total: data.length,
      total_pages: Math.ceil(data.length / limit),
      has_next: endIndex < data.length,
      has_prev: page > 1
    }
  }
}

export default getMockData