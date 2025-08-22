// Banco de dados em memória para demonstração
// Em produção, isso seria substituído por um banco real

// Enums e tipos
export type StatusPOP = 'operacional' | 'manutencao' | 'critico' | 'desmobilizacao' | 'desmobilizado'
export type TipoPOP = 'primario' | 'secundario'
export type Concessionaria = 'CEMIG' | 'CPFL' | 'Light' | 'Enel' | 'Copel' | 'Celesc' | 'Energisa'
export type FrequenciaManutencao = 'nao_aplicavel' | 'mensal' | 'trimestral' | 'semestral'
export type CargoTecnico = 'tecnico' | 'supervisor' | 'analista' | 'especialista' | 'coordenador' | 'gerente'
export type StatusTecnico = 'disponivel' | 'em_atendimento' | 'ferias' | 'licenca'
export type Especializacao = 'rede' | 'energia' | 'climatizacao' | 'seguranca' | 'backbone'
export type NivelAcesso = 'basico' | 'intermediario' | 'avancado' | 'total'
export type StatusAtividade = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'
export type PrioridadeAtividade = 'baixa' | 'media' | 'alta' | 'critica'
export type TipoAtividade = 'manutencao_ar_condicionado' | 'limpeza_pop' | 'instalacao_equipamento' | 'reparo_rede' | 'upgrade_sistema' | 'inspecao_seguranca' | 'manutencao_gerador' | 'backup_dados' | 'monitoramento' | 'documentacao' | 'treinamento' | 'auditoria' | 'emergencia'
export type StatusGerador = 'ativo' | 'manutencao' | 'inativo'
export type TipoCombustivel = 'diesel' | 'gasolina' | 'gas' | 'etanol'
export type StatusManutencao = 'agendada' | 'em_andamento' | 'concluida' | 'atrasada'
export type NivelTanque = 'vazio' | 'baixo' | 'medio' | 'alto' | 'cheio'
export type UserRole = 'admin' | 'supervisor' | 'tecnico'
export type TipoChecklistItem = 'tarefa' | 'texto_livre' | 'numero' | 'multipla_escolha' | 'sim_nao' | 'upload_foto'

// Interfaces
export interface Coordenadas {
  lat: number
  lng: number
}

export interface Equipamento {
  id: string
  nome: string
  modelo?: string
  fabricante?: string
  numero_serie?: string
  status: 'ativo' | 'inativo' | 'manutencao'
  fotos: string[]
}

export interface Rack {
  id: string
  nome: string
  posicao: number
  equipamentos: Equipamento[]
  fotos: string[]
}

export interface POP {
  id: number
  nome: string
  cep?: string
  logradouro: string
  numero?: string
  bairro?: string
  cidade: string
  estado: string
  coordenadas?: Coordenadas
  tipo: TipoPOP
  status: StatusPOP
  regiao?: string
  quantidade_clientes: number
  foto_principal?: string
  fotos_galeria: string[]
  numero_conta_uc?: string
  concessionaria_energia?: Concessionaria
  numero_medidor?: string
  racks: Rack[]
  temperatura?: number
  backup_ativo: boolean
  frequencia_manutencao: FrequenciaManutencao
  created_at: Date
  updated_at: Date
}

export interface Technician {
  id: number
  nome: string
  email: string
  telefone?: string
  cargo: CargoTecnico
  status: StatusTecnico
  especializacao: Especializacao[]
  regiao_atuacao?: string
  nivel_acesso: NivelAcesso
  data_admissao: Date
  avatar?: string
  created_at: Date
  updated_at: Date
}

export interface Activity {
  id: number
  numero_os?: string
  id_glpi?: string
  pop_id?: number
  pop_nome?: string
  gerador_id?: number
  gerador_nome?: string
  tecnicos_ids: number[]
  tecnicos_nomes: string[]
  tipo_atividade: TipoAtividade
  descricao: string
  status: StatusAtividade
  prioridade: PrioridadeAtividade
  data_agendada: Date
  data_conclusao?: Date
  checklist?: any
  observacoes?: string
  created_at: Date
  updated_at: Date
}

export interface Generator {
  id: number
  nome: string
  cidade: string
  pop_id?: number
  pop_nome?: string
  modelo?: string
  fabricante?: string
  potencia_kva?: number
  ano?: number
  numero_serie?: string
  tipo_combustivel: TipoCombustivel
  capacidade_tanque?: number
  consumo_medio_lh?: number
  foto_url?: string
  status: StatusGerador
  ultima_manutencao?: Date
  proxima_manutencao?: Date
  frequencia_manutencao: FrequenciaManutencao
  observacoes?: string
  created_at: Date
  updated_at: Date
}

export interface ChecklistItem {
  id: string
  tipo: TipoChecklistItem
  titulo: string
  descricao?: string
  obrigatorio: boolean
  opcoes?: string[]
  valor_resposta?: any
  fotos?: string[]
  observacoes?: string
}

export interface Manutencao {
  id: number
  titulo: string
  tipo_ativo: 'POP' | 'Gerador'
  ativo_id: number
  ativo_nome: string
  status: StatusManutencao
  data_agendada: Date
  data_conclusao?: Date
  frequencia: 'unica' | 'mensal' | 'trimestral' | 'semestral'
  checklist: ChecklistItem[]
  observacoes?: string
  tecnico_responsavel_id?: number
  fotos_gerais_url: string[]
  atividade_relacionada_id?: number
  created_at: Date
  updated_at: Date
}

export interface ChecklistTemplate {
  id: number
  nome: string
  descricao?: string
  itens: ChecklistItem[]
  created_at: Date
  updated_at: Date
}

export interface Abastecimento {
  id: number
  gerador_id: number
  gerador_nome: string
  data_abastecimento: Date
  quantidade_litros: number
  valor_total: number
  valor_por_litro?: number
  tipo_combustivel: TipoCombustivel
  fornecedor?: string
  numero_nf?: string
  tecnico_responsavel_id?: number
  tecnico_responsavel_nome?: string
  hodometro_atual?: number
  nivel_tanque_antes: NivelTanque
  nivel_tanque_depois: NivelTanque
  observacoes?: string
  foto_nota_fiscal?: string
  foto_bomba?: string
  created_at: Date
  updated_at: Date
}

export interface User {
  id: number
  nome: string
  email: string
  role: UserRole
  dashboard_config: {
    widgets: string[]
  }
  created_at: Date
  updated_at: Date
}

// Dados em memória
let nextId = 1

export const memoryDB = {
  pops: [
    {
      id: nextId++,
      nome: 'POP Centro',
      cep: '01234-567',
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      coordenadas: { lat: -23.5505, lng: -46.6333 },
      tipo: 'primario' as TipoPOP,
      status: 'operacional' as StatusPOP,
      regiao: 'Centro',
      quantidade_clientes: 750,
      foto_principal: 'https://example.com/pop1.jpg',
      fotos_galeria: ['https://example.com/pop1-1.jpg', 'https://example.com/pop1-2.jpg'],
      numero_conta_uc: '12345678',
      concessionaria_energia: 'CEMIG' as Concessionaria,
      numero_medidor: 'MED001',
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
              fabricante: 'Cisco',
              numero_serie: 'CS9300001',
              status: 'ativo',
              fotos: ['https://example.com/eq1.jpg']
            }
          ],
          fotos: ['https://example.com/rack1.jpg']
        }
      ],
      temperatura: 22.5,
      backup_ativo: true,
      frequencia_manutencao: 'mensal' as FrequenciaManutencao,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      nome: 'POP Norte',
      cep: '01310-100',
      logradouro: 'Av. Paulista',
      numero: '456',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      coordenadas: { lat: -23.5618, lng: -46.6565 },
      tipo: 'secundario' as TipoPOP,
      status: 'manutencao' as StatusPOP,
      regiao: 'Norte',
      quantidade_clientes: 320,
      foto_principal: 'https://example.com/pop2.jpg',
      fotos_galeria: ['https://example.com/pop2-1.jpg'],
      numero_conta_uc: '87654321',
      concessionaria_energia: 'CPFL' as Concessionaria,
      numero_medidor: 'MED002',
      racks: [
        {
          id: 'rack2',
          nome: 'Rack Norte',
          posicao: 1,
          equipamentos: [
            {
              id: 'eq2',
              nome: 'Switch Secundário',
              modelo: 'Cisco Catalyst 2960',
              fabricante: 'Cisco',
              numero_serie: 'CS2960001',
              status: 'manutencao',
              fotos: []
            }
          ],
          fotos: []
        }
      ],
      temperatura: 24.0,
      backup_ativo: true,
      frequencia_manutencao: 'trimestral' as FrequenciaManutencao,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      nome: 'POP Sul',
      cep: '01305-000',
      logradouro: 'Rua Augusta',
      numero: '789',
      bairro: 'Consolação',
      cidade: 'São Paulo',
      estado: 'SP',
      coordenadas: { lat: -23.5489, lng: -46.6388 },
      tipo: 'secundario' as TipoPOP,
      status: 'operacional' as StatusPOP,
      regiao: 'Sul',
      quantidade_clientes: 180,
      foto_principal: 'https://example.com/pop3.jpg',
      fotos_galeria: [],
      numero_conta_uc: '11223344',
      concessionaria_energia: 'Light' as Concessionaria,
      numero_medidor: 'MED003',
      racks: [
        {
          id: 'rack3',
          nome: 'Rack Sul',
          posicao: 1,
          equipamentos: [],
          fotos: []
        }
      ],
      temperatura: 23.2,
      backup_ativo: false,
      frequencia_manutencao: 'semestral' as FrequenciaManutencao,
      created_at: new Date(),
      updated_at: new Date()
    }
  ] as POP[],
  
  technicians: [
    {
      id: nextId++,
      nome: 'Carlos Oliveira',
      email: 'carlos@empresa.com',
      telefone: '(11) 99999-1111',
      cargo: 'tecnico' as CargoTecnico,
      status: 'disponivel' as StatusTecnico,
      especializacao: ['energia', 'rede'] as Especializacao[],
      regiao_atuacao: 'Centro',
      nivel_acesso: 'intermediario' as NivelAcesso,
      data_admissao: new Date('2022-01-15'),
      avatar: 'https://example.com/avatars/carlos.jpg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      nome: 'Ana Costa',
      email: 'ana@empresa.com',
      telefone: '(11) 99999-2222',
      cargo: 'supervisor' as CargoTecnico,
      status: 'disponivel' as StatusTecnico,
      especializacao: ['climatizacao', 'energia'] as Especializacao[],
      regiao_atuacao: 'Norte',
      nivel_acesso: 'avancado' as NivelAcesso,
      data_admissao: new Date('2021-03-10'),
      avatar: 'https://example.com/avatars/ana.jpg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      nome: 'Pedro Lima',
      email: 'pedro@empresa.com',
      telefone: '(11) 99999-3333',
      cargo: 'especialista' as CargoTecnico,
      status: 'em_atendimento' as StatusTecnico,
      especializacao: ['rede', 'seguranca'] as Especializacao[],
      regiao_atuacao: 'Sul',
      nivel_acesso: 'avancado' as NivelAcesso,
      data_admissao: new Date('2020-08-20'),
      avatar: 'https://example.com/avatars/pedro.jpg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      nome: 'Lucia Ferreira',
      email: 'lucia@empresa.com',
      telefone: '(11) 99999-4444',
      cargo: 'coordenador' as CargoTecnico,
      status: 'ferias' as StatusTecnico,
      especializacao: ['backbone', 'rede', 'energia'] as Especializacao[],
      regiao_atuacao: 'Geral',
      nivel_acesso: 'total' as NivelAcesso,
      data_admissao: new Date('2019-05-12'),
      avatar: 'https://example.com/avatars/lucia.jpg',
      created_at: new Date(),
      updated_at: new Date()
    }
  ] as Technician[],
  
  generators: [
    {
      id: nextId++,
      nome: 'Gerador Principal POP Centro',
      cidade: 'São Paulo',
      pop_id: 1,
      pop_nome: 'POP Centro',
      modelo: 'Caterpillar C15',
      fabricante: 'Caterpillar',
      potencia_kva: 500,
      ano: 2020,
      numero_serie: 'CAT001234',
      tipo_combustivel: 'diesel' as TipoCombustivel,
      capacidade_tanque: 1000,
      consumo_medio_lh: 45,
      foto_url: 'https://example.com/gerador1.jpg',
      status: 'ativo' as StatusGerador,
      ultima_manutencao: new Date('2024-01-10'),
      proxima_manutencao: new Date('2024-04-10'),
      frequencia_manutencao: 'trimestral' as FrequenciaManutencao,
      observacoes: 'Gerador principal em perfeito funcionamento',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      nome: 'Gerador Backup POP Centro',
      cidade: 'São Paulo',
      pop_id: 1,
      pop_nome: 'POP Centro',
      modelo: 'Cummins QSK19',
      fabricante: 'Cummins',
      potencia_kva: 350,
      ano: 2019,
      numero_serie: 'CUM005678',
      tipo_combustivel: 'diesel' as TipoCombustivel,
      capacidade_tanque: 800,
      consumo_medio_lh: 38,
      foto_url: 'https://example.com/gerador2.jpg',
      status: 'manutencao' as StatusGerador,
      ultima_manutencao: new Date('2024-01-05'),
      proxima_manutencao: new Date('2024-02-05'),
      frequencia_manutencao: 'mensal' as FrequenciaManutencao,
      observacoes: 'Em manutenção preventiva - substituição de filtros',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      nome: 'Gerador Principal POP Norte',
      cidade: 'São Paulo',
      pop_id: 2,
      pop_nome: 'POP Norte',
      modelo: 'Perkins 1306C-E87TAG6',
      fabricante: 'Perkins',
      potencia_kva: 400,
      ano: 2021,
      numero_serie: 'PER009876',
      tipo_combustivel: 'diesel' as TipoCombustivel,
      capacidade_tanque: 900,
      consumo_medio_lh: 42,
      foto_url: 'https://example.com/gerador3.jpg',
      status: 'ativo' as StatusGerador,
      ultima_manutencao: new Date('2023-12-15'),
      proxima_manutencao: new Date('2024-03-15'),
      frequencia_manutencao: 'trimestral' as FrequenciaManutencao,
      observacoes: 'Funcionamento normal',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      nome: 'Gerador Principal POP Sul',
      cidade: 'São Paulo',
      pop_id: 3,
      pop_nome: 'POP Sul',
      modelo: 'Volvo Penta TAD1641GE',
      fabricante: 'Volvo Penta',
      potencia_kva: 450,
      ano: 2022,
      numero_serie: 'VOL001122',
      tipo_combustivel: 'diesel' as TipoCombustivel,
      capacidade_tanque: 950,
      consumo_medio_lh: 40,
      foto_url: 'https://example.com/gerador4.jpg',
      status: 'ativo' as StatusGerador,
      ultima_manutencao: new Date('2024-01-08'),
      proxima_manutencao: new Date('2024-07-08'),
      frequencia_manutencao: 'semestral' as FrequenciaManutencao,
      observacoes: 'Gerador novo, funcionando perfeitamente',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      nome: 'Gerador Principal POP Oeste',
      cidade: 'São Paulo',
      pop_id: undefined,
      pop_nome: undefined,
      modelo: 'Scania DC13 074A',
      fabricante: 'Scania',
      potencia_kva: 520,
      ano: 2018,
      numero_serie: 'SCA003344',
      tipo_combustivel: 'diesel' as TipoCombustivel,
      capacidade_tanque: 1200,
      consumo_medio_lh: 50,
      foto_url: 'https://example.com/gerador5.jpg',
      status: 'inativo' as StatusGerador,
      ultima_manutencao: new Date('2023-11-20'),
      proxima_manutencao: new Date('2024-05-20'),
      frequencia_manutencao: 'semestral' as FrequenciaManutencao,
      observacoes: 'Gerador desativado - POP em processo de desmobilização',
      created_at: new Date(),
      updated_at: new Date()
    }
  ] as Generator[],
  
  activities: [
    {
      id: nextId++,
      numero_os: 'OS-2024-001',
      id_glpi: 'GLPI-12345',
      pop_id: 1,
      pop_nome: 'POP Centro',
      gerador_id: undefined,
      gerador_nome: undefined,
      tecnicos_ids: [5],
      tecnicos_nomes: ['Carlos Oliveira'],
      tipo_atividade: 'manutencao_ar_condicionado' as TipoAtividade,
      descricao: 'Manutenção preventiva mensal do sistema de ar condicionado',
      status: 'concluida' as StatusAtividade,
      prioridade: 'alta' as PrioridadeAtividade,
      data_agendada: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      data_conclusao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      checklist: undefined,
      observacoes: 'Verificação geral dos sistemas concluída com sucesso',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      numero_os: 'OS-2024-002',
      id_glpi: undefined,
      pop_id: 2,
      pop_nome: 'POP Norte',
      gerador_id: undefined,
      gerador_nome: undefined,
      tecnicos_ids: [6],
      tecnicos_nomes: ['Ana Costa'],
      tipo_atividade: 'manutencao_gerador' as TipoAtividade,
      descricao: 'Substituição de filtros de ar e combustível do gerador',
      status: 'em_andamento' as StatusAtividade,
      prioridade: 'media' as PrioridadeAtividade,
      data_agendada: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      data_conclusao: undefined,
      checklist: undefined,
      observacoes: undefined,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      numero_os: 'OS-2024-003',
      id_glpi: 'GLPI-12347',
      pop_id: 3,
      pop_nome: 'POP Sul',
      gerador_id: undefined,
      gerador_nome: undefined,
      tecnicos_ids: [7],
      tecnicos_nomes: ['Pedro Lima'],
      tipo_atividade: 'inspecao_seguranca' as TipoAtividade,
      descricao: 'Inspeção elétrica e verificação do sistema de segurança',
      status: 'pendente' as StatusAtividade,
      prioridade: 'alta' as PrioridadeAtividade,
      data_agendada: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      data_conclusao: undefined,
      checklist: undefined,
      observacoes: undefined,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      numero_os: 'OS-2024-004',
      id_glpi: undefined,
      pop_id: 1,
      pop_nome: 'POP Centro',
      gerador_id: undefined,
      gerador_nome: undefined,
      tecnicos_ids: [5],
      tecnicos_nomes: ['Carlos Oliveira'],
      tipo_atividade: 'manutencao_gerador' as TipoAtividade,
      descricao: 'Abastecimento e reposição do tanque de diesel',
      status: 'pendente' as StatusAtividade,
      prioridade: 'media' as PrioridadeAtividade,
      data_agendada: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      data_conclusao: undefined,
      checklist: undefined,
      observacoes: undefined,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      numero_os: 'OS-2024-005',
      id_glpi: 'GLPI-12349',
      pop_id: undefined,
      pop_nome: undefined,
      gerador_id: 13,
      gerador_nome: 'Gerador Principal POP Oeste',
      tecnicos_ids: [8],
      tecnicos_nomes: ['Lucia Ferreira'],
      tipo_atividade: 'monitoramento' as TipoAtividade,
      descricao: 'Teste completo de funcionamento do gerador',
      status: 'pendente' as StatusAtividade,
      prioridade: 'baixa' as PrioridadeAtividade,
      data_agendada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      data_conclusao: undefined,
      checklist: undefined,
      observacoes: undefined,
      created_at: new Date(),
      updated_at: new Date()
    }
  ] as Activity[],

  manutencoes: [
    {
      id: nextId++,
      titulo: 'Manutenção Preventiva Gerador Centro',
      tipo_ativo: 'Gerador' as 'POP' | 'Gerador',
      ativo_id: 9,
      ativo_nome: 'Gerador Principal POP Centro',
      status: 'concluida' as StatusManutencao,
      data_agendada: new Date('2024-01-10T08:00:00'),
      data_conclusao: new Date('2024-01-10T11:30:00'),
      frequencia: 'trimestral' as 'unica' | 'mensal' | 'trimestral' | 'semestral',
      checklist: [
        {
          id: 'check1',
          tipo: 'sim_nao' as TipoChecklistItem,
          titulo: 'Verificar nível de óleo',
          obrigatorio: true,
          valor_resposta: true,
          observacoes: 'Nível adequado'
        },
        {
          id: 'check2',
          tipo: 'sim_nao' as TipoChecklistItem,
          titulo: 'Testar partida automática',
          obrigatorio: true,
          valor_resposta: true,
          observacoes: 'Funcionando corretamente'
        }
      ],
      observacoes: 'Manutenção preventiva realizada conforme cronograma',
      tecnico_responsavel_id: 5,
      fotos_gerais_url: ['https://example.com/manutencao1.jpg'],
      atividade_relacionada_id: 9,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      titulo: 'Manutenção Corretiva POP Norte',
      tipo_ativo: 'POP' as 'POP' | 'Gerador',
      ativo_id: 2,
      ativo_nome: 'POP Norte',
      status: 'em_andamento' as StatusManutencao,
      data_agendada: new Date('2024-01-16T14:00:00'),
      data_conclusao: undefined,
      frequencia: 'unica' as 'unica' | 'mensal' | 'trimestral' | 'semestral',
      checklist: [
        {
          id: 'check3',
          tipo: 'texto_livre' as TipoChecklistItem,
          titulo: 'Diagnosticar falha',
          obrigatorio: true,
          valor_resposta: 'Problema no sistema de climatização',
          observacoes: 'Necessário substituir filtros'
        }
      ],
      observacoes: 'Reparo em andamento - aguardando peças',
      tecnico_responsavel_id: 6,
      fotos_gerais_url: [],
      atividade_relacionada_id: 10,
      created_at: new Date(),
      updated_at: new Date()
    }
  ] as Manutencao[],

  checklistTemplates: [
    {
      id: nextId++,
      nome: 'Manutenção Preventiva Gerador',
      descricao: 'Template padrão para manutenção preventiva de geradores',
      itens: [
        {
          id: 'template1',
          tipo: 'sim_nao' as TipoChecklistItem,
          titulo: 'Verificar nível de óleo do motor',
          obrigatorio: true
        },
        {
          id: 'template2',
          tipo: 'sim_nao' as TipoChecklistItem,
          titulo: 'Testar partida automática',
          obrigatorio: true
        },
        {
          id: 'template3',
          tipo: 'upload_foto' as TipoChecklistItem,
          titulo: 'Foto do painel de controle',
          obrigatorio: false
        }
      ],
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      nome: 'Inspeção Ar Condicionado',
      descricao: 'Template para inspeção de sistemas de climatização',
      itens: [
        {
          id: 'template4',
          tipo: 'numero' as TipoChecklistItem,
          titulo: 'Temperatura ambiente (°C)',
          obrigatorio: true
        },
        {
          id: 'template5',
          tipo: 'multipla_escolha' as TipoChecklistItem,
          titulo: 'Estado dos filtros',
          opcoes: ['Limpo', 'Sujo', 'Necessita troca'],
          obrigatorio: true
        }
      ],
      created_at: new Date(),
      updated_at: new Date()
    }
  ] as ChecklistTemplate[],

  abastecimentos: [
    {
      id: nextId++,
      gerador_id: 9,
      gerador_nome: 'Gerador Principal POP Centro',
      data_abastecimento: new Date('2024-01-12T10:30:00'),
      quantidade_litros: 500,
      valor_total: 2750.00,
      valor_por_litro: 5.50,
      tipo_combustivel: 'diesel' as TipoCombustivel,
      fornecedor: 'Distribuidora Petrobras',
      numero_nf: 'NF-2024-001234',
      tecnico_responsavel_id: 5,
      tecnico_responsavel_nome: 'Carlos Oliveira',
      hodometro_atual: 1250,
      nivel_tanque_antes: 'baixo' as NivelTanque,
      nivel_tanque_depois: 'alto' as NivelTanque,
      observacoes: 'Abastecimento de rotina - tanque estava baixo',
      foto_nota_fiscal: 'https://example.com/nf1.jpg',
      foto_bomba: 'https://example.com/bomba1.jpg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      gerador_id: 12,
      gerador_nome: 'Gerador Principal POP Sul',
      data_abastecimento: new Date('2024-01-14T15:45:00'),
      quantidade_litros: 300,
      valor_total: 1590.00,
      valor_por_litro: 5.30,
      tipo_combustivel: 'diesel' as TipoCombustivel,
      fornecedor: 'Auto Posto Central',
      numero_nf: 'NF-2024-005678',
      tecnico_responsavel_id: 7,
      tecnico_responsavel_nome: 'Pedro Lima',
      hodometro_atual: 890,
      nivel_tanque_antes: 'baixo' as NivelTanque,
      nivel_tanque_depois: 'medio' as NivelTanque,
      observacoes: 'Abastecimento emergencial após teste de funcionamento',
      foto_nota_fiscal: undefined,
      foto_bomba: undefined,
      created_at: new Date(),
      updated_at: new Date()
    }
  ] as Abastecimento[],

  users: [
    {
      id: nextId++,
      nome: 'Administrador Sistema',
      email: 'admin@empresa.com',
      role: 'admin' as UserRole,
      dashboard_config: {
        widgets: ['pops-status', 'activities-pending', 'technicians-status', 'generators-status']
      },
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      nome: 'Supervisor Operacional',
      email: 'supervisor@empresa.com',
      role: 'supervisor' as UserRole,
      dashboard_config: {
        widgets: ['activities-pending', 'technicians-status', 'maintenance-schedule']
      },
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: nextId++,
      nome: 'Técnico Padrão',
      email: 'tecnico@empresa.com',
      role: 'tecnico' as UserRole,
      dashboard_config: {
        widgets: ['my-activities', 'pops-status']
      },
      created_at: new Date(),
      updated_at: new Date()
    }
  ] as User[]
}

// Função para obter próximo ID
export function getNextId(): number {
  return nextId++
}

// Funções utilitárias para simular queries
export function findById<T extends { id: number }>(collection: T[], id: number): T | undefined {
  return collection.find(item => item.id === id)
}

export function findByField<T>(collection: T[], field: keyof T, value: any): T[] {
  return collection.filter(item => item[field] === value)
}

export function updateById<T extends { id: number; updated_at: Date }>(collection: T[], id: number, updates: Partial<T>): T | null {
  const index = collection.findIndex(item => item.id === id)
  if (index === -1) return null
  
  collection[index] = {
    ...collection[index],
    ...updates,
    updated_at: new Date()
  }
  
  return collection[index]
}

export function deleteById<T extends { id: number }>(collection: T[], id: number): boolean {
  const index = collection.findIndex(item => item.id === id)
  if (index === -1) return false
  
  collection.splice(index, 1)
  return true
}