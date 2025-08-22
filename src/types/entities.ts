// Tipos para o Sistema de Gestão de POPs

// Enums compartilhados
export type StatusPOP = 'operacional' | 'manutencao' | 'critico' | 'desmobilizacao' | 'desmobilizado';
export type TipoPOP = 'primario' | 'secundario';
export type Concessionaria = 'CEMIG' | 'CPFL' | 'Light' | 'Enel' | 'Copel' | 'Celesc' | 'Energisa';
export type FrequenciaManutencao = 'nao_aplicavel' | 'mensal' | 'trimestral' | 'semestral';
export type CargoTecnico = 'tecnico' | 'supervisor' | 'analista' | 'especialista' | 'coordenador' | 'gerente';
export type StatusTecnico = 'disponivel' | 'em_atendimento' | 'ferias' | 'licenca';
export type Especializacao = 'rede' | 'energia' | 'climatizacao' | 'seguranca' | 'backbone';
export type NivelAcesso = 'basico' | 'intermediario' | 'avancado' | 'total';
export type StatusAtividade = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
export type PrioridadeAtividade = 'baixa' | 'media' | 'alta' | 'critica';
export type TipoAtividade = 'manutencao_ar_condicionado' | 'limpeza_pop' | 'instalacao_equipamento' | 'reparo_rede' | 'upgrade_sistema' | 'inspecao_seguranca' | 'manutencao_gerador' | 'backup_dados' | 'monitoramento' | 'documentacao' | 'treinamento' | 'auditoria' | 'emergencia';
export type StatusGerador = 'ativo' | 'manutencao' | 'inativo';
export type TipoCombustivel = 'diesel' | 'gasolina' | 'gas' | 'etanol';
export type StatusManutencao = 'agendada' | 'em_andamento' | 'concluida' | 'atrasada';
export type FrequenciaManutencaoUnica = 'unica' | 'mensal' | 'trimestral' | 'semestral';
export type NivelTanque = 'vazio' | 'baixo' | 'medio' | 'alto' | 'cheio';
export type UserRole = 'admin' | 'supervisor' | 'tecnico';
export type TipoChecklistItem = 'tarefa' | 'texto_livre' | 'numero' | 'multipla_escolha' | 'sim_nao' | 'upload_foto';
export type StatusExecucao = 'nao_iniciado' | 'em_andamento' | 'concluido' | 'cancelado';

// Interfaces para coordenadas
export interface Coordenadas {
  lat: number;
  lng: number;
}

// Interface para POP (Pontos de Presença)
export interface POP {
  id: string;
  nome: string;
  cep?: string;
  logradouro: string;
  numero?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  coordenadas?: Coordenadas;
  tipo: TipoPOP;
  status: StatusPOP;
  regiao?: string;
  quantidade_clientes: number;
  foto_principal?: string;
  fotos_galeria: string[];
  numero_conta_uc?: string;
  concessionaria_energia?: Concessionaria;
  numero_medidor?: string;
  racks: Rack[];
  temperatura?: number;
  backup_ativo: boolean;
  frequencia_manutencao: FrequenciaManutencao;
  created_at: Date;
  updated_at: Date;
}

// Interface para Racks
export interface Rack {
  id: string;
  nome: string;
  posicao: number;
  equipamentos: Equipamento[];
  fotos: string[];
}

// Interface para Equipamentos
export interface Equipamento {
  id: string;
  nome: string;
  modelo?: string;
  fabricante?: string;
  numero_serie?: string;
  status: 'ativo' | 'inativo' | 'manutencao';
  fotos: string[];
}

// Interface para Técnico (Equipe)
export interface Tecnico {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo: CargoTecnico;
  status: StatusTecnico;
  especializacao: Especializacao[];
  regiao_atuacao?: string;
  nivel_acesso: NivelAcesso;
  data_admissao: Date;
  avatar?: string;
  endereco?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

// Interface para Atividade
export interface Activity {
  id: string;
  title: string;
  description: string;
  status: StatusAtividade;
  priority: PrioridadeAtividade;
  assigned_to: number;
  pop_id: string;
  created_at: Date;
  updated_at: Date;
}

// Interface para Atividade (versão em português)
export interface Atividade {
  id: string;
  numero_os?: string;
  id_glpi?: string;
  pop_id: string;
  pop_nome: string; // cache
  gerador_id?: string;
  gerador_nome?: string; // cache
  tecnicos_ids: string[];
  tecnicos_nomes: string[]; // cache
  tipo_atividade: TipoAtividade;
  descricao: string;
  status: StatusAtividade;
  prioridade: PrioridadeAtividade;
  data_agendada: Date;
  data_conclusao?: Date;
  checklist?: ChecklistExecucao;
  observacoes?: string;
  created_at: Date;
  updated_at: Date;
}

// Interface para Gerador
export interface Gerador {
  id: string;
  nome: string;
  cidade: string;
  pop_id: string;
  pop_nome: string; // cache
  modelo?: string;
  fabricante?: string;
  potencia_kva?: number;
  ano?: number;
  numero_serie?: string;
  tipo_combustivel: TipoCombustivel;
  capacidade_tanque?: number;
  consumo_medio_lh?: number;
  foto_url?: string;
  status: StatusGerador;
  ultima_manutencao?: Date;
  proxima_manutencao?: Date;
  frequencia_manutencao: FrequenciaManutencao;
  observacoes?: string;
  created_at: Date;
  updated_at: Date;
}

// Interface para Manutenção (Checklists)
export interface Manutencao {
  id: string;
  titulo: string;
  tipo_ativo: 'POP' | 'Gerador';
  ativo_id: string;
  ativo_nome: string; // cache
  status: StatusManutencao;
  data_agendada: Date;
  data_conclusao?: Date;
  frequencia: FrequenciaManutencaoUnica;
  checklist: ChecklistExecucao;
  observacoes?: string;
  tecnico_responsavel_id?: string;
  fotos_gerais_url: string[];
  atividade_relacionada_id?: string;
  created_at: Date;
  updated_at: Date;
}

// Interface para ChecklistTemplate (Modelos)
export interface ChecklistTemplate {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  itens: ChecklistItem[];
  created_at: Date;
  updated_at: Date;
}

// Interface para itens do checklist
export interface ChecklistItem {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: TipoChecklistItem;
  obrigatorio: boolean;
  opcoes?: string[]; // para múltipla escolha
  ordem: number;
}

// Interface para ChecklistExecution (versão em inglês)
export interface ChecklistExecution {
  id?: string;
  template_id?: string;
  template_name?: string;
  template?: ChecklistTemplate;
  tecnico: {
    id: string;
    nome: string;
  };
  pop?: {
    id: string;
    nome: string;
  };
  status: StatusExecucao;
  data_inicio?: Date;
  data_conclusao?: Date;
  itens: ChecklistItemExecucao[];
  progresso: number; // 0-100
  observacoes?: string;
  created_at: Date;
  updated_at: Date;
}

// Interface para ChecklistExecucao (versão em português)
export interface ChecklistExecucao {
  template_id?: string;
  itens: ChecklistItemExecucao[];
  progresso: number; // 0-100
}

// Interface para execução de item do checklist
export interface ChecklistItemExecucao {
  item_id: string;
  titulo: string;
  tipo: TipoChecklistItem;
  concluido: boolean;
  valor?: string | number | boolean | string[];
  observacoes?: string;
  fotos?: string[];
}

// Interface para Abastecimento
export interface Abastecimento {
  id: string;
  gerador_id: string;
  gerador_nome: string; // cache
  data_abastecimento: Date;
  quantidade_litros: number;
  valor_total: number;
  valor_por_litro?: number;
  tipo_combustivel: TipoCombustivel;
  fornecedor?: string;
  numero_nf?: string;
  tecnico_responsavel_id?: string;
  tecnico_responsavel_nome?: string;
  hodometro_atual?: number;
  nivel_tanque_antes: NivelTanque;
  nivel_tanque_depois: NivelTanque;
  observacoes?: string;
  foto_nota_fiscal?: string;
  foto_bomba?: string;
  created_at: Date;
  updated_at: Date;
}

// Interface para User (Usuários)
export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  dashboard_config: DashboardConfig;
  created_at: Date;
  updated_at: Date;
}

// Interface para configuração do dashboard
export interface DashboardConfig {
  widgets: string[]; // ordem dos widgets
  widgets_enabled: Record<string, boolean>;
}

// Interfaces para estatísticas e métricas
export interface DashboardStats {
  pops_operacionais: number;
  pops_total: number;
  atividades_pendentes: number;
  atividades_total: number;
  tecnicos_disponiveis: number;
  tecnicos_total: number;
  pops_criticos: number;
  geradores_ativos: number;
  manutencoes_atrasadas: number;
}

// Interface para alertas do sistema
export interface SystemAlert {
  id: string;
  tipo: 'manutencao' | 'ferias' | 'critico' | 'capacidade';
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  data: Date;
  link?: string;
}

// Interface para ações inteligentes
export interface SmartAction {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'sugestao' | 'alerta' | 'acao_requerida';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  link: string;
  data: Date;
}

// Interface para filtros
export interface FiltrosPOP {
  status?: StatusPOP[];
  tipo?: TipoPOP[];
  regiao?: string[];
  busca?: string;
}

export interface FiltrosAtividade {
  status?: StatusAtividade[];
  prioridade?: PrioridadeAtividade[];
  tipo?: TipoAtividade[];
  pop_id?: string;
  tecnico_id?: string;
  data_inicio?: Date;
  data_fim?: Date;
  busca?: string;
}

export interface FiltrosTecnico {
  cargo?: CargoTecnico[];
  status?: StatusTecnico[];
  especializacao?: Especializacao[];
  regiao?: string[];
  busca?: string;
}

// Interface para paginação
export interface Paginacao {
  pagina: number;
  limite: number;
  total: number;
  total_paginas: number;
}

// Interface para resposta paginada
export interface RespostaPaginada<T> {
  dados: T[];
  paginacao: Paginacao;
}

// Interface para upload de arquivos
export interface UploadResponse {
  url: string;
  nome: string;
  tamanho: number;
  tipo: string;
}

// Interface para importação GLPI
export interface ImportacaoGLPI {
  id: string;
  arquivo_nome: string;
  status: 'processando' | 'concluida' | 'erro';
  total_registros: number;
  registros_processados: number;
  registros_importados: number;
  registros_duplicados: number;
  erros: string[];
  data_importacao: Date;
}

// Interface para relatórios
export interface RelatorioConfig {
  tipo: 'operacional' | 'infraestrutura' | 'desempenho' | 'financeiro';
  periodo_inicio: Date;
  periodo_fim: Date;
  filtros: Record<string, any>;
  formato: 'pdf' | 'excel' | 'csv';
}

// Interface para métricas de capacidade
export interface MetricasCapacidade {
  pop_id: string;
  pop_nome: string;
  capacidade_maxima: number;
  clientes_atuais: number;
  percentual_utilizacao: number;
  projecao_crescimento: number;
  meses_para_capacidade_maxima?: number;
}

// Interface para eventos do calendário
export interface EventoCalendario {
  id: string;
  titulo: string;
  descricao?: string;
  data_inicio: Date;
  data_fim?: Date;
  tipo: 'atividade' | 'manutencao' | 'ferias' | 'treinamento';
  cor: string;
  link?: string;
}

// Interface para configurações do sistema
export interface ConfiguracaoSistema {
  id: string;
  chave: string;
  valor: string;
  descricao?: string;
  tipo: 'string' | 'number' | 'boolean' | 'json';
  categoria: string;
  updated_at: Date;
}

// Interface para logs de auditoria
export interface LogAuditoria {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  acao: string;
  entidade: string;
  entidade_id: string;
  dados_anteriores?: Record<string, any>;
  dados_novos?: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: Date;
}

// Interface para notificações
export interface Notificacao {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro';
  lida: boolean;
  link?: string;
  created_at: Date;
  read_at?: Date;
}