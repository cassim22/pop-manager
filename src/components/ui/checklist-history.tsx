import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Input } from './input'
import { Label } from './label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog'
import { Progress } from './progress'
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Download,
  FileText
} from 'lucide-react'
import { ChecklistExecution, StatusExecucao } from '@/types/entities'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ChecklistHistoryProps {
  executions: ChecklistExecution[]
  onViewDetails: (execution: ChecklistExecution) => void
  onExportReport: (execution: ChecklistExecution) => void
}

interface FilterState {
  search: string
  status: StatusExecucao | 'all'
  dateFrom: string
  dateTo: string
  technician: string
  template: string
}

const STATUS_CONFIG = {
  nao_iniciado: {
    label: 'Não Iniciado',
    color: 'bg-gray-100 text-gray-800',
    icon: AlertCircle
  },
  em_andamento: {
    label: 'Em Andamento',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock
  },
  concluido: {
    label: 'Concluído',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  cancelado: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  }
} as const

export function ChecklistHistory({
  executions,
  onViewDetails,
  onExportReport
}: ChecklistHistoryProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    technician: '',
    template: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedExecution, setSelectedExecution] = useState<ChecklistExecution | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Filtrar execuções
  const filteredExecutions = executions.filter(execution => {
    const matchesSearch = !filters.search || 
      (execution.template_name && execution.template_name.toLowerCase().includes(filters.search.toLowerCase())) ||
      execution.tecnico.nome.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesStatus = filters.status === 'all' || execution.status === filters.status
    
    const matchesDateFrom = !filters.dateFrom || 
      (execution.data_inicio && new Date(execution.data_inicio) >= new Date(filters.dateFrom))
    
    const matchesDateTo = !filters.dateTo || 
      (execution.data_inicio && new Date(execution.data_inicio) <= new Date(filters.dateTo))
    
    const matchesTechnician = !filters.technician || 
      execution.tecnico.nome.toLowerCase().includes(filters.technician.toLowerCase())
    
    const matchesTemplate = !filters.template || 
      (execution.template_name && execution.template_name.toLowerCase().includes(filters.template.toLowerCase()))

    return matchesSearch && matchesStatus && matchesDateFrom && 
           matchesDateTo && matchesTechnician && matchesTemplate
  })

  const handleViewDetails = (execution: ChecklistExecution) => {
    setSelectedExecution(execution)
    setShowDetailsDialog(true)
    onViewDetails(execution)
  }

  const calculateProgress = (execution: ChecklistExecution) => {
    if (!execution.itens || execution.itens.length === 0) return 0
    const totalItems = execution.itens.length
    const completedItems = execution.itens.filter(item => item.concluido).length
    return Math.round((completedItems / totalItems) * 100)
  }

  const getStatusIcon = (status: StatusExecucao) => {
    const Icon = STATUS_CONFIG[status].icon
    return <Icon className="h-4 w-4" />
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      technician: '',
      template: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Histórico de Checklists</h2>
          <p className="text-gray-600">
            {filteredExecutions.length} de {executions.length} execuções
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Template, técnico ou POP..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value: StatusExecucao | 'all') => 
                    setFilters(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="technician">Técnico</Label>
                <Input
                  id="technician"
                  placeholder="Nome do técnico..."
                  value={filters.technician}
                  onChange={(e) => setFilters(prev => ({ ...prev, technician: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Input
                  id="template"
                  placeholder="Nome do template..."
                  value={filters.template}
                  onChange={(e) => setFilters(prev => ({ ...prev, template: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFrom">Data Inicial</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Data Final</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Execuções */}
      <div className="space-y-4">
        {filteredExecutions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma execução encontrada</h3>
              <p className="text-gray-600">
                {executions.length === 0 
                  ? 'Ainda não há execuções de checklist registradas'
                  : 'Tente ajustar os filtros para encontrar o que procura'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredExecutions.map((execution) => {
            const progress = calculateProgress(execution)
            const statusConfig = STATUS_CONFIG[execution.status]
            
            return (
              <Card key={execution.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {execution.template_name || 'Template não informado'}
                          </h3>
                          <p className="text-gray-600">
                            Execução #{execution.id?.slice(-8) || 'N/A'}
                          </p>
                        </div>
                        
                        <Badge className={cn('flex items-center space-x-1', statusConfig.color)}>
                          {getStatusIcon(execution.status)}
                          <span>{statusConfig.label}</span>
                        </Badge>
                      </div>

                      {/* Informações */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{execution.tecnico.nome}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{execution.pop?.nome || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {execution.data_inicio ? format(new Date(execution.data_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Progresso */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progresso</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {execution.itens?.filter(item => item.concluido).length || 0} de {execution.itens?.length || 0} itens
                          </span>
                          {execution.data_conclusao && (
                            <span>
                              Concluído em {format(new Date(execution.data_conclusao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Observações */}
                      {execution.observacoes && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Observações:</strong> {execution.observacoes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(execution)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      
                      {execution.status === 'concluido' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onExportReport(execution)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Relatório
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalhes da Execução - {selectedExecution?.template?.nome || 'Template não encontrado'}
            </DialogTitle>
            <DialogDescription>
              Execução #{selectedExecution?.id?.slice(-8) || 'N/A'} • {selectedExecution?.data_inicio && format(new Date(selectedExecution.data_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>

          {selectedExecution && (
            <div className="space-y-6">
              {/* Informações Gerais */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={STATUS_CONFIG[selectedExecution.status].color}>
                        {STATUS_CONFIG[selectedExecution.status].label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Técnico:</span>
                      <span>{selectedExecution.tecnico.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Iniciado em:</span>
                      <span>
                        {selectedExecution.data_inicio ? format(new Date(selectedExecution.data_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}
                      </span>
                    </div>
                    {selectedExecution.data_conclusao && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Concluído em:</span>
                        <span>
                          {format(new Date(selectedExecution.data_conclusao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progresso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {calculateProgress(selectedExecution)}%
                      </div>
                      <p className="text-gray-600">
                        {selectedExecution.itens?.length || 0} itens
                      </p>
                    </div>
                    <Progress value={calculateProgress(selectedExecution)} className="h-3" />
                  </CardContent>
                </Card>
              </div>

              {/* Respostas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Respostas do Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedExecution.itens?.map((item, index) => {
                      
                      return (
                          <div key={item.item_id} className="border-l-4 border-gray-200 pl-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium">
                                  {index + 1}. {item.titulo}
                                </h4>
                                <div className="mt-2">
                                  <span className="text-sm font-medium text-gray-600">Resposta: </span>
                                  <span className="text-sm">{item.valor?.toString() || 'Não respondido'}</span>
                                </div>
                                {item.observacoes && (
                                  <p className="text-sm text-gray-600 mt-1">Obs: {item.observacoes}</p>
                                )}
                              
                              </div>
                              <div className="flex items-center">
                                {item.concluido ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Concluído
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Pendente
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Observações Gerais */}
              {selectedExecution.observacoes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Observações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedExecution.observacoes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ChecklistHistory