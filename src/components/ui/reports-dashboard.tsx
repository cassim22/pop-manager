import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart3, PieChart, Download, Eye,
  FileText,
  Clock, CheckCircle, ArrowUp, ArrowDown, Minus,
  RefreshCw, Share2
} from 'lucide-react'
import { PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Pie } from 'recharts'

interface ReportsDashboardProps {
  className?: string
}

// Dados mock para o dashboard
const reportStats = {
  total: 1247,
  thisMonth: 89,
  automated: 756,
  manual: 491,
  avgGenerationTime: '2.3s',
  successRate: 98.2,
  mostUsedFormat: 'PDF',
  totalDownloads: 3421
}

const reportsByCategory = [
  { name: 'Operacional', value: 45, count: 561, color: '#3b82f6' },
  { name: 'Infraestrutura', value: 28, count: 349, color: '#10b981' },
  { name: 'Desempenho', value: 15, count: 187, color: '#f59e0b' },
  { name: 'Financeiro', value: 8, count: 100, color: '#ef4444' },
  { name: 'Personalizado', value: 4, count: 50, color: '#8b5cf6' }
]

const reportsByMonth = [
  { month: 'Jan', reports: 85, downloads: 234 },
  { month: 'Fev', reports: 92, downloads: 267 },
  { month: 'Mar', reports: 78, downloads: 198 },
  { month: 'Abr', reports: 105, downloads: 312 },
  { month: 'Mai', reports: 118, downloads: 389 },
  { month: 'Jun', reports: 134, downloads: 445 },
  { month: 'Jul', reports: 127, downloads: 398 },
  { month: 'Ago', reports: 142, downloads: 467 },
  { month: 'Set', reports: 156, downloads: 523 },
  { month: 'Out', reports: 163, downloads: 578 },
  { month: 'Nov', reports: 148, downloads: 489 },
  { month: 'Dez', reports: 89, downloads: 267 }
]

const topReports = [
  {
    id: '1',
    name: 'Relatório Mensal de Operações',
    category: 'Operacional',
    downloads: 234,
    lastGenerated: '2024-01-15',
    avgRating: 4.8,
    trend: 'up'
  },
  {
    id: '2',
    name: 'Status de Infraestrutura',
    category: 'Infraestrutura',
    downloads: 189,
    lastGenerated: '2024-01-14',
    avgRating: 4.6,
    trend: 'up'
  },
  {
    id: '3',
    name: 'Análise de Desempenho',
    category: 'Desempenho',
    downloads: 156,
    lastGenerated: '2024-01-13',
    avgRating: 4.4,
    trend: 'down'
  },
  {
    id: '4',
    name: 'Custos Operacionais',
    category: 'Financeiro',
    downloads: 134,
    lastGenerated: '2024-01-12',
    avgRating: 4.7,
    trend: 'up'
  },
  {
    id: '5',
    name: 'Relatório Personalizado - Manutenções',
    category: 'Personalizado',
    downloads: 98,
    lastGenerated: '2024-01-11',
    avgRating: 4.5,
    trend: 'stable'
  }
]

const generationTimes = [
  { time: '0-1s', count: 45, percentage: 36 },
  { time: '1-3s', count: 38, percentage: 30 },
  { time: '3-5s', count: 25, percentage: 20 },
  { time: '5-10s', count: 12, percentage: 10 },
  { time: '10s+', count: 5, percentage: 4 }
]

const formatDistribution = [
  { format: 'PDF', count: 687, percentage: 55 },
  { format: 'Excel', count: 374, percentage: 30 },
  { format: 'CSV', count: 186, percentage: 15 }
]

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ className }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredData = useMemo(() => {
    // Aqui você filtraria os dados baseado no período e categoria selecionados
    return {
      reportsByMonth: reportsByMonth.slice(-6), // Últimos 6 meses para exemplo
      reportsByCategory,
      topReports
    }
  }, [selectedPeriod, selectedCategory])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    const categoryData = reportsByCategory.find(c => c.name === category)
    return categoryData?.color || '#6b7280'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="operacional">Operacional</SelectItem>
              <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
              <SelectItem value="desempenho">Desempenho</SelectItem>
              <SelectItem value="financeiro">Financeiro</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Relatórios</p>
                <p className="text-2xl font-bold">{reportStats.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  +{reportStats.thisMonth} este mês
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">{reportStats.successRate}%</p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  <p className="text-xs text-green-500">+2.1% vs mês anterior</p>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">{reportStats.avgGenerationTime}</p>
                <div className="flex items-center mt-1">
                  <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                  <p className="text-xs text-green-500">-0.5s vs mês anterior</p>
                </div>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Downloads</p>
                <p className="text-2xl font-bold">{reportStats.totalDownloads.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formato mais usado: {reportStats.mostUsedFormat}
                </p>
              </div>
              <Download className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relatórios por Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Relatórios por Mês
            </CardTitle>
            <CardDescription>
              Evolução da geração de relatórios ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={filteredData.reportsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="reports" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.1}
                  name="Relatórios"
                />
                <Area 
                  type="monotone" 
                  dataKey="downloads" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.1}
                  name="Downloads"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Distribuição por Categoria
            </CardTitle>
            <CardDescription>
              Proporção de relatórios por tipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={reportsByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }: { name: string; value?: number }) => `${name}: ${value || 0}%`}
                >
                  {reportsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas de Análise */}
      <Tabs defaultValue="top-reports" className="w-full">
        <TabsList>
          <TabsTrigger value="top-reports">Relatórios Mais Populares</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="formats">Formatos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="top-reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Mais Populares</CardTitle>
              <CardDescription>
                Relatórios com maior número de downloads e melhor avaliação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topReports.map((report, index) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant="outline" 
                            style={{ borderColor: getCategoryColor(report.category) }}
                          >
                            {report.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Última geração: {new Date(report.lastGenerated).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">{report.downloads} downloads</p>
                        <div className="flex items-center">
                          <span className="text-sm text-muted-foreground mr-1">Avaliação: {report.avgRating}</span>
                          {getTrendIcon(report.trend)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Performance</CardTitle>
              <CardDescription>
                Distribuição dos tempos de geração de relatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generationTimes.map((item) => (
                  <div key={item.time} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium w-16">{item.time}</span>
                      <Progress value={item.percentage} className="w-48" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{item.count} relatórios</span>
                      <Badge variant="outline">{item.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="formats">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Formatos</CardTitle>
              <CardDescription>
                Preferências de formato de exportação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formatDistribution.map((item) => (
                  <div key={item.format} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium w-16">{item.format}</span>
                      <Progress value={item.percentage} className="w-48" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{item.count} relatórios</span>
                      <Badge variant="outline">{item.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ReportsDashboard