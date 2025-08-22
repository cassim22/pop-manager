// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'moment/locale/pt-br'
import ChecklistExecutor from '@/components/ui/checklist-executor'
import ChecklistTemplateManager from '@/components/ui/checklist-template-manager'
import ChecklistHistory from '@/components/ui/checklist-history'
import { 
  Wrench, 
  Plus, 
  Filter, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Building2, 
  Zap,
  FileText,
  Settings,
  Play,
  CheckSquare,
  GripVertical,
  X,

} from 'lucide-react'
import { useManutencoes, useChecklistTemplates, useCreateChecklistTemplate } from '@/hooks/useAPI'
import { Manutencao, StatusManutencao, ChecklistTemplate, ChecklistItem, TipoChecklistItem, ChecklistExecution } from '@/types/entities'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

// Configurar moment.js para português brasileiro
moment.locale('pt-br')
const localizer = momentLocalizer(moment)

// Mock data para execuções de checklist
const mockExecutions: ChecklistExecution[] = [
  {
    id: '1',
    template_id: '1',
    template_name: 'Manutenção Preventiva POP',
    template: {
        id: '1',
        nome: 'Manutenção Preventiva POP',
        descricao: 'Checklist padrão para manutenção preventiva',
        itens: [],
        created_at: new Date(),
        updated_at: new Date()
      },
    tecnico: {
      id: '1',
      nome: 'João Silva'
    },
 
    status: 'concluido',
    data_inicio: new Date(Date.now() - 86400000),
    data_conclusao: new Date(),
    itens: [],
    progresso: 100,
    observacoes: 'Manutenção realizada com sucesso',
    created_at: new Date(),
    updated_at: new Date()
  }
]

const getStatusLabel = (status: StatusManutencao) => {
  switch (status) {
    case 'agendada': return 'Agendada'
    case 'em_andamento': return 'Em Andamento'
    case 'concluida': return 'Concluída'
    case 'atrasada': return 'Atrasada'
    default: return status
  }
}

const getStatusIcon = (status: StatusManutencao) => {
  switch (status) {
    case 'agendada': return <Calendar className="h-4 w-4" />
    case 'em_andamento': return <Play className="h-4 w-4" />
    case 'concluida': return <CheckCircle className="h-4 w-4" />
    case 'atrasada': return <AlertTriangle className="h-4 w-4" />
    default: return <Clock className="h-4 w-4" />
  }
}



const MaintenanceCard: React.FC<{ 
  maintenance: Manutencao;
  onStartExecution: () => void;
  onContinueExecution: () => void;
}> = ({ maintenance, onStartExecution, onContinueExecution }) => {
  const progressPercentage = maintenance.checklist?.progresso || 0
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center">
              {maintenance.tipo_ativo === 'POP' ? 
                <Building2 className="h-5 w-5 mr-2 text-blue-600" /> : 
                <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              }
              {maintenance.titulo}
            </CardTitle>
            <CardDescription className="mt-1">
              {maintenance.ativo_nome}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant={maintenance.status === 'concluida' ? 'default' : 
                           maintenance.status === 'atrasada' ? 'destructive' : 'secondary'}>
              {getStatusIcon(maintenance.status)}
              <span className="ml-1">{getStatusLabel(maintenance.status)}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          {maintenance.status !== 'agendada' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progresso</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progressPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Agendada: {formatDate(maintenance.data_agendada)}</span>
              </div>
              {maintenance.data_conclusao && (
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Concluída: {formatDate(maintenance.data_conclusao)}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>Técnico: {maintenance.tecnico_responsavel_id || 'Não atribuído'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FileText className="h-4 w-4 mr-2" />
                <span>Frequência: {maintenance.frequencia}</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              {maintenance.checklist?.itens && (
                <span className="text-sm text-gray-600">
                  {maintenance.checklist.itens.filter(item => item.concluido).length} de {maintenance.checklist.itens.length} itens
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {maintenance.status === 'agendada' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onStartExecution}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Iniciar
                </Button>
              )}
              {maintenance.status === 'em_andamento' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onContinueExecution}
                >
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Continuar
                </Button>
              )}
              <Button size="sm" variant="ghost">
                Ver Detalhes
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Maintenance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusManutencao | 'all'>('all')
  const [activeTab, setActiveTab] = useState('manutencoes')
  
  // Estados para templates
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null)
  const [selectedExecution, setSelectedExecution] = useState<ChecklistExecution | null>(null)
  const [showExecutorDialog, setShowExecutorDialog] = useState(false)
  const [templateForm, setTemplateForm] = useState({
    nome: '',
    descricao: '',
    itens: [] as ChecklistItem[]
  })
  const [newItem, setNewItem] = useState({
    titulo: '',
    descricao: '',
    tipo: 'sim_nao' as TipoChecklistItem,
    obrigatorio: false
  })
  
  
  const { data: maintenanceData, isLoading, error } = useManutencoes({
    page: 1,
    limit: 50
  })
  
  const { data: templates = [] } = useChecklistTemplates()
  const createTemplateMutation = useCreateChecklistTemplate()

  // Estados para calendário
  const [calendarView, setCalendarView] = useState(Views.MONTH)
  const [calendarDate, setCalendarDate] = useState(new Date())

  // Transformar dados de manutenção para o formato do calendário
  const calendarEvents = useMemo(() => {
    if (!maintenanceData?.dados) return []
    
    return maintenanceData.dados.map(maintenance => ({
      id: maintenance.id,
      title: `${maintenance.titulo} - ${maintenance.ativo_nome}`,
      start: new Date(maintenance.data_agendada),
      end: new Date(maintenance.data_agendada),
      resource: maintenance,
      allDay: false
    }))
  }, [maintenanceData?.dados])

  // Função para customizar o estilo dos eventos no calendário
  const eventStyleGetter = (event: any) => {
    const maintenance = event.resource as Manutencao
    let backgroundColor = '#3174ad'
    
    switch (maintenance.status) {
      case 'agendada':
        backgroundColor = '#3b82f6' // azul
        break
      case 'em_andamento':
        backgroundColor = '#f59e0b' // amarelo
        break
      case 'concluida':
        backgroundColor = '#10b981' // verde
        break
      case 'atrasada':
        backgroundColor = '#ef4444' // vermelho
        break
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  // Funções para gerenciar templates
  const handleSaveTemplate = async () => {
    if (!templateForm.nome.trim()) {
      toast.error('Nome do template é obrigatório')
      return
    }

    if (templateForm.itens.length === 0) {
      toast.error('Adicione pelo menos um item ao template')
      return
    }

    try {
      await createTemplateMutation.mutateAsync({
        nome: templateForm.nome,
        descricao: templateForm.descricao,
        itens: templateForm.itens
      })
      
      setShowTemplateDialog(false)
      setSelectedTemplate(null)
      setTemplateForm({ nome: '', descricao: '', itens: [] })
      toast.success('Template salvo com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar template')
    }
  }

  const handleAddItem = () => {
    if (!newItem.titulo.trim()) {
      toast.error('Título do item é obrigatório')
      return
    }

    const item: ChecklistItem = {
      id: Math.random().toString(36).substr(2, 9),
      titulo: newItem.titulo,
      descricao: newItem.descricao,
      tipo: newItem.tipo,
      obrigatorio: newItem.obrigatorio,
      ordem: templateForm.itens.length + 1,
      opcoes: newItem.tipo === 'multipla_escolha' ? ['Opção 1', 'Opção 2'] : undefined
    }

    setTemplateForm(prev => ({
      ...prev,
      itens: [...prev.itens, item]
    }))

    setNewItem({
      titulo: '',
      descricao: '',
      tipo: 'sim_nao',
      obrigatorio: false
    })
  }

  const handleRemoveItem = (itemId: string) => {
    setTemplateForm(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.id !== itemId)
    }))
  }



  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manutenções</h1>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar manutenções</h3>
          <p className="text-gray-500">Tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }

  const maintenances = maintenanceData?.dados || []
  
  // Statistics
  const stats = {
    total: maintenances.length,
    agendadas: maintenances.filter(m => m.status === 'agendada').length,
    em_andamento: maintenances.filter(m => m.status === 'em_andamento').length,
    concluidas: maintenances.filter(m => m.status === 'concluida').length,
    atrasadas: maintenances.filter(m => m.status === 'atrasada').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manutenções</h1>
          <p className="text-muted-foreground">
            Gerenciamento de manutenções e checklists ({maintenances.length} registros)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Manutenção
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Agendadas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.agendadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Play className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.em_andamento}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{stats.concluidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.atrasadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manutencoes">Manutenções</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="manutencoes" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar manutenções..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusManutencao | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todos os Status</option>
              <option value="agendada">Agendadas</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluídas</option>
              <option value="atrasada">Atrasadas</option>
            </select>
          </div>

          {/* Maintenance List */}
          <div className="grid gap-4">
            {maintenances.length > 0 ? (
              maintenances.map((maintenance) => (
                <MaintenanceCard 
                  key={maintenance.id} 
                  maintenance={maintenance}
                  onStartExecution={() => {
                    setSelectedExecution(mockExecutions[0])
                    setShowExecutorDialog(true)
                  }}
                  onContinueExecution={() => {
                    setSelectedExecution(mockExecutions[0])
                    setShowExecutorDialog(true)
                  }}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma manutenção encontrada
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Tente ajustar os filtros de busca.' 
                      : 'Comece criando sua primeira manutenção.'}
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Manutenção
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
            <ChecklistTemplateManager 
              templates={templates}
              onSave={(template) => {
                createTemplateMutation.mutateAsync(template)
                toast.success('Template criado com sucesso!')
              }}
              onUpdate={(id, template) => {
                console.log('Atualizar template:', id, template)
                toast.success('Template atualizado com sucesso!')
              }}
              onDelete={(id) => {
                console.log('Deletar template:', id)
                toast.success('Template deletado com sucesso!')
              }}
              onDuplicate={(template) => {
                const duplicated = {
                  ...template,
                  nome: `${template.nome} (Cópia)`,
                  id: undefined,
                  created_at: undefined,
                  updated_at: undefined
                }
                createTemplateMutation.mutateAsync(duplicated)
                toast.success('Template duplicado com sucesso!')
              }}
            />
          </TabsContent>

        <TabsContent value="calendario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendário de Manutenções
              </CardTitle>
              <CardDescription>
                Visualize todas as manutenções agendadas em formato de calendário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-600">Agendada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-600">Em Andamento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Concluída</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600">Atrasada</span>
                </div>
              </div>
              
              <div className="h-[600px]">
                <BigCalendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  view={calendarView}
                  onView={(view) => setCalendarView(view as 'month')}
                  date={calendarDate}
                  onNavigate={setCalendarDate}
                  eventPropGetter={eventStyleGetter}
                  messages={{
                    next: 'Próximo',
                    previous: 'Anterior',
                    today: 'Hoje',
                    month: 'Mês',
                    week: 'Semana',
                    day: 'Dia',
                    agenda: 'Agenda',
                    date: 'Data',
                    time: 'Hora',
                    event: 'Evento',
                    noEventsInRange: 'Não há manutenções neste período',
                    showMore: (total: number) => `+ Ver mais (${total})`
                  }}
                  formats={{
                    dateFormat: 'DD',
                    dayFormat: (date: Date, culture?: string, localizer?: any) => localizer?.format(date, 'dddd', culture) || '',
                    dayHeaderFormat: (date: Date, culture?: string, localizer?: any) => localizer?.format(date, 'dddd DD/MM', culture) || '',
                    monthHeaderFormat: (date: Date, culture?: string, localizer?: any) => localizer?.format(date, 'MMMM YYYY', culture) || '',
                    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }, culture?: string, localizer?: any) => 
                      `${localizer?.format(start, 'DD/MM', culture)} - ${localizer?.format(end, 'DD/MM/YYYY', culture)}`
                  }}
                  onSelectEvent={(event: any) => {
                    const maintenance = event.resource as Manutencao
                    toast.info(`Manutenção: ${maintenance.titulo}`, {
                      description: `Status: ${getStatusLabel(maintenance.status)} | Data: ${formatDate(maintenance.data_agendada, 'dd/MM/yyyy HH:mm')}`
                    })
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
            <ChecklistHistory 
              executions={mockExecutions}
              onViewDetails={(execution) => {
                console.log('Ver detalhes:', execution)
              }}
              onExportReport={(execution) => {
                console.log('Exportar relatório:', execution)
                toast.success('Relatório exportado com sucesso!')
              }}
            />
          </TabsContent>
      </Tabs>

      {/* Diálogo do Executor de Checklist */}
      <Dialog open={showExecutorDialog} onOpenChange={setShowExecutorDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Executar Checklist</DialogTitle>
            <DialogDescription>
              Execute o checklist de manutenção passo a passo
            </DialogDescription>
          </DialogHeader>
          {selectedExecution && selectedExecution.template && (
            <ChecklistExecutor
              template={selectedExecution.template}
              execution={selectedExecution}
              onSave={(execution) => {
                console.log('Checklist salvo:', execution)
                toast.success('Progresso salvo com sucesso!')
              }}
              onComplete={(execution) => {
                console.log('Checklist concluído:', execution)
                setShowExecutorDialog(false)
                toast.success('Checklist concluído com sucesso!')
              }}
              onCancel={() => setShowExecutorDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para criar/editar template */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate 
                ? 'Edite as informações do template de checklist'
                : 'Crie um novo template de checklist para reutilizar em manutenções'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações básicas */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Template *</Label>
                <Input
                  id="nome"
                  value={templateForm.nome}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Manutenção Preventiva - Equipamentos de Rede"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={templateForm.descricao}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva o propósito deste template..."
                  rows={3}
                />
              </div>
            </div>

            {/* Adicionar novo item */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Adicionar Item ao Checklist</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-titulo">Título do Item *</Label>
                  <Input
                    id="item-titulo"
                    value={newItem.titulo}
                    onChange={(e) => setNewItem(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: Verificar temperatura dos equipamentos"
                  />
                </div>
                <div>
                  <Label htmlFor="item-tipo">Tipo</Label>
                  <Select
                    value={newItem.tipo}
                    onValueChange={(value: TipoChecklistItem) => setNewItem(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sim_nao">Sim/Não</SelectItem>
                      <SelectItem value="tarefa">Tarefa</SelectItem>
                      <SelectItem value="texto_livre">Texto Livre</SelectItem>
                      <SelectItem value="numero">Número</SelectItem>
                      <SelectItem value="multipla_escolha">Múltipla Escolha</SelectItem>
                      <SelectItem value="upload_foto">Upload de Foto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="item-descricao">Descrição</Label>
                <Input
                  id="item-descricao"
                  value={newItem.descricao}
                  onChange={(e) => setNewItem(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição adicional do item..."
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newItem.obrigatorio}
                    onChange={(e) => setNewItem(prev => ({ ...prev, obrigatorio: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Item obrigatório</span>
                </label>
                <Button onClick={handleAddItem} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Item
                </Button>
              </div>
            </div>

            {/* Lista de itens */}
            {templateForm.itens.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Itens do Checklist ({templateForm.itens.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {templateForm.itens.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{item.titulo}</span>
                            {item.obrigatorio && (
                              <span className="text-red-500 text-sm">*</span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {item.tipo.replace('_', ' ')}
                            </Badge>
                          </div>
                          {item.descricao && (
                            <p className="text-sm text-gray-600 mt-1">{item.descricao}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate} disabled={createTemplateMutation.isPending}>
              {createTemplateMutation.isPending ? 'Salvando...' : 'Salvar Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Maintenance