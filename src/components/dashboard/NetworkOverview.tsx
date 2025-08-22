import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart } from '@/components/charts'
import { Building2, Wifi, Zap, Server } from 'lucide-react'
import { usePOPs, useGeradores } from '@/hooks/useAPI'
import { cn } from '@/lib/utils'

interface NetworkOverviewProps {
  className?: string
}

const NetworkOverview: React.FC<NetworkOverviewProps> = ({ className }) => {
  const { data: pops, isLoading: popsLoading } = usePOPs()
  const { data: generators, isLoading: generatorsLoading } = useGeradores()

  // Calcular estatísticas da rede
  const networkStats = React.useMemo(() => {
    if (!pops || !Array.isArray(pops)) return null

    const statusCounts = pops.reduce((acc, pop) => {
      acc[pop.status] = (acc[pop.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalRacks = pops.reduce((total, pop) => total + (pop.racks?.length || 0), 0)
    const totalClients = pops.reduce((total, pop) => total + (pop.quantidade_clientes || 0), 0)
    const activeGenerators = generators?.dados?.filter((g: any) => g.status === 'ativo').length || 0

    return {
      statusCounts,
      totalRacks,
      totalClients,
      activeGenerators,
      totalPops: pops.length
    }
  }, [pops, generators])

  // Dados para o gráfico de barras
  const chartData = React.useMemo(() => {
    if (!networkStats) return []

    return [
      {
        name: 'Operacional',
        value: networkStats.statusCounts['operacional'] || 0,
        color: '#10B981'
      },
      {
        name: 'Manutenção',
        value: networkStats.statusCounts['manutencao'] || 0,
        color: '#F59E0B'
      },
      {
        name: 'Crítico',
        value: networkStats.statusCounts['critico'] || 0,
        color: '#EF4444'
      },
      {
        name: 'Desmobilização',
        value: networkStats.statusCounts['desmobilizacao'] || 0,
        color: '#6B7280'
      },
      {
        name: 'Desmobilizado',
        value: networkStats.statusCounts['desmobilizado'] || 0,
        color: '#374151'
      }
    ].filter(item => item.value > 0)
  }, [networkStats])

  if (popsLoading || generatorsLoading) {
    return (
      <Card className={cn("border-0 shadow-lg", className)}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Wifi className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-gray-900 dark:text-white">
                Visão da Rede
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Status dos POPs e infraestrutura
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-0 shadow-lg", className)}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Wifi className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-gray-900 dark:text-white">
                Visão da Rede
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Status dos POPs e infraestrutura
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
            {networkStats?.totalPops || 0} POPs
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Gráfico de Status dos POPs */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Status dos POPs
          </h4>
          {chartData.length > 0 ? (
            <BarChart
              title="Status dos POPs"
              data={chartData.map(item => ({ name: item.name, value: item.value }))}
              bars={[{ dataKey: 'value', fill: '#3B82F6', name: 'POPs' }]}
              height={200}
              showGrid={false}
            />
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum POP encontrado</p>
            </div>
          )}
        </div>

        {/* Métricas da Infraestrutura */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Server className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {networkStats?.totalRacks || 0}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Total de Racks
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {networkStats?.activeGenerators || 0}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Geradores Ativos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo de Clientes */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total de Clientes Atendidos
              </span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {networkStats?.totalClients?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default NetworkOverview