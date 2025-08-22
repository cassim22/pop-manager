import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Database, HardDrive, Cpu, MemoryStick, Activity, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SystemHealthProps {
  className?: string
}

interface SystemMetric {
  name: string
  value: number
  max: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  icon: React.ReactNode
  description: string
}

const SystemHealth: React.FC<SystemHealthProps> = ({ className }) => {
  // Simulando dados do sistema - em produção viriam de uma API
  const systemMetrics: SystemMetric[] = [
    {
      name: 'Uso do Banco de Dados',
      value: 45.2,
      max: 100,
      unit: 'GB',
      status: 'healthy',
      icon: <Database className="h-4 w-4" />,
      description: 'PostgreSQL - Instância principal'
    },
    {
      name: 'Armazenamento',
      value: 78.5,
      max: 100,
      unit: '%',
      status: 'warning',
      icon: <HardDrive className="h-4 w-4" />,
      description: 'Disco SSD - 500GB total'
    },
    {
      name: 'Uso de CPU',
      value: 32.1,
      max: 100,
      unit: '%',
      status: 'healthy',
      icon: <Cpu className="h-4 w-4" />,
      description: 'Servidor de aplicação'
    },
    {
      name: 'Memória RAM',
      value: 68.3,
      max: 100,
      unit: '%',
      status: 'warning',
      icon: <MemoryStick className="h-4 w-4" />,
      description: '16GB DDR4 disponível'
    }
  ]

  const getStatusColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'critical':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }



  const getBadgeVariant = (status: SystemMetric['status']) => {
    switch (status) {
      case 'healthy':
        return 'default'
      case 'warning':
        return 'secondary'
      case 'critical':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const overallHealth = React.useMemo(() => {
    const criticalCount = systemMetrics.filter(m => m.status === 'critical').length
    const warningCount = systemMetrics.filter(m => m.status === 'warning').length
    
    if (criticalCount > 0) return 'critical'
    if (warningCount > 0) return 'warning'
    return 'healthy'
  }, [systemMetrics])

  return (
    <Card className={cn("border-0 shadow-lg", className)}>
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-gray-900 dark:text-white">
                Saúde do Sistema
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Monitoramento de recursos e performance
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {overallHealth === 'critical' && (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            {overallHealth === 'warning' && (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            <Badge 
              variant={getBadgeVariant(overallHealth)}
              className={cn(
                "capitalize",
                overallHealth === 'healthy' && "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300",
                overallHealth === 'warning' && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300"
              )}
            >
              {overallHealth === 'healthy' && 'Saudável'}
              {overallHealth === 'warning' && 'Atenção'}
              {overallHealth === 'critical' && 'Crítico'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {systemMetrics.map((metric, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    metric.status === 'healthy' && "bg-green-100 dark:bg-green-900/30",
                    metric.status === 'warning' && "bg-yellow-100 dark:bg-yellow-900/30",
                    metric.status === 'critical' && "bg-red-100 dark:bg-red-900/30"
                  )}>
                    <span className={getStatusColor(metric.status)}>
                      {metric.icon}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {metric.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {metric.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {metric.unit === '%' 
                      ? `${metric.value.toFixed(1)}%`
                      : `${metric.value.toFixed(1)} ${metric.unit}`
                    }
                  </p>
                  {metric.unit !== '%' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      de {metric.max} {metric.unit}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Progress 
                  value={metric.unit === '%' ? metric.value : (metric.value / metric.max) * 100}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>0</span>
                  <span>
                    {metric.unit === '%' ? '100%' : `${metric.max} ${metric.unit}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo de Status */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {systemMetrics.filter(m => m.status === 'healthy').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Saudáveis</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {systemMetrics.filter(m => m.status === 'warning').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Atenção</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {systemMetrics.filter(m => m.status === 'critical').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Críticos</p>
            </div>
          </div>
        </div>

        {/* Última Atualização */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SystemHealth