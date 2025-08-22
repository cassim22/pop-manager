import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere relatórios personalizados e exporte dados do sistema
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="generate">Gerar Relatório</TabsTrigger>
          <TabsTrigger value="export">Exportar Dados</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Relatórios</CardTitle>
              <CardDescription>
                Visão geral dos relatórios e estatísticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Dashboard em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Report Tab */}
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Gerar Relatório</CardTitle>
              <CardDescription>
                Configure e gere relatórios personalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Geração de relatórios em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Data Tab */}
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Exportar Dados</CardTitle>
              <CardDescription>
                Exporte dados do sistema em diferentes formatos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Exportação de dados em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Relatórios</CardTitle>
              <CardDescription>
                Relatórios gerados anteriormente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Histórico em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Reports