import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Activity, Plus, Search, Clock, User, MapPin, CheckCircle, AlertCircle, Calendar, Download, Trash2, Edit } from 'lucide-react'
import { useAtividades, usePOPs, useTecnicos, useCreateAtividade } from '@/hooks/useAPI'
import { Atividade, TipoAtividade, StatusAtividade } from '@/types/entities'
import { formatDate } from '@/lib/utils'

// SmartSearchSelect Component
const SmartSearchSelect: React.FC<{
  options: Array<{id: string, nome: string}>
  value: string
  onChange: (value: string) => void
  placeholder: string
  searchPlaceholder: string
}> = ({ options, value, onChange, placeholder, searchPlaceholder }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  
  const filteredOptions = options.filter(option => 
    option.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const selectedOption = options.find(option => option.id === value)
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        {selectedOption ? selectedOption.nome : placeholder}
      </Button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          <div className="p-2">
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.map((option) => (
              <button
                key={option.id}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                onClick={() => {
                  onChange(option.id)
                  setIsOpen(false)
                  setSearchTerm('')
                }}
              >
                {option.nome}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const Activities: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({
    descricao: '',
    observacoes: '',
    pop_id: '',
    tecnico_id: '',
    data_agendada: '',
    prioridade: 'media',
    tipo: 'manutencao_ar_condicionado'
  })
  
  const { data: atividadesData, isLoading, error } = useAtividades({
    page: 1,
    limit: 50
  })
  
  const { data: popsData } = usePOPs({ page: 1, limit: 100 })
  const { data: tecnicosData } = useTecnicos({ page: 1, limit: 100 })
  const createAtividade = useCreateAtividade()
  
  const pops = popsData?.dados || []
  const tecnicos = tecnicosData?.dados || []
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleSubmit = async () => {
    // Validações básicas
    if (!formData.descricao.trim()) {
      alert('Descrição é obrigatória')
      return
    }
    if (!formData.pop_id) {
      alert('Selecione um POP')
      return
    }
    if (!formData.tecnico_id) {
      alert('Selecione um técnico')
      return
    }
    if (!formData.data_agendada) {
      alert('Data agendada é obrigatória')
      return
    }

    try {
      // Mapear dados para o formato esperado pelo servidor Express
      const activityData = {
        title: formData.descricao,
        description: formData.observacoes || formData.descricao,
        type: formData.tipo,
        status: 'pending',
        priority: formData.prioridade,
        assigned_to: parseInt(formData.tecnico_id),
        pop_id: parseInt(formData.pop_id),
        scheduled_date: new Date(formData.data_agendada)
      }
      
      await createAtividade.mutateAsync(activityData)
      
      // Reset form
      setFormData({
        descricao: '',
        observacoes: '',
        pop_id: '',
        tecnico_id: '',
        data_agendada: '',
        prioridade: 'media',
        tipo: 'manutencao_ar_condicionado'
      })
      
      setActiveTab('list')
    } catch (error) {
      console.error('Erro ao criar atividade:', error)
      alert('Erro ao criar atividade. Tente novamente.')
    }
  }
  
  const handleSelectActivity = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    )
  }
  
  const handleSelectAll = () => {
    const allIds = filteredAtividades.map((atividade: Atividade) => atividade.id)
    setSelectedActivities(prev => 
      prev.length === allIds.length ? [] : allIds
    )
  }
  
  const handleExport = () => {
    const selectedData = filteredAtividades.filter((atividade: Atividade) => 
      selectedActivities.includes(atividade.id)
    )
    console.log('Exportando atividades:', selectedData)
    // Aqui seria implementada a lógica de exportação
  }
  
  const handleBulkDelete = () => {
    console.log('Excluindo atividades:', selectedActivities)
    setSelectedActivities([])
    // Aqui seria implementada a lógica de exclusão em massa
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'concluida': return 'default'
      case 'em_andamento': return 'secondary'
      case 'pendente': return 'outline'
      case 'cancelada': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'concluida': return 'Concluída'
      case 'em_andamento': return 'Em Andamento'
      case 'pendente': return 'Pendente'
      case 'cancelada': return 'Cancelada'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'concluida': return <CheckCircle className="h-4 w-4" />
      case 'em_andamento': return <Clock className="h-4 w-4" />
      case 'pendente': return <AlertCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Atividades</h1>
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
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar atividades</h3>
          <p className="text-gray-500">Tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }

  const atividades = atividadesData?.dados || []
  const filteredAtividades = atividades.filter((atividade: Atividade) => {
    if (statusFilter !== 'all' && atividade.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atividades</h1>
          <p className="text-muted-foreground">
            Gerenciamento de atividades e tarefas ({filteredAtividades.length} encontradas)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="list">Lista</TabsTrigger>
                <TabsTrigger value="create">Nova Atividade</TabsTrigger>
                <TabsTrigger value="bulk">Ações em Massa</TabsTrigger>
              </TabsList>
              
              {activeTab === 'bulk' && selectedActivities.length > 0 && (
                <div className="flex gap-2">
                  <Button onClick={handleExport} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar ({selectedActivities.length})
                  </Button>
                  <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir ({selectedActivities.length})
                  </Button>
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </div>

      <TabsContent value="list" className="space-y-6">
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar atividades..."
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
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {activeTab === 'bulk' && (
            <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                checked={selectedActivities.length === filteredAtividades.length && filteredAtividades.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label>Selecionar Todas ({filteredAtividades.length})</Label>
            </div>
          )}
          {filteredAtividades.map((atividade: Atividade) => (
            <Card key={atividade.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {activeTab === 'bulk' && (
                    <div className="flex items-center mr-4">
                      <Checkbox
                        checked={selectedActivities.includes(atividade.id)}
                        onCheckedChange={() => handleSelectActivity(atividade.id)}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(atividade.status)}
                    <h3 className="text-lg font-semibold">{atividade.descricao}</h3>
                    <Badge variant={getStatusColor(atividade.status)}>
                      {getStatusLabel(atividade.status)}
                    </Badge>
                  </div>
                  
                  {atividade.observacoes && (
                    <p className="text-gray-600 mb-3">{atividade.observacoes}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                    {atividade.tecnicos_nomes && atividade.tecnicos_nomes.length > 0 && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>{atividade.tecnicos_nomes[0]}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{atividade.pop_nome}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Criada em {formatDate(atividade.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center space-x-6 text-sm">
                      <div>
                        <span className="text-gray-500">Agendada: </span>
                        <span className="font-medium">{formatDate(atividade.data_agendada)}</span>
                      </div>
                      {atividade.data_conclusao && (
                        <div>
                          <span className="text-gray-500">Concluída: </span>
                          <span className="font-medium">{formatDate(atividade.data_conclusao)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="create" className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    placeholder="Descreva a atividade..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manutencao_ar_condicionado">Manutenção Ar Condicionado</SelectItem>
                      <SelectItem value="limpeza_pop">Limpeza POP</SelectItem>
                      <SelectItem value="instalacao_equipamento">Instalação Equipamento</SelectItem>
                      <SelectItem value="reparo_rede">Reparo Rede</SelectItem>
                      <SelectItem value="upgrade_sistema">Upgrade Sistema</SelectItem>
                      <SelectItem value="inspecao_seguranca">Inspeção Segurança</SelectItem>
                      <SelectItem value="manutencao_gerador">Manutenção Gerador</SelectItem>
                      <SelectItem value="backup_dados">Backup Dados</SelectItem>
                      <SelectItem value="monitoramento">Monitoramento</SelectItem>
                      <SelectItem value="documentacao">Documentação</SelectItem>
                      <SelectItem value="treinamento">Treinamento</SelectItem>
                      <SelectItem value="auditoria">Auditoria</SelectItem>
                      <SelectItem value="emergencia">Emergência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>POP *</Label>
                  <SmartSearchSelect
                    options={pops.map(pop => ({ id: pop.id, nome: pop.nome }))}
                    value={formData.pop_id}
                    onChange={(value) => handleInputChange('pop_id', value)}
                    placeholder="Selecione um POP"
                    searchPlaceholder="Buscar POP..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Técnico Responsável *</Label>
                  <SmartSearchSelect
                    options={tecnicos.map(tecnico => ({ id: tecnico.id, nome: tecnico.nome }))}
                    value={formData.tecnico_id}
                    onChange={(value) => handleInputChange('tecnico_id', value)}
                    placeholder="Selecione um técnico"
                    searchPlaceholder="Buscar técnico..."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_agendada">Data Agendada</Label>
                  <Input
                    id="data_agendada"
                    type="datetime-local"
                    value={formData.data_agendada}
                    onChange={(e) => handleInputChange('data_agendada', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select value={formData.prioridade} onValueChange={(value) => handleInputChange('prioridade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActiveTab('list')}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  Criar Atividade
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="bulk" className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Ações em Massa</h3>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedActivities.length === filteredAtividades.length && filteredAtividades.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label>Selecionar Todas ({filteredAtividades.length})</Label>
                </div>
              </div>
              
              {selectedActivities.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    {selectedActivities.length} atividade(s) selecionada(s)
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button onClick={handleExport} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Selecionadas
                    </Button>
                    <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Selecionadas
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Lista de atividades para seleção em massa */}
        <div className="space-y-4">
          {filteredAtividades.map((atividade: Atividade) => (
            <Card key={atividade.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center mr-4">
                    <Checkbox
                      checked={selectedActivities.includes(atividade.id)}
                      onCheckedChange={() => handleSelectActivity(atividade.id)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(atividade.status)}
                      <h3 className="text-lg font-semibold">{atividade.descricao}</h3>
                      <Badge variant={getStatusColor(atividade.status)}>
                        {getStatusLabel(atividade.status)}
                      </Badge>
                    </div>
                    
                    {atividade.observacoes && (
                      <p className="text-gray-600 mb-3">{atividade.observacoes}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      {atividade.tecnicos_nomes && atividade.tecnicos_nomes.length > 0 && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>{atividade.tecnicos_nomes[0]}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{atividade.pop_nome}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Criada em {formatDate(atividade.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
      {/* Empty State */}
      {filteredAtividades.length === 0 && activeTab === 'list' && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando sua primeira atividade.'}
            </p>
            <div className="flex justify-center space-x-4">
              {(searchTerm || statusFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
              <Button onClick={() => setActiveTab('create')}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Atividade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Activities