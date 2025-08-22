import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DataTable from '@/components/ui/data-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Building2, Plus, Filter, Search, Users, Zap, X, MoreHorizontal, Eye, Edit, Trash2, Camera, Upload, MapPin, Thermometer } from 'lucide-react'
import { usePOPs, useCreatePOP } from '@/hooks/useAPI'
import { POP, StatusPOP } from '@/types/entities'
// import { formatDate } from '@/lib/utils' // Removido temporariamente

const POPs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusPOP | 'all'>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([])
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    latitude: '',
    longitude: '',
    quantidade_clientes: '',
    backup_ativo: false,
    observacoes: ''
  })
  
  const { data: popsData, isLoading, error } = usePOPs({
    page: 1,
    limit: 50,
    busca: searchTerm,
    status: statusFilter === 'all' ? undefined : [statusFilter]
  })
  
  const createPOP = useCreatePOP()

  const getStatusColor = (status: StatusPOP) => {
    switch (status) {
      case 'operacional': return 'default'
      case 'manutencao': return 'secondary'
      case 'critico': return 'destructive'
      case 'desmobilizacao': return 'outline'
      case 'desmobilizado': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusLabel = (status: StatusPOP) => {
    switch (status) {
      case 'operacional': return 'Operacional'
      case 'manutencao': return 'Manutenção'
      case 'critico': return 'Crítico'
      case 'desmobilizacao': return 'Desmobilização'
      case 'desmobilizado': return 'Desmobilizado'
      default: return status
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedPhotos(prev => [...prev, ...files])
  }

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    // Validações básicas
    if (!formData.nome.trim()) {
      alert('Nome do POP é obrigatório')
      return
    }
    if (!formData.tipo.trim()) {
      alert('Tipo do POP é obrigatório')
      return
    }
    if (!formData.logradouro.trim()) {
      alert('Logradouro é obrigatório')
      return
    }
    if (!formData.cidade.trim()) {
      alert('Cidade é obrigatória')
      return
    }
    if (!formData.estado.trim()) {
      alert('Estado é obrigatório')
      return
    }

    try {
      // Mapear dados para o formato esperado pelo servidor Express
      const popData = {
        name: formData.nome,
        code: `POP-${Date.now()}`, // Gerar código único
        address: `${formData.logradouro}${formData.numero ? ', ' + formData.numero : ''}, ${formData.bairro ? formData.bairro + ', ' : ''}${formData.cidade}, ${formData.estado}${formData.cep ? ' - ' + formData.cep : ''}`,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        status: 'active'
      }
      
      const fullPopData = {
        nome: popData.name,
        logradouro: popData.address,
        cidade: '',
        estado: '',
        cep: popData.code,
        tipo: 'primario' as any,
        status: popData.status as any,
        quantidade_clientes: 0,
        fotos_galeria: [],
        racks: [],
        backup_ativo: false,
        frequencia_manutencao: 'nao_aplicavel' as any
      }
      await createPOP.mutateAsync(fullPopData)
      
      setIsFormOpen(false)
      // Reset form
      setFormData({
        nome: '',
        tipo: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        latitude: '',
        longitude: '',
        quantidade_clientes: '',
        backup_ativo: false,
        observacoes: ''
      })
      setUploadedPhotos([])
    } catch (error) {
      console.error('Erro ao criar POP:', error)
      alert('Erro ao criar POP. Tente novamente.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">POPs</h1>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
        <div className="grid gap-4">
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
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar POPs</h3>
          <p className="text-gray-500">Tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }

  const pops = popsData?.dados || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">POPs</h1>
          <p className="text-muted-foreground">
            Gerenciamento de Pontos de Presença ({pops.length} encontrados)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo POP
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo POP</DialogTitle>
                <DialogDescription>
                  Preencha as informações do novo Ponto de Presença
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basicas" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basicas">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="localizacao">Localização</TabsTrigger>
                  <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
                  <TabsTrigger value="fotos">Fotos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basicas" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do POP *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        placeholder="Ex: POP Centro"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo *</Label>
                      <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primario">Primário</SelectItem>
                          <SelectItem value="secundario">Secundário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientes">Quantidade de Clientes</Label>
                      <Input
                        id="clientes"
                        type="number"
                        value={formData.quantidade_clientes}
                        onChange={(e) => handleInputChange('quantidade_clientes', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backup">Backup Ativo</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="backup"
                          checked={formData.backup_ativo}
                          onChange={(e) => handleInputChange('backup_ativo', e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="backup">Possui backup ativo</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      placeholder="Informações adicionais sobre o POP"
                      rows={3}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="localizacao" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="logradouro">Logradouro *</Label>
                      <Input
                        id="logradouro"
                        value={formData.logradouro}
                        onChange={(e) => handleInputChange('logradouro', e.target.value)}
                        placeholder="Rua, Avenida, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        value={formData.numero}
                        onChange={(e) => handleInputChange('numero', e.target.value)}
                        placeholder="123"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={formData.bairro}
                        onChange={(e) => handleInputChange('bairro', e.target.value)}
                        placeholder="Centro"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade *</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => handleInputChange('cidade', e.target.value)}
                        placeholder="São Paulo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado *</Label>
                      <Input
                        id="estado"
                        value={formData.estado}
                        onChange={(e) => handleInputChange('estado', e.target.value)}
                        placeholder="SP"
                        maxLength={2}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => handleInputChange('cep', e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        value={formData.latitude}
                        onChange={(e) => handleInputChange('latitude', e.target.value)}
                        placeholder="-23.5505"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        value={formData.longitude}
                        onChange={(e) => handleInputChange('longitude', e.target.value)}
                        placeholder="-46.6333"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="equipamentos" className="space-y-4">
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Equipamentos</h3>
                    <p className="text-gray-500 mb-4">
                      Esta seção será implementada para gerenciar os equipamentos do POP
                    </p>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Equipamento
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="fotos" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Fotos do POP</Label>
                      <div className="relative">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Adicionar Fotos
                        </Button>
                      </div>
                    </div>
                    
                    {uploadedPhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {uploadedPhotos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removePhoto(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {photo.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {uploadedPhotos.length === 0 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">Nenhuma foto adicionada</p>
                        <p className="text-sm text-gray-400">
                          Clique em "Adicionar Fotos" para fazer upload das imagens
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  Cadastrar POP
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar POPs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusPOP | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">Todos os Status</option>
          <option value="operacional">Operacional</option>
          <option value="manutencao">Manutenção</option>
          <option value="critico">Crítico</option>
          <option value="desmobilizacao">Desmobilização</option>
          <option value="desmobilizado">Desmobilizado</option>
        </select>
      </div>

      {/* Tabela Responsiva de POPs */}
      <DataTable
        data={pops}
        columns={[
          {
            key: 'nome',
            label: 'Nome',
            render: (pop: POP) => (
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{pop.nome}</span>
              </div>
            )
          },
          {
            key: 'endereco',
            label: 'Endereço',
            render: (pop: POP) => (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span>{pop.cidade}, {pop.estado}</span>
              </div>
            )
          },
          {
            key: 'status',
            label: 'Status',
            render: (pop: POP) => (
              <Badge variant={getStatusColor(pop.status)}>
                {getStatusLabel(pop.status)}
              </Badge>
            )
          },
          {
            key: 'clientes',
            label: 'Clientes',
            render: (pop: POP) => (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{pop.quantidade_clientes}</span>
              </div>
            )
          },
          {
            key: 'temperatura',
            label: 'Temperatura',
            render: (pop: POP) => (
              <div className="flex items-center space-x-1">
                <Thermometer className="h-4 w-4 text-gray-500" />
                <span>{pop.temperatura ? `${pop.temperatura}°C` : '-'}</span>
              </div>
            )
          },
          {
            key: 'backup',
            label: 'Backup',
            render: (pop: POP) => (
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4 text-gray-500" />
                <span>{pop.backup_ativo ? 'Ativo' : 'Inativo'}</span>
              </div>
            )
          },
          {
            key: 'actions',
            label: 'Ações',
            render: () => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
        ]}
        loading={isLoading}
        emptyMessage="Nenhum POP encontrado"
      />

      {/* Empty State */}
      {pops.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum POP encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando seu primeiro POP.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro POP
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default POPs