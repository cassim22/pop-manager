import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Fuel, Plus, Search, TrendingUp, Droplets, Camera, X, Upload } from 'lucide-react'
import { useAbastecimentos, useCreateAbastecimento } from '@/hooks/useAPI'
import { Abastecimento, TipoCombustivel } from '@/types/entities'

const Supplies: React.FC = () => {
  const { data: abastecimentos, isLoading } = useAbastecimentos()
  const createAbastecimento = useCreateAbastecimento()
  const [filteredData, setFilteredData] = useState<Abastecimento[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVehicle, setFilterVehicle] = useState('all')
  const [filterFuelType, setFilterFuelType] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploadedPhotos, setUploadedPhotos] = useState<{ file: File; tipo: 'nota_fiscal' | 'bomba'; preview: string }[]>([])
  const [newSupply, setNewSupply] = useState({
    gerador_nome: '',
    tipo_combustivel: 'gasolina' as TipoCombustivel,
    quantidade_litros: '',
    valor_total: '',
    hodometro_atual: '',
    fornecedor: '',
    observacoes: ''
  })

  useEffect(() => {
    if (!abastecimentos?.dados) return
    
    let filtered = abastecimentos.dados
    
    if (searchTerm) {
      filtered = filtered.filter((item: Abastecimento) => 
        item.gerador_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filterVehicle !== 'all') {
      filtered = filtered.filter((item: Abastecimento) => item.gerador_nome === filterVehicle)
    }
    
    if (filterFuelType !== 'all') {
      filtered = filtered.filter((item: Abastecimento) => item.tipo_combustivel === filterFuelType)
    }
    
    setFilteredData(filtered)
  }, [abastecimentos, searchTerm, filterVehicle, filterFuelType])

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, tipo: 'nota_fiscal' | 'bomba') => {
    const files = Array.from(event.target.files || [])
    const newPhotos = files.map(file => ({
      file,
      tipo,
      preview: URL.createObjectURL(file)
    }))
    setUploadedPhotos(prev => [...prev, ...newPhotos])
  }

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => {
      const photo = prev[index]
      URL.revokeObjectURL(photo.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleAddSupply = async () => {
    // Validações básicas
    if (!newSupply.gerador_nome || !newSupply.quantidade_litros) {
      alert('Por favor, preencha os campos obrigatórios: Gerador e Quantidade de Litros')
      return
    }

    try {
      // Preparar dados para envio
      const abastecimentoData = {
        gerador_id: '1', // TODO: Implementar seleção de gerador por ID
        gerador_nome: newSupply.gerador_nome,
        data_abastecimento: new Date(),
        quantidade_litros: parseFloat(newSupply.quantidade_litros),
        valor_total: newSupply.valor_total ? parseFloat(newSupply.valor_total) : 0,
        valor_por_litro: newSupply.valor_total && newSupply.quantidade_litros ? 
          parseFloat(newSupply.valor_total) / parseFloat(newSupply.quantidade_litros) : 0,
        tipo_combustivel: newSupply.tipo_combustivel,
        fornecedor: newSupply.fornecedor || '',
        numero_nf: '',
        tecnico_responsavel_id: '1', // TODO: Implementar usuário logado
        tecnico_responsavel_nome: 'Usuário Atual', // TODO: Implementar usuário logado
        hodometro_atual: newSupply.hodometro_atual ? parseFloat(newSupply.hodometro_atual) : 0,
        nivel_tanque_antes: 'baixo' as const,
        nivel_tanque_depois: 'alto' as const,
        observacoes: newSupply.observacoes || '',
        foto_nota_fiscal: uploadedPhotos.find(p => p.tipo === 'nota_fiscal')?.file.name,
        foto_bomba: uploadedPhotos.find(p => p.tipo === 'bomba')?.file.name
      }

      // Enviar dados para a API
      await createAbastecimento.mutateAsync(abastecimentoData)
      
      // Limpar formulário após sucesso
      setIsDialogOpen(false)
      setNewSupply({
        gerador_nome: '',
        tipo_combustivel: 'gasolina' as TipoCombustivel,
        quantidade_litros: '',
        valor_total: '',
        hodometro_atual: '',
        fornecedor: '',
        observacoes: ''
      })
      
      // Limpar fotos e liberar URLs
      uploadedPhotos.forEach(photo => URL.revokeObjectURL(photo.preview))
      setUploadedPhotos([])
      
    } catch (error) {
      console.error('Erro ao registrar abastecimento:', error)
      alert('Erro ao registrar abastecimento. Tente novamente.')
    }
  }

  const getTotalLiters = () => {
    return filteredData.reduce((total, item) => total + item.quantidade_litros, 0)
  }

  const getTotalValue = () => {
    return filteredData.reduce((total, item) => total + item.valor_total, 0)
  }

  const getUniqueGenerators = (): string[] => {
    if (!abastecimentos?.dados) return []
    return [...new Set(abastecimentos.dados.map((item: Abastecimento) => item.gerador_nome))]
  }

  const getFuelTypeColor = (type: TipoCombustivel) => {
     switch (type) {
       case 'gasolina':
         return 'bg-red-100 text-red-800'
       case 'etanol':
         return 'bg-green-100 text-green-800'
       case 'diesel':
         return 'bg-blue-100 text-blue-800'
       case 'gas':
         return 'bg-purple-100 text-purple-800'
       default:
         return 'bg-gray-100 text-gray-800'
     }
   }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Abastecimento de Geradores</h1>
          <p className="text-muted-foreground">
            Gerenciamento de abastecimento e combustível para geradores
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Abastecimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Abastecimento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="gerador">Gerador</Label>
                  <Input
                    id="gerador"
                    value={newSupply.gerador_nome}
                    onChange={(e) => setNewSupply({...newSupply, gerador_nome: e.target.value})}
                    placeholder="Nome ou código do gerador"
                  />
                </div>
                <div>
                  <Label htmlFor="tipoCombustivel">Tipo de Combustível</Label>
                  <Select
                    value={newSupply.tipo_combustivel}
                    onValueChange={(value) => setNewSupply({...newSupply, tipo_combustivel: value as TipoCombustivel})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="gasolina">Gasolina</SelectItem>
                       <SelectItem value="etanol">Etanol</SelectItem>
                       <SelectItem value="diesel">Diesel</SelectItem>
                       <SelectItem value="gas">Gás</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantidade">Quantidade (L)</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      value={newSupply.quantidade_litros}
                      onChange={(e) => setNewSupply({...newSupply, quantidade_litros: e.target.value})}
                      placeholder="Litros abastecidos"
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor">Valor Total (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={newSupply.valor_total}
                      onChange={(e) => setNewSupply({...newSupply, valor_total: e.target.value})}
                      placeholder="Valor total pago"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="hodometro">Horímetro (horas)</Label>
                  <Input
                    id="hodometro"
                    type="number"
                    value={newSupply.hodometro_atual}
                    onChange={(e) => setNewSupply({...newSupply, hodometro_atual: e.target.value})}
                    placeholder="Horímetro atual em horas"
                  />
                </div>
                <div>
                  <Label htmlFor="fornecedor">Posto/Fornecedor</Label>
                  <Input
                    id="fornecedor"
                    value={newSupply.fornecedor}
                    onChange={(e) => setNewSupply({...newSupply, fornecedor: e.target.value})}
                    placeholder="Nome do posto ou fornecedor"
                  />
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={newSupply.observacoes}
                    onChange={(e) => setNewSupply({...newSupply, observacoes: e.target.value})}
                    placeholder="Observações adicionais..."
                    rows={3}
                  />
                </div>
                
                {/* Seção de Upload de Evidências */}
                <div className="space-y-4">
                  <Label>Evidências Fotográficas</Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handlePhotoUpload(e, 'nota_fiscal')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" size="sm" className="w-full">
                        <Camera className="h-4 w-4 mr-2" />
                        Nota Fiscal
                      </Button>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handlePhotoUpload(e, 'bomba')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" size="sm" className="w-full">
                        <Fuel className="h-4 w-4 mr-2" />
                        Bomba/Horímetro
                      </Button>
                    </div>
                  </div>
                  
                  {uploadedPhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 max-h-48 overflow-y-auto">
                      {uploadedPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo.preview}
                            alt={`Evidência ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            {photo.tipo === 'nota_fiscal' ? 'NF' : 'Horímetro'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {uploadedPhotos.length === 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-1">Nenhuma evidência adicionada</p>
                      <p className="text-xs text-gray-400">
                        Clique nos botões acima para adicionar fotos da nota fiscal e do horímetro
                      </p>
                    </div>
                  )}
                </div>
                
                <Button onClick={handleAddSupply} className="w-full">
                  Adicionar Abastecimento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Litros</p>
                <p className="text-2xl font-bold">{getTotalLiters().toFixed(1)}L</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">R$ {getTotalValue().toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abastecimentos</p>
                <p className="text-2xl font-bold">{filteredData.length}</p>
              </div>
              <Fuel className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Geradores</p>
                <p className="text-2xl font-bold">{getUniqueGenerators().length}</p>
              </div>
              <Fuel className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por gerador ou posto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterVehicle} onValueChange={setFilterVehicle}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por gerador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os geradores</SelectItem>
                {getUniqueGenerators().map(generator => (
                  <SelectItem key={generator} value={generator}>{generator}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterFuelType} onValueChange={setFilterFuelType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo de combustível" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">Todos os tipos</SelectItem>
                 <SelectItem value="gasolina">Gasolina</SelectItem>
                 <SelectItem value="etanol">Etanol</SelectItem>
                 <SelectItem value="diesel">Diesel</SelectItem>
                 <SelectItem value="gas">Gás</SelectItem>
               </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Fuel className="h-5 w-5 mr-2" />
              Histórico de Abastecimentos
            </CardTitle>
            <CardDescription>
              Visualize e gerencie todos os abastecimentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum abastecimento encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterVehicle !== 'all' || filterFuelType !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Adicione o primeiro abastecimento para começar.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredData.map((abastecimento) => (
                  <div key={abastecimento.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{abastecimento.gerador_nome}</h3>
                        <Badge className={getFuelTypeColor(abastecimento.tipo_combustivel)}>
                          {abastecimento.tipo_combustivel}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(abastecimento.data_abastecimento).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="font-semibold text-green-600">
                          R$ {abastecimento.valor_total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Quantidade</p>
                        <p className="font-medium">{abastecimento.quantidade_litros}L</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Horímetro</p>
                        <p className="font-medium">{abastecimento.hodometro_atual?.toLocaleString()} h</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Posto</p>
                        <p className="font-medium">{abastecimento.fornecedor}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Preço/Litro</p>
                        <p className="font-medium">
                          R$ {(abastecimento.valor_total / abastecimento.quantidade_litros).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {abastecimento.observacoes && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm text-gray-600">{abastecimento.observacoes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Supplies