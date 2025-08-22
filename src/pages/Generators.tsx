import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Zap, Plus, Filter, Search, MapPin, AlertTriangle, CheckCircle, Clock, Settings, Fuel, Gauge } from 'lucide-react'
import { useGeradores, useCreateAbastecimento } from '@/hooks/useAPI'
import { Gerador, NivelTanque } from '@/types/entities'
import { formatTimeAgo } from '@/lib/utils'

const Generators: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isSupplyDialogOpen, setIsSupplyDialogOpen] = useState(false)
  const [selectedGerador, setSelectedGerador] = useState<Gerador | null>(null)
  const [supplyFormData, setSupplyFormData] = useState({
    quantidade_litros: '',
    valor_total: '',
    valor_por_litro: '',
    fornecedor: '',
    numero_nf: '',
    hodometro_atual: '',
    nivel_tanque_antes: 'vazio' as NivelTanque,
    nivel_tanque_depois: 'cheio' as NivelTanque,
    observacoes: ''
  })
  
  const { data: geradoresData, isLoading, error } = useGeradores({
    page: 1,
    limit: 50
  })
  
  const createAbastecimento = useCreateAbastecimento()

  const handleOpenSupplyDialog = (gerador: Gerador) => {
    setSelectedGerador(gerador)
    setSupplyFormData({
      quantidade_litros: '',
      valor_total: '',
      valor_por_litro: '',
      fornecedor: '',
      numero_nf: '',
      hodometro_atual: '',
      nivel_tanque_antes: 'vazio' as NivelTanque,
      nivel_tanque_depois: 'cheio' as NivelTanque,
      observacoes: ''
    })
    setIsSupplyDialogOpen(true)
  }

  const handleSupplyInputChange = (field: string, value: string) => {
    setSupplyFormData(prev => ({ ...prev, [field]: value }))
    
    // Calcular valor por litro automaticamente
    if (field === 'quantidade_litros' || field === 'valor_total') {
      const quantidade = field === 'quantidade_litros' ? parseFloat(value) : parseFloat(supplyFormData.quantidade_litros)
      const valorTotal = field === 'valor_total' ? parseFloat(value) : parseFloat(supplyFormData.valor_total)
      
      if (quantidade > 0 && valorTotal > 0) {
        const valorPorLitro = (valorTotal / quantidade).toFixed(2)
        setSupplyFormData(prev => ({ ...prev, valor_por_litro: valorPorLitro }))
      }
    }
  }

  const handleSubmitSupply = async () => {
    if (!selectedGerador) return
    
    try {
      await createAbastecimento.mutateAsync({
        gerador_id: selectedGerador.id,
        gerador_nome: selectedGerador.nome,
        data_abastecimento: new Date(),
        quantidade_litros: parseFloat(supplyFormData.quantidade_litros),
        valor_total: parseFloat(supplyFormData.valor_total),
        valor_por_litro: parseFloat(supplyFormData.valor_por_litro),
        tipo_combustivel: selectedGerador.tipo_combustivel,
        fornecedor: supplyFormData.fornecedor,
        numero_nf: supplyFormData.numero_nf,
        hodometro_atual: supplyFormData.hodometro_atual ? parseFloat(supplyFormData.hodometro_atual) : undefined,
        nivel_tanque_antes: supplyFormData.nivel_tanque_antes,
        nivel_tanque_depois: supplyFormData.nivel_tanque_depois,
        observacoes: supplyFormData.observacoes
      })
      
      setIsSupplyDialogOpen(false)
      setSelectedGerador(null)
    } catch (error) {
      console.error('Erro ao registrar abastecimento:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'operacional': return 'default'
      case 'manutencao': return 'secondary'
      case 'falha': return 'destructive'
      case 'desligado': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'operacional': return 'Operacional'
      case 'manutencao': return 'Manutenção'
      case 'falha': return 'Falha'
      case 'desligado': return 'Desligado'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'operacional': return <CheckCircle className="h-4 w-4" />
      case 'manutencao': return <Settings className="h-4 w-4" />
      case 'falha': return <AlertTriangle className="h-4 w-4" />
      case 'desligado': return <Clock className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }



  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Geradores</h1>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar geradores</h3>
          <p className="text-gray-500">Tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }

  const geradores = geradoresData?.dados || []
  const filteredGeradores = geradores.filter((gerador: Gerador) => {
    if (statusFilter !== 'all' && gerador.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Geradores</h1>
          <p className="text-muted-foreground">
            Monitoramento e controle de geradores ({filteredGeradores.length} encontrados)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Gerador
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar geradores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">Todos os Status</option>
          <option value="operacional">Operacional</option>
          <option value="manutencao">Manutenção</option>
          <option value="falha">Falha</option>
          <option value="desligado">Desligado</option>
        </select>
      </div>

      {/* Generators Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredGeradores.map((gerador: Gerador) => (
          <Card key={gerador.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    {gerador.modelo}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {gerador.pop_nome || 'POP não definido'}
                  </CardDescription>
                </div>
                <Badge variant={getStatusColor(gerador.status)}>
                  {getStatusIcon(gerador.status)}
                  <span className="ml-1">{getStatusLabel(gerador.status)}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Generator Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{gerador.potencia_kva}</div>
                  <div className="text-xs text-gray-500">kVA</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-xs text-gray-500">Horas</div>
                </div>
              </div>



              {/* Additional Info */}
              <div className="space-y-2 text-sm text-gray-600">
                {gerador.fabricante && (
                  <div>
                    <span className="font-medium">Fabricante: </span>
                    <span>{gerador.fabricante}</span>
                  </div>
                )}
                {gerador.numero_serie && (
                  <div>
                    <span className="font-medium">Série: </span>
                    <span>{gerador.numero_serie}</span>
                  </div>
                )}

              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-gray-500">
                  Atualizado {formatTimeAgo(gerador.updated_at)}
                </span>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenSupplyDialog(gerador)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Fuel className="h-4 w-4 mr-1" />
                    Abastecer
                  </Button>
                  <Button variant="outline" size="sm">
                    <Gauge className="h-4 w-4 mr-1" />
                    Monitor
                  </Button>
                  <Button variant="outline" size="sm">
                    Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Supply Dialog */}
      <Dialog open={isSupplyDialogOpen} onOpenChange={setIsSupplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Fuel className="h-5 w-5 mr-2" />
              Registrar Abastecimento - {selectedGerador?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Informações do Gerador */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Informações do Gerador</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Modelo:</span>
                  <span className="ml-2 font-medium">{selectedGerador?.modelo}</span>
                </div>
                <div>
                  <span className="text-gray-500">Combustível:</span>
                  <span className="ml-2 font-medium capitalize">{selectedGerador?.tipo_combustivel}</span>
                </div>
                <div>
                  <span className="text-gray-500">Capacidade:</span>
                  <span className="ml-2 font-medium">{selectedGerador?.capacidade_tanque}L</span>
                </div>
                <div>
                  <span className="text-gray-500">POP:</span>
                  <span className="ml-2 font-medium">{selectedGerador?.pop_nome}</span>
                </div>
              </div>
            </div>

            {/* Formulário de Abastecimento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantidade">Quantidade (Litros) *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="0.01"
                  value={supplyFormData.quantidade_litros}
                  onChange={(e) => handleSupplyInputChange('quantidade_litros', e.target.value)}
                  placeholder="Ex: 50.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="valor_total">Valor Total (R$) *</Label>
                <Input
                  id="valor_total"
                  type="number"
                  step="0.01"
                  value={supplyFormData.valor_total}
                  onChange={(e) => handleSupplyInputChange('valor_total', e.target.value)}
                  placeholder="Ex: 250.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="valor_por_litro">Valor por Litro (R$)</Label>
                <Input
                  id="valor_por_litro"
                  type="number"
                  step="0.01"
                  value={supplyFormData.valor_por_litro}
                  readOnly
                  className="bg-gray-50"
                  placeholder="Calculado automaticamente"
                />
              </div>
              <div>
                <Label htmlFor="fornecedor">Fornecedor/Posto</Label>
                <Input
                  id="fornecedor"
                  value={supplyFormData.fornecedor}
                  onChange={(e) => handleSupplyInputChange('fornecedor', e.target.value)}
                  placeholder="Nome do posto ou fornecedor"
                />
              </div>
              <div>
                <Label htmlFor="numero_nf">Número da NF</Label>
                <Input
                  id="numero_nf"
                  value={supplyFormData.numero_nf}
                  onChange={(e) => handleSupplyInputChange('numero_nf', e.target.value)}
                  placeholder="Número da nota fiscal"
                />
              </div>
              <div>
                <Label htmlFor="hodometro">Hodômetro Atual</Label>
                <Input
                  id="hodometro"
                  type="number"
                  value={supplyFormData.hodometro_atual}
                  onChange={(e) => handleSupplyInputChange('hodometro_atual', e.target.value)}
                  placeholder="Horas de funcionamento"
                />
              </div>
              <div>
                <Label htmlFor="nivel_antes">Nível Antes</Label>
                <Select
                  value={supplyFormData.nivel_tanque_antes}
                  onValueChange={(value) => handleSupplyInputChange('nivel_tanque_antes', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vazio">Vazio</SelectItem>
                    <SelectItem value="baixo">Baixo (1/4)</SelectItem>
                    <SelectItem value="medio">Médio (1/2)</SelectItem>
                    <SelectItem value="alto">Alto (3/4)</SelectItem>
                    <SelectItem value="cheio">Cheio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nivel_depois">Nível Depois</Label>
                <Select
                  value={supplyFormData.nivel_tanque_depois}
                  onValueChange={(value) => handleSupplyInputChange('nivel_tanque_depois', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vazio">Vazio</SelectItem>
                    <SelectItem value="baixo">Baixo (1/4)</SelectItem>
                    <SelectItem value="medio">Médio (1/2)</SelectItem>
                    <SelectItem value="alto">Alto (3/4)</SelectItem>
                    <SelectItem value="cheio">Cheio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={supplyFormData.observacoes}
                onChange={(e) => handleSupplyInputChange('observacoes', e.target.value)}
                placeholder="Observações sobre o abastecimento..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsSupplyDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmitSupply}
                disabled={!supplyFormData.quantidade_litros || !supplyFormData.valor_total || createAbastecimento.isPending}
              >
                {createAbastecimento.isPending ? 'Registrando...' : 'Registrar Abastecimento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {filteredGeradores.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum gerador encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece cadastrando o primeiro gerador.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Gerador
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Generators