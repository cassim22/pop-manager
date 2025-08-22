import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import {
  TrendingUp, Activity, AlertTriangle, CheckCircle2,
  Clock, Zap, Building2, Users, Settings, Download
} from 'lucide-react'

interface ReportAnalyticsProps {
  reportType: 'operacional' | 'infraestrutura' | 'desempenho' | 'financeiro'
  dateRange: { start: string; end: string }
  onExport?: (format: 'pdf' | 'excel') => void
}

// Dados mock para demonstração
const mockOperationalData = {
  summary: {
    totalPOPs: 45,
    activePOPs: 42,
    maintenanceScheduled: 8,
    criticalAlerts: 3,
    uptime: 99.2
  },
  popStatus: [
    { name: 'Ativos', value: 42, color: '#10b981' },
    { name: 'Manutenção', value: 2, color: '#f59e0b' },
    { name: 'Offline', value: 1, color: '#ef4444' }
  ],
  monthlyActivities: [
    { month: 'Jan', preventiva: 12, corretiva: 8, instalacao: 5 },
    { month: 'Fev', preventiva: 15, corretiva: 6, instalacao: 3 },
    { month: 'Mar', preventiva: 18, corretiva: 4, instalacao: 7 },
    { month: 'Abr', preventiva: 14, corretiva: 9, instalacao: 4 },
    { month: 'Mai', preventiva: 16, corretiva: 5, instalacao: 6 },
    { month: 'Jun', preventiva: 20, corretiva: 3, instalacao: 8 }
  ],
  slaMetrics: [
    { metric: 'Tempo de Resposta', target: 4, actual: 3.2, unit: 'horas' },
    { metric: 'Resolução', target: 24, actual: 18.5, unit: 'horas' },
    { metric: 'Disponibilidade', target: 99.5, actual: 99.2, unit: '%' },
    { metric: 'MTTR', target: 2, actual: 1.8, unit: 'horas' }
  ]
}

const mockInfrastructureData = {
  summary: {
    totalEquipments: 180,
    activeGenerators: 35,
    rackUtilization: 78.5,
    powerConsumption: 245.8,
    temperatureAvg: 22.3
  },
  equipmentStatus: [
    { name: 'Operacional', value: 165, color: '#10b981' },
    { name: 'Manutenção', value: 12, color: '#f59e0b' },
    { name: 'Falha', value: 3, color: '#ef4444' }
  ],
  powerTrend: [
    { month: 'Jan', consumo: 220.5, capacidade: 300 },
    { month: 'Fev', consumo: 235.2, capacidade: 300 },
    { month: 'Mar', consumo: 245.8, capacidade: 300 },
    { month: 'Abr', consumo: 238.9, capacidade: 300 },
    { month: 'Mai', consumo: 252.1, capacidade: 300 },
    { month: 'Jun', consumo: 245.8, capacidade: 300 }
  ]
}

const mockPerformanceData = {
  summary: {
    avgResponseTime: 3.2,
    successRate: 99.1,
    throughput: 1250,
    errorRate: 0.9,
    availability: 99.2
  },
  performanceTrend: [
    { date: '01/06', responseTime: 3.1, throughput: 1200, errors: 0.8 },
    { date: '02/06', responseTime: 3.3, throughput: 1180, errors: 1.2 },
    { date: '03/06', responseTime: 2.9, throughput: 1300, errors: 0.6 },
    { date: '04/06', responseTime: 3.5, throughput: 1150, errors: 1.5 },
    { date: '05/06', responseTime: 3.0, throughput: 1280, errors: 0.7 },
    { date: '06/06', responseTime: 3.2, throughput: 1250, errors: 0.9 }
  ]
}

const mockFinancialData = {
  summary: {
    totalCost: 125000,
    energyCost: 45000,
    maintenanceCost: 35000,
    operationalCost: 45000,
    savings: 8500
  },
  costBreakdown: [
    { category: 'Energia', value: 45000, color: '#3b82f6' },
    { category: 'Manutenção', value: 35000, color: '#10b981' },
    { category: 'Operacional', value: 45000, color: '#f59e0b' }
  ],
  monthlyTrend: [
    { month: 'Jan', custo: 118000, economia: 7200 },
    { month: 'Fev', custo: 122000, economia: 6800 },
    { month: 'Mar', custo: 125000, economia: 8500 },
    { month: 'Abr', custo: 119000, economia: 9200 },
    { month: 'Mai', custo: 127000, economia: 7800 },
    { month: 'Jun', custo: 125000, economia: 8500 }
  ]
}

const ReportAnalytics: React.FC<ReportAnalyticsProps> = ({ reportType, dateRange, onExport }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('6m')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const renderOperationalAnalytics = () => (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total POPs</p>
                <p className="text-2xl font-bold">{mockOperationalData.summary.totalPOPs}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">POPs Ativos</p>
                <p className="text-2xl font-bold text-green-600">{mockOperationalData.summary.activePOPs}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manutenções</p>
                <p className="text-2xl font-bold text-amber-600">{mockOperationalData.summary.maintenanceScheduled}</p>
              </div>
              <Settings className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertas Críticos</p>
                <p className="text-2xl font-bold text-red-600">{mockOperationalData.summary.criticalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold text-green-600">{formatPercentage(mockOperationalData.summary.uptime)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status dos POPs */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos POPs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockOperationalData.popStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {mockOperationalData.popStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Atividades Mensais */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockOperationalData.monthlyActivities}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="preventiva" stackId="a" fill="#10b981" name="Preventiva" />
                <Bar dataKey="corretiva" stackId="a" fill="#f59e0b" name="Corretiva" />
                <Bar dataKey="instalacao" stackId="a" fill="#3b82f6" name="Instalação" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métricas SLA */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de SLA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockOperationalData.slaMetrics.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm text-muted-foreground">{metric.metric}</h4>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-lg font-bold">{metric.actual} {metric.unit}</p>
                    <p className="text-sm text-muted-foreground">Meta: {metric.target} {metric.unit}</p>
                  </div>
                  {metric.actual <= metric.target ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderInfrastructureAnalytics = () => (
    <div className="space-y-6">
      {/* Métricas de Infraestrutura */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Equipamentos</p>
                <p className="text-2xl font-bold">{mockInfrastructureData.summary.totalEquipments}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Geradores</p>
                <p className="text-2xl font-bold text-green-600">{mockInfrastructureData.summary.activeGenerators}</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilização Rack</p>
                <p className="text-2xl font-bold text-amber-600">{formatPercentage(mockInfrastructureData.summary.rackUtilization)}</p>
              </div>
              <Building2 className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consumo (kW)</p>
                <p className="text-2xl font-bold text-purple-600">{mockInfrastructureData.summary.powerConsumption}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temperatura</p>
                <p className="text-2xl font-bold text-blue-600">{mockInfrastructureData.summary.temperatureAvg}°C</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status dos Equipamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Equipamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockInfrastructureData.equipmentStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {mockInfrastructureData.equipmentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendência de Consumo */}
        <Card>
          <CardHeader>
            <CardTitle>Consumo de Energia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockInfrastructureData.powerTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="capacidade" stackId="1" stroke="#e5e7eb" fill="#e5e7eb" name="Capacidade" />
                <Area type="monotone" dataKey="consumo" stackId="2" stroke="#3b82f6" fill="#3b82f6" name="Consumo" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderPerformanceAnalytics = () => (
    <div className="space-y-6">
      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Resposta</p>
                <p className="text-2xl font-bold">{mockPerformanceData.summary.avgResponseTime}s</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Sucesso</p>
                <p className="text-2xl font-bold text-green-600">{formatPercentage(mockPerformanceData.summary.successRate)}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Throughput</p>
                <p className="text-2xl font-bold text-purple-600">{mockPerformanceData.summary.throughput}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Erro</p>
                <p className="text-2xl font-bold text-red-600">{formatPercentage(mockPerformanceData.summary.errorRate)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponibilidade</p>
                <p className="text-2xl font-bold text-green-600">{formatPercentage(mockPerformanceData.summary.availability)}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendência de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={mockPerformanceData.performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="responseTime" stroke="#3b82f6" name="Tempo Resposta (s)" />
              <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#10b981" name="Throughput" />
              <Line yAxisId="left" type="monotone" dataKey="errors" stroke="#ef4444" name="Taxa Erro (%)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )

  const renderFinancialAnalytics = () => (
    <div className="space-y-6">
      {/* Métricas Financeiras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold">{formatCurrency(mockFinancialData.summary.totalCost)}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Energia</p>
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(mockFinancialData.summary.energyCost)}</p>
              </div>
              <Zap className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manutenção</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(mockFinancialData.summary.maintenanceCost)}</p>
              </div>
              <Settings className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operacional</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(mockFinancialData.summary.operationalCost)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Economia</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(mockFinancialData.summary.savings)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Custos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockFinancialData.costBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatCurrency(value || 0)}`}
                >
                  {mockFinancialData.costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendência Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockFinancialData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="custo" fill="#ef4444" name="Custo" />
                <Bar dataKey="economia" fill="#10b981" name="Economia" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderAnalytics = () => {
    switch (reportType) {
      case 'operacional':
        return renderOperationalAnalytics()
      case 'infraestrutura':
        return renderInfrastructureAnalytics()
      case 'desempenho':
        return renderPerformanceAnalytics()
      case 'financeiro':
        return renderFinancialAnalytics()
      default:
        return renderOperationalAnalytics()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Análise de Relatório</h2>
          <p className="text-muted-foreground">
            Período: {dateRange.start} até {dateRange.end}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Mês</SelectItem>
              <SelectItem value="3m">3 Meses</SelectItem>
              <SelectItem value="6m">6 Meses</SelectItem>
              <SelectItem value="1y">1 Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => onExport?.('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport?.('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Analytics Content */}
      {renderAnalytics()}
    </div>
  )
}

export default ReportAnalytics