import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NotificationCenter from '@/components/NotificationCenter'
import GlobalSearch from '@/components/GlobalSearch'
import { LineChart, AreaChart, PieChart, BarChart } from '@/components/charts'
import { NetworkOverview, SystemHealth } from '@/components/dashboard'
import { useNotifications } from '@/contexts/NotificationContext'
import { useDarkMode } from '@/hooks/useDarkMode'
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts'
import {
  useDashboardStats,
  useSystemAlerts,
  useSmartActions,
  useRecentActivities,
  useUpcomingMaintenances,
  useCapacityMetrics
} from '@/hooks/useAPI'
import {
  Activity,
  AlertTriangle,
  Building2,
  Users,
  Zap,
  Wrench,
  Calendar,
  BarChart3,
  Settings,
  Search,
  Clock,
  Wifi,
  Plus,
  FileText,
  Camera,
  UserPlus,
  Eye,
  Brain,
  ArrowRight,
  Download,
  Filter,
  TrendingUp,
  CheckCircle,
  ArrowUpRight,
  Gauge,
  Bell,
  Database
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn, formatTimeAgo } from '@/lib/utils'

const Dashboard: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { } = useNotifications()
  const { isDarkMode } = useDarkMode()
  
  // Função para obter saudação baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      return 'Bom dia!'
    } else if (hour >= 12 && hour < 18) {
      return 'Boa tarde!'
    } else {
      return 'Boa noite!'
    }
  }
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: alerts, isLoading: alertsLoading } = useSystemAlerts()
  const { data: smartActions, isLoading: actionsLoading } = useSmartActions()
  const { data: recentActivities, isLoading: activitiesLoading } = useRecentActivities()
  const { data: upcomingMaintenances, isLoading: maintenancesLoading } = useUpcomingMaintenances()
  const { data: capacityMetrics, isLoading: capacityLoading } = useCapacityMetrics()

  // Função para obter ícone do alerta
  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'critico': return <AlertTriangle className="h-5 w-5" />
      case 'manutencao': return <Wrench className="h-5 w-5" />
      case 'ferias': return <Calendar className="h-5 w-5" />
      case 'capacidade': return <Gauge className="h-5 w-5" />
      case 'aviso': return <AlertTriangle className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  // Ações rápidas disponíveis
  const quickActions = [
    {
      id: 'novo-pop',
      title: 'Novo POP',
      description: 'Cadastrar novo ponto de presença',
      icon: Building2,
      color: 'bg-blue-500',
      href: '/pops/novo'
    },
    {
      id: 'nova-atividade',
      title: 'Nova Atividade',
      description: 'Criar tarefa ou operação',
      icon: Plus,
      color: 'bg-purple-500',
      href: '/atividades/nova'
    },
    {
      id: 'agendar-check',
      title: 'Agendar Check',
      description: 'Programar manutenção',
      icon: Calendar,
      color: 'bg-green-500',
      href: '/agenda/novo'
    },
    {
      id: 'novo-colaborador',
      title: 'Novo Colaborador',
      description: 'Adicionar à equipe',
      icon: UserPlus,
      color: 'bg-orange-500',
      href: '/equipe/novo'
    },
    {
      id: 'novo-gerador',
      title: 'Novo Gerador',
      description: 'Cadastrar equipamento',
      icon: Zap,
      color: 'bg-yellow-500',
      href: '/geradores/novo'
    },
    {
      id: 'ver-galeria',
      title: 'Ver Galeria',
      description: 'Fotos dos POPs',
      icon: Camera,
      color: 'bg-pink-500',
      href: '/galerias'
    },
    {
      id: 'relatorios',
      title: 'Relatórios',
      description: 'Análise e métricas',
      icon: FileText,
      color: 'bg-indigo-500',
      href: '/relatorios'
    },
    {
      id: 'agenda',
      title: 'Agenda',
      description: 'Visualizar cronograma',
      icon: Calendar,
      color: 'bg-teal-500',
      href: '/agenda'
    }
  ]

  // Configurar atalhos de teclado
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'k',
        ctrlKey: true,
        callback: () => setIsSearchOpen(true),
        description: 'Abrir busca global'
      }
    ]
  })

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6 transition-colors duration-300", isDarkMode && "dark")}>
      {/* Header de Boas-vindas */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">{getGreeting()}</h1>
                <p className="text-slate-300 text-lg">
                  Sua central de comando personalizada.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Quinta-Feira, {format(new Date(), 'dd/MM', { locale: ptBR })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4" />
                <span>{format(new Date(), 'HH:mm', { locale: ptBR })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/10 h-10 w-10 p-0"
              onClick={() => setIsSearchOpen(true)}
              title="Busca Global (Ctrl+K)"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/10 h-10 px-4"
              title="Personalizar"
            >
              <Settings className="h-4 w-4 mr-2" />
              Personalizar
            </Button>
            
            <NotificationCenter />
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ações Rápidas */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
                  <CardDescription>Acesso direto às principais funcionalidades</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => {
                  const IconComponent = action.icon
                  return (
                    <Button
                      key={action.id}
                      variant="ghost"
                      className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50 dark:hover:bg-gray-800 group"
                      onClick={() => window.location.href = action.href}
                    >
                      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-105", action.color)}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{action.description}</div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Inteligentes */}
        <div>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Ações Inteligentes</CardTitle>
                  <CardDescription>Baseado na análise em tempo real dos seus dados</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!actionsLoading && smartActions?.slice(0, 3).map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-sm">
                      <Wrench className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{action.titulo}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{action.descricao}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </div>
              ))}
              
              {actionsLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3">
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

       {/* Seção Inferior - Atividades */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Atividades Pendentes */}
         <Card className="border-0 shadow-sm">
           <CardHeader className="pb-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                 <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                   <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                 </div>
                 <div>
                   <CardTitle className="text-lg font-semibold">Atividades Pendentes</CardTitle>
                   <CardDescription>{recentActivities?.length || 47} atividades aguardando início</CardDescription>
                 </div>
               </div>
               <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                 Urgente
               </Badge>
             </div>
           </CardHeader>
           <CardContent>
             <div className="flex items-center justify-between p-6 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
               <div className="text-center">
                 <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">47</div>
                 <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total pendentes</div>
               </div>
               <ArrowRight className="h-6 w-6 text-orange-400" />
             </div>
           </CardContent>
         </Card>

         {/* Atividades Hoje */}
         <Card className="border-0 shadow-sm">
           <CardHeader className="pb-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                 <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                   <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                 </div>
                 <div>
                   <CardTitle className="text-lg font-semibold">Atividades Hoje</CardTitle>
                   <CardDescription>1 atividades agendadas para hoje</CardDescription>
                 </div>
               </div>
             </div>
           </CardHeader>
           <CardContent>
             <div className="flex items-center justify-between p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
               <div className="text-center">
                 <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">1</div>
                 <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Agendadas hoje</div>
               </div>
               <ArrowRight className="h-6 w-6 text-blue-400" />
             </div>
           </CardContent>
         </Card>
       </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-10 w-10 bg-gray-200 rounded-lg" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          [
            {
              title: "POPs Totais",
              value: stats.pops_total || 0,
              change: "+2.1%",
              icon: Building2,
              color: "text-blue-600",
              bgColor: "bg-blue-50 dark:bg-blue-900/20",
              iconBg: "bg-blue-100 dark:bg-blue-800/30",
              trend: "up",
              description: "Pontos de presença",
              details: `${stats?.pops_operacionais || 0} operacionais, ${stats?.pops_criticos || 0} críticos`
            },
            {
              title: "Técnicos",
              value: stats.tecnicos_total || 0,
              change: "+5.4%",
              icon: Users,
              color: "text-green-600",
              bgColor: "bg-green-50 dark:bg-green-900/20",
              iconBg: "bg-green-100 dark:bg-green-800/30",
              trend: "up",
              description: "Profissionais",
              details: `${stats?.tecnicos_disponiveis || 0} disponíveis`
            },
            {
              title: "Atividades",
              value: stats.atividades_pendentes || 0,
              change: "+12.5%",
              icon: Activity,
              color: "text-orange-600",
              bgColor: "bg-orange-50 dark:bg-orange-900/20",
              iconBg: "bg-orange-100 dark:bg-orange-800/30",
              trend: "up",
              description: "Pendentes",
              details: `${stats?.atividades_total || 0} total`
            },
            {
              title: "Geradores",
              value: stats.geradores_ativos || 0,
              change: "-2.1%",
              icon: Zap,
              color: "text-purple-600",
              bgColor: "bg-purple-50 dark:bg-purple-900/20",
              iconBg: "bg-purple-100 dark:bg-purple-800/30",
              trend: "down",
              description: "Ativos",
              details: `${stats?.manutencoes_atrasadas || 0} manutenções atrasadas`
            }
          ].map((stat, index) => (
            <Card key={index} className={cn(
              "border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group",
              stat.bgColor
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {stat.title}
                  </CardTitle>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform">
                    {stat.value.toLocaleString()}
                  </div>
                </div>
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                  stat.iconBg
                )}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.description}
                  </p>
                  <div className={cn(
                    "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                    stat.trend === 'up' 
                      ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30" 
                      : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                  )}>
                    <ArrowUpRight className={cn(
                      "h-3 w-3 mr-1",
                      stat.trend === 'down' && "rotate-90"
                    )} />
                    {stat.change}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.details}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-4 text-center py-8">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-muted-foreground">Dados não disponíveis</p>
          </div>
        )}
      </div>

      {/* Network Overview and System Health */}
      <div className="grid gap-6 lg:grid-cols-2">
        <NetworkOverview />
        <SystemHealth />
      </div>

      {/* Enhanced Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enhanced System Alerts */}
        <Card className="lg:col-span-1 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Alertas do Sistema
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Notificações importantes que requerem atenção
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {alerts && alerts.length > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    {alerts.length} ativo{alerts.length > 1 ? 's' : ''}
                  </Badge>
                )}
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {alertsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className={cn(
                    "flex items-center space-x-4 p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer",
                    alert.tipo === 'critico' 
                      ? 'bg-red-50 dark:bg-red-900/10 border-l-red-500 hover:bg-red-100 dark:hover:bg-red-900/20' :
                    alert.tipo === 'manutencao' 
                      ? 'bg-yellow-50 dark:bg-yellow-900/10 border-l-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/20' :
                      'bg-blue-50 dark:bg-blue-900/10 border-l-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                  )}>
                    <div className={cn(
                      "h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0",
                      alert.tipo === 'critico' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                      alert.tipo === 'manutencao' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    )}>
                      {getAlertIcon(alert.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {alert.titulo}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                            {alert.descricao}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-xs font-medium",
                              alert.tipo === 'critico' ? 'border-red-500 text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30' :
                              alert.tipo === 'manutencao' ? 'border-yellow-500 text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30' :
                              'border-blue-500 text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                            )}
                          >
                            {alert.tipo?.toUpperCase() || 'N/A'}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(alert.data)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {alerts.length > 4 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm">
                      Ver todos os {alerts.length} alertas
                      <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Todos os sistemas operacionais
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhum alerta crítico detectado
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Smart Actions */}
        <Card className="lg:col-span-1 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Ações Inteligentes
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Sugestões baseadas em IA
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {smartActions && smartActions.length > 0 && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {smartActions.length} sugestõe{smartActions.length > 1 ? 's' : ''}
                  </Badge>
                )}
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {actionsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            ) : smartActions && smartActions.length > 0 ? (
              <div className="space-y-4">
                {smartActions.slice(0, 3).map((action, index) => (
                  <div key={action.id} className={cn(
                    "p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer group",
                    index === 0 ? 'bg-red-50 dark:bg-red-900/10 border-l-red-500' :
                    index === 1 ? 'bg-yellow-50 dark:bg-yellow-900/10 border-l-yellow-500' :
                    'bg-green-50 dark:bg-green-900/10 border-l-green-500'
                  )}>
                    <div className="flex items-start space-x-3 mb-3">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        index === 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        index === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      )}>
                        {index === 0 ? <AlertTriangle className="h-5 w-5" /> :
                         index === 1 ? <Clock className="h-5 w-5" /> :
                         <CheckCircle className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                              {action.titulo}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                              {action.descricao}
                            </p>
                          </div>
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-xs font-medium ml-2",
                              action.prioridade === 'alta' ? 'border-red-500 text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30' :
                              action.prioridade === 'media' ? 'border-yellow-500 text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30' :
                              'border-green-500 text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30'
                            )}
                          >
                            {action.prioridade?.toUpperCase() || 'N/A'}
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(action.data)}
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className={cn(
                        "w-full transition-all duration-200 group-hover:scale-[1.02]",
                        index === 0 ? 'bg-red-600 hover:bg-red-700' :
                        index === 1 ? 'bg-yellow-600 hover:bg-yellow-700' :
                        'bg-green-600 hover:bg-green-700'
                      )}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Executar Ação
                    </Button>
                  </div>
                ))}
                {smartActions.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm">
                      Ver todas as {smartActions.length} sugestões
                      <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Sistema otimizado
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhuma ação recomendada no momento
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Capacity Metrics */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gauge className="h-5 w-5 mr-2" />
              Capacidade por POP
            </CardTitle>
            <CardDescription>
              Utilização atual e projeções de capacidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            {capacityLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : capacityMetrics && capacityMetrics.length > 0 ? (
              <div className="space-y-4">
                {capacityMetrics.map((metric) => (
                  <div key={metric.pop_id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.pop_nome}</span>
                      <span className="text-sm text-muted-foreground">
                        {metric.percentual_utilizacao}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          metric.percentual_utilizacao >= 90 ? "bg-red-500" :
                          metric.percentual_utilizacao >= 70 ? "bg-yellow-500" : "bg-green-500"
                        )}
                        style={{ width: `${metric.percentual_utilizacao}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{metric.clientes_atuais} / {metric.capacidade_maxima} clientes</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          metric.percentual_utilizacao >= 90 ? 'border-red-500 text-red-600' :
                          metric.percentual_utilizacao >= 70 ? 'border-yellow-500 text-yellow-600' :
                          'border-green-500 text-green-600'
                        )}
                      >
                        {metric.projecao_crescimento}% crescimento
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Dados não disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas atividades realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-500">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.descricao}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {activity.prioridade}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Maintenances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2" />
              Próximas Manutenções
            </CardTitle>
            <CardDescription>
              Manutenções agendadas para os próximos dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {maintenancesLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingMaintenances && upcomingMaintenances.length > 0 ? (
              <div className="space-y-4">
                {upcomingMaintenances.map((maintenance) => (
                  <div key={maintenance.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {maintenance.titulo}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {maintenance.tipo_ativo}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {maintenance.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(maintenance.data_agendada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma manutenção agendada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Charts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Análises Avançadas</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Performance Trends */}
          <LineChart
            title="Tendências de Performance"
            description="Evolução das métricas principais ao longo do tempo"
            data={[
              { name: 'Jan', uptime: 98.5, latencia: 45, throughput: 1200 },
              { name: 'Fev', uptime: 99.1, latencia: 42, throughput: 1350 },
              { name: 'Mar', uptime: 97.8, latencia: 48, throughput: 1180 },
              { name: 'Abr', uptime: 99.3, latencia: 40, throughput: 1420 },
              { name: 'Mai', uptime: 98.9, latencia: 43, throughput: 1380 },
              { name: 'Jun', uptime: 99.5, latencia: 38, throughput: 1500 }
            ]}
            lines={[
              { dataKey: 'uptime', stroke: '#10B981', name: 'Uptime (%)' },
              { dataKey: 'latencia', stroke: '#F59E0B', name: 'Latência (ms)' },
              { dataKey: 'throughput', stroke: '#3B82F6', name: 'Throughput' }
            ]}
            height={350}
          />

          {/* Resource Usage */}
          <AreaChart
            title="Uso de Recursos"
            description="Consumo de recursos por categoria"
            data={[
              { name: '00:00', cpu: 45, memoria: 62, rede: 30 },
              { name: '04:00', cpu: 38, memoria: 58, rede: 25 },
              { name: '08:00', cpu: 72, memoria: 78, rede: 65 },
              { name: '12:00', cpu: 85, memoria: 82, rede: 78 },
              { name: '16:00', cpu: 78, memoria: 75, rede: 70 },
              { name: '20:00', cpu: 65, memoria: 68, rede: 55 }
            ]}
            areas={[
              { dataKey: 'cpu', stroke: '#EF4444', fill: '#EF4444', name: 'CPU (%)' },
              { dataKey: 'memoria', stroke: '#8B5CF6', fill: '#8B5CF6', name: 'Memória (%)' },
              { dataKey: 'rede', stroke: '#06B6D4', fill: '#06B6D4', name: 'Rede (%)' }
            ]}
            height={350}
            stacked={true}
          />

          {/* POPs Distribution */}
          <PieChart
            title="Distribuição de POPs"
            description="POPs por região e status"
            data={[
              { name: 'Norte', value: 12, color: '#10B981' },
              { name: 'Nordeste', value: 18, color: '#3B82F6' },
              { name: 'Centro-Oeste', value: 8, color: '#F59E0B' },
              { name: 'Sudeste', value: 25, color: '#EF4444' },
              { name: 'Sul', value: 15, color: '#8B5CF6' }
            ]}
            height={350}
            innerRadius={60}
          />

          {/* Maintenance Types */}
          <BarChart
            title="Tipos de Manutenção"
            description="Distribuição de manutenções por tipo"
            data={[
              { name: 'Preventiva', concluidas: 45, pendentes: 12, canceladas: 3 },
              { name: 'Corretiva', concluidas: 28, pendentes: 8, canceladas: 5 },
              { name: 'Emergencial', concluidas: 15, pendentes: 3, canceladas: 1 },
              { name: 'Upgrade', concluidas: 22, pendentes: 6, canceladas: 2 }
            ]}
            bars={[
              { dataKey: 'concluidas', fill: '#10B981', name: 'Concluídas' },
              { dataKey: 'pendentes', fill: '#F59E0B', name: 'Pendentes' },
              { dataKey: 'canceladas', fill: '#EF4444', name: 'Canceladas' }
            ]}
            height={350}
          />
        </div>
      </div>
      
      {/* Global Search Modal */}
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </div>
  )
}

export default Dashboard