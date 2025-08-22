import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

import {
  Plus, Minus, Settings, Eye, Save, Download, Filter,
  BarChart3, PieChart, LineChart, Table,
  Building2, Users, Activity, Zap, AlertTriangle
} from 'lucide-react'

interface CustomReportBuilderProps {
  onSave?: (report: CustomReport) => void
  onPreview?: (report: CustomReport) => void
  onGenerate?: (report: CustomReport) => void
  initialReport?: CustomReport
}

interface CustomReport {
  id?: string
  name: string
  description: string
  category: 'operacional' | 'infraestrutura' | 'desempenho' | 'financeiro' | 'personalizado'
  dataSources: string[]
  filters: ReportFilter[]
  metrics: ReportMetric[]
  visualizations: ReportVisualization[]
  schedule?: ReportSchedule
  format: 'pdf' | 'excel' | 'csv'
  recipients?: string[]
}

interface ReportFilter {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in'
  value: any
  label: string
}

interface ReportMetric {
  id: string
  field: string
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct'
  label: string
  format?: 'number' | 'currency' | 'percentage' | 'duration'
}

interface ReportVisualization {
  id: string
  type: 'table' | 'bar_chart' | 'line_chart' | 'pie_chart' | 'metric_card'
  title: string
  dataSource: string
  config: any
}

interface ReportSchedule {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  time: string
  dayOfWeek?: number
  dayOfMonth?: number
}

// Opções disponíveis
const dataSourceOptions = [
  { value: 'pops', label: 'POPs', icon: <Building2 className="h-4 w-4" /> },
  { value: 'tecnicos', label: 'Técnicos', icon: <Users className="h-4 w-4" /> },
  { value: 'atividades', label: 'Atividades', icon: <Activity className="h-4 w-4" /> },
  { value: 'geradores', label: 'Geradores', icon: <Zap className="h-4 w-4" /> },
  { value: 'manutencoes', label: 'Manutenções', icon: <Settings className="h-4 w-4" /> },
  { value: 'alertas', label: 'Alertas', icon: <AlertTriangle className="h-4 w-4" /> }
]

const fieldOptions: Record<string, { value: string; label: string; type: string }[]> = {
  pops: [
    { value: 'nome', label: 'Nome', type: 'string' },
    { value: 'cidade', label: 'Cidade', type: 'string' },
    { value: 'status', label: 'Status', type: 'enum' },
    { value: 'data_instalacao', label: 'Data Instalação', type: 'date' },
    { value: 'capacidade_rack', label: 'Capacidade Rack', type: 'number' }
  ],
  atividades: [
    { value: 'tipo', label: 'Tipo', type: 'enum' },
    { value: 'status', label: 'Status', type: 'enum' },
    { value: 'data_inicio', label: 'Data Início', type: 'date' },
    { value: 'data_fim', label: 'Data Fim', type: 'date' },
    { value: 'duracao', label: 'Duração', type: 'number' }
  ],
  geradores: [
    { value: 'modelo', label: 'Modelo', type: 'string' },
    { value: 'potencia', label: 'Potência', type: 'number' },
    { value: 'combustivel', label: 'Combustível', type: 'enum' },
    { value: 'horas_funcionamento', label: 'Horas Funcionamento', type: 'number' }
  ]
}

const operatorOptions = [
  { value: 'equals', label: 'Igual a' },
  { value: 'contains', label: 'Contém' },
  { value: 'greater_than', label: 'Maior que' },
  { value: 'less_than', label: 'Menor que' },
  { value: 'between', label: 'Entre' },
  { value: 'in', label: 'Em' }
]

const aggregationOptions = [
  { value: 'count', label: 'Contagem' },
  { value: 'sum', label: 'Soma' },
  { value: 'avg', label: 'Média' },
  { value: 'min', label: 'Mínimo' },
  { value: 'max', label: 'Máximo' },
  { value: 'distinct', label: 'Distintos' }
]

const visualizationTypes = [
  { value: 'table', label: 'Tabela', icon: <Table className="h-4 w-4" /> },
  { value: 'bar_chart', label: 'Gráfico de Barras', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'line_chart', label: 'Gráfico de Linha', icon: <LineChart className="h-4 w-4" /> },
  { value: 'pie_chart', label: 'Gráfico de Pizza', icon: <PieChart className="h-4 w-4" /> },
  { value: 'metric_card', label: 'Card de Métrica', icon: <BarChart3 className="h-4 w-4" /> }
]

const CustomReportBuilder: React.FC<CustomReportBuilderProps> = ({
  onSave,
  onPreview,
  onGenerate,
  initialReport
}) => {
  const [report, setReport] = useState<CustomReport>(initialReport || {
    name: '',
    description: '',
    category: 'personalizado',
    dataSources: [],
    filters: [],
    metrics: [],
    visualizations: [],
    format: 'pdf',
    recipients: []
  })

  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    { id: 'basic', label: 'Informações Básicas' },
    { id: 'data', label: 'Fontes de Dados' },
    { id: 'filters', label: 'Filtros' },
    { id: 'metrics', label: 'Métricas' },
    { id: 'visualizations', label: 'Visualizações' },
    { id: 'schedule', label: 'Agendamento' },
    { id: 'preview', label: 'Visualização' }
  ]

  const updateReport = useCallback((updates: Partial<CustomReport>) => {
    setReport(prev => ({ ...prev, ...updates }))
  }, [])

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: `filter_${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
      label: ''
    }
    updateReport({ filters: [...report.filters, newFilter] })
  }

  const updateFilter = (index: number, updates: Partial<ReportFilter>) => {
    const updatedFilters = [...report.filters]
    updatedFilters[index] = { ...updatedFilters[index], ...updates }
    updateReport({ filters: updatedFilters })
  }

  const removeFilter = (index: number) => {
    const updatedFilters = report.filters.filter((_, i) => i !== index)
    updateReport({ filters: updatedFilters })
  }

  const addMetric = () => {
    const newMetric: ReportMetric = {
      id: `metric_${Date.now()}`,
      field: '',
      aggregation: 'count',
      label: ''
    }
    updateReport({ metrics: [...report.metrics, newMetric] })
  }

  const updateMetric = (index: number, updates: Partial<ReportMetric>) => {
    const updatedMetrics = [...report.metrics]
    updatedMetrics[index] = { ...updatedMetrics[index], ...updates }
    updateReport({ metrics: updatedMetrics })
  }

  const removeMetric = (index: number) => {
    const updatedMetrics = report.metrics.filter((_, i) => i !== index)
    updateReport({ metrics: updatedMetrics })
  }

  const addVisualization = () => {
    const newVisualization: ReportVisualization = {
      id: `viz_${Date.now()}`,
      type: 'table',
      title: '',
      dataSource: report.dataSources[0] || '',
      config: {}
    }
    updateReport({ visualizations: [...report.visualizations, newVisualization] })
  }

  const updateVisualization = (index: number, updates: Partial<ReportVisualization>) => {
    const updatedVisualizations = [...report.visualizations]
    updatedVisualizations[index] = { ...updatedVisualizations[index], ...updates }
    updateReport({ visualizations: updatedVisualizations })
  }

  const removeVisualization = (index: number) => {
    const updatedVisualizations = report.visualizations.filter((_, i) => i !== index)
    updateReport({ visualizations: updatedVisualizations })
  }

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome do Relatório</Label>
          <Input
            id="name"
            value={report.name}
            onChange={(e) => updateReport({ name: e.target.value })}
            placeholder="Ex: Relatório Mensal de Operações"
          />
        </div>
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select value={report.category} onValueChange={(value: any) => updateReport({ category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operacional">Operacional</SelectItem>
              <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
              <SelectItem value="desempenho">Desempenho</SelectItem>
              <SelectItem value="financeiro">Financeiro</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={report.description}
          onChange={(e) => updateReport({ description: e.target.value })}
          placeholder="Descreva o objetivo e conteúdo do relatório..."
          rows={3}
        />
      </div>
    </div>
  )

  const renderDataSources = () => (
    <div className="space-y-4">
      <div>
        <Label>Fontes de Dados</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Selecione as entidades que serão incluídas no relatório
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {dataSourceOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={report.dataSources.includes(option.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateReport({ dataSources: [...report.dataSources, option.value] })
                  } else {
                    updateReport({ dataSources: report.dataSources.filter(ds => ds !== option.value) })
                  }
                }}
              />
              <Label htmlFor={option.value} className="flex items-center space-x-2 cursor-pointer">
                {option.icon}
                <span>{option.label}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>
      {report.dataSources.length > 0 && (
        <div>
          <Label>Fontes Selecionadas</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {report.dataSources.map((source) => {
              const option = dataSourceOptions.find(opt => opt.value === source)
              return (
                <Badge key={source} variant="secondary" className="flex items-center space-x-1">
                  {option?.icon}
                  <span>{option?.label}</span>
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  const renderFilters = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Filtros</Label>
          <p className="text-sm text-muted-foreground">
            Configure filtros para refinar os dados do relatório
          </p>
        </div>
        <Button onClick={addFilter} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Filtro
        </Button>
      </div>
      
      {report.filters.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum filtro configurado</p>
          <p className="text-sm">Clique em "Adicionar Filtro" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {report.filters.map((filter, index) => (
            <Card key={filter.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label>Campo</Label>
                    <Select value={filter.field} onValueChange={(value) => updateFilter(index, { field: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {report.dataSources.flatMap(source => 
                          fieldOptions[source]?.map(field => (
                            <SelectItem key={`${source}.${field.value}`} value={`${source}.${field.value}`}>
                              {field.label} ({source})
                            </SelectItem>
                          )) || []
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Operador</Label>
                    <Select value={filter.operator} onValueChange={(value: any) => updateFilter(index, { operator: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operatorOptions.map(op => (
                          <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Valor</Label>
                    <Input
                      value={filter.value}
                      onChange={(e) => updateFilter(index, { value: e.target.value })}
                      placeholder="Valor do filtro"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFilter(index)}
                      className="w-full"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderMetrics = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Métricas</Label>
          <p className="text-sm text-muted-foreground">
            Configure as métricas que serão calculadas no relatório
          </p>
        </div>
        <Button onClick={addMetric} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Métrica
        </Button>
      </div>
      
      {report.metrics.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma métrica configurada</p>
          <p className="text-sm">Clique em "Adicionar Métrica" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {report.metrics.map((metric, index) => (
            <Card key={metric.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label>Campo</Label>
                    <Select value={metric.field} onValueChange={(value) => updateMetric(index, { field: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {report.dataSources.flatMap(source => 
                          fieldOptions[source]?.map(field => (
                            <SelectItem key={`${source}.${field.value}`} value={`${source}.${field.value}`}>
                              {field.label} ({source})
                            </SelectItem>
                          )) || []
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Agregação</Label>
                    <Select value={metric.aggregation} onValueChange={(value: any) => updateMetric(index, { aggregation: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aggregationOptions.map(agg => (
                          <SelectItem key={agg.value} value={agg.value}>{agg.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Rótulo</Label>
                    <Input
                      value={metric.label}
                      onChange={(e) => updateMetric(index, { label: e.target.value })}
                      placeholder="Nome da métrica"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMetric(index)}
                      className="w-full"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderVisualizations = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Visualizações</Label>
          <p className="text-sm text-muted-foreground">
            Configure como os dados serão apresentados no relatório
          </p>
        </div>
        <Button onClick={addVisualization} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Visualização
        </Button>
      </div>
      
      {report.visualizations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma visualização configurada</p>
          <p className="text-sm">Clique em "Adicionar Visualização" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {report.visualizations.map((viz, index) => (
            <Card key={viz.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={viz.type} onValueChange={(value: any) => updateVisualization(index, { type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {visualizationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              {type.icon}
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fonte de Dados</Label>
                    <Select value={viz.dataSource} onValueChange={(value) => updateVisualization(index, { dataSource: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {report.dataSources.map(source => {
                          const option = dataSourceOptions.find(opt => opt.value === source)
                          return (
                            <SelectItem key={source} value={source}>
                              <div className="flex items-center space-x-2">
                                {option?.icon}
                                <span>{option?.label}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Título</Label>
                    <Input
                      value={viz.title}
                      onChange={(e) => updateVisualization(index, { title: e.target.value })}
                      placeholder="Título da visualização"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeVisualization(index)}
                      className="w-full"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderSchedule = () => (
    <div className="space-y-4">
      <div>
        <Label>Agendamento Automático</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Configure para gerar o relatório automaticamente
        </p>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="schedule-enabled"
            checked={report.schedule?.enabled || false}
            onCheckedChange={(checked) => {
              updateReport({
                schedule: {
                  ...report.schedule,
                  enabled: !!checked,
                  frequency: 'monthly',
                  time: '09:00'
                }
              })
            }}
          />
          <Label htmlFor="schedule-enabled">Habilitar agendamento automático</Label>
        </div>
      </div>
      
      {report.schedule?.enabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Frequência</Label>
            <Select 
              value={report.schedule.frequency} 
              onValueChange={(value: any) => updateReport({
                schedule: { ...report.schedule!, frequency: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Horário</Label>
            <Input
              type="time"
              value={report.schedule.time}
              onChange={(e) => updateReport({
                schedule: { ...report.schedule!, time: e.target.value }
              })}
            />
          </div>
        </div>
      )}
      
      <div className="border-t my-4" />
      
      <div>
        <Label>Formato de Saída</Label>
        <Select value={report.format} onValueChange={(value: any) => updateReport({ format: value })}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="excel">Excel</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderPreview = () => (
    <div className="space-y-4">
      <div>
        <Label>Resumo do Relatório</Label>
        <p className="text-sm text-muted-foreground">
          Revise as configurações antes de salvar ou gerar o relatório
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {report.name || 'Relatório sem nome'}
            <Badge variant="outline">{report.category}</Badge>
          </CardTitle>
          <CardDescription>{report.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Fontes de Dados ({report.dataSources.length})</h4>
            <div className="flex flex-wrap gap-2">
              {report.dataSources.map(source => {
                const option = dataSourceOptions.find(opt => opt.value === source)
                return (
                  <Badge key={source} variant="secondary">
                    {option?.label}
                  </Badge>
                )
              })}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Filtros ({report.filters.length})</h4>
            {report.filters.length > 0 ? (
              <div className="space-y-1">
                {report.filters.map((filter, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {filter.field} {filter.operator} {filter.value}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum filtro configurado</p>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Métricas ({report.metrics.length})</h4>
            {report.metrics.length > 0 ? (
              <div className="space-y-1">
                {report.metrics.map((metric, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {metric.label || metric.field} ({metric.aggregation})
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma métrica configurada</p>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Visualizações ({report.visualizations.length})</h4>
            {report.visualizations.length > 0 ? (
              <div className="space-y-1">
                {report.visualizations.map((viz, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {viz.title || viz.type} ({viz.type})
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma visualização configurada</p>
            )}
          </div>
          
          {report.schedule?.enabled && (
            <div>
              <h4 className="font-medium mb-2">Agendamento</h4>
              <p className="text-sm text-muted-foreground">
                {report.schedule.frequency} às {report.schedule.time}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderStepContent = () => {
    switch (steps[activeStep].id) {
      case 'basic':
        return renderBasicInfo()
      case 'data':
        return renderDataSources()
      case 'filters':
        return renderFilters()
      case 'metrics':
        return renderMetrics()
      case 'visualizations':
        return renderVisualizations()
      case 'schedule':
        return renderSchedule()
      case 'preview':
        return renderPreview()
      default:
        return renderBasicInfo()
    }
  }

  const canProceed = () => {
    switch (steps[activeStep].id) {
      case 'basic':
        return report.name.trim() !== ''
      case 'data':
        return report.dataSources.length > 0
      default:
        return true
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              ${index <= activeStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
            `}>
              {index + 1}
            </div>
            <div className={`ml-2 text-sm ${index <= activeStep ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-px mx-4 ${index < activeStep ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[activeStep].label}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
        >
          Anterior
        </Button>
        
        <div className="flex items-center space-x-2">
          {activeStep === steps.length - 1 ? (
            <>
              <Button variant="outline" onClick={() => onPreview?.(report)}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
              <Button onClick={() => onSave?.(report)}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={() => onGenerate?.(report)}>
                <Download className="h-4 w-4 mr-2" />
                Gerar
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
              disabled={!canProceed()}
            >
              Próximo
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomReportBuilder