import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog'
import { Checkbox } from './checkbox'
import { 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
 
 
  CheckSquare,
  Save,
  X,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { ChecklistTemplate, ChecklistItem, TipoChecklistItem } from '@/types/entities'

import { toast } from 'sonner'

interface ChecklistTemplateManagerProps {
  templates: ChecklistTemplate[]
  onSave: (template: Omit<ChecklistTemplate, 'id' | 'created_at' | 'updated_at'>) => void
  onUpdate: (id: string, template: Partial<ChecklistTemplate>) => void
  onDelete: (id: string) => void
  onDuplicate: (template: ChecklistTemplate) => void
}

interface TemplateFormData {
  nome: string
  descricao: string
  categoria: string
  itens: ChecklistItem[]
}

interface ItemFormData {
  titulo: string
  descricao: string
  tipo: TipoChecklistItem
  obrigatorio: boolean
  opcoes: string[]
}

const ITEM_TYPES = [
  { value: 'sim_nao', label: 'Sim/Não' },
  { value: 'multipla_escolha', label: 'Múltipla Escolha' },
  { value: 'texto', label: 'Texto Curto' },
  { value: 'texto_longo', label: 'Texto Longo' },
  { value: 'numero', label: 'Número' }
] as const

const CATEGORIAS = [
  'Manutenção Preventiva',
  'Manutenção Corretiva',
  'Inspeção',
  'Instalação',
  'Configuração',
  'Teste',
  'Outros'
]

export function ChecklistTemplateManager({
  templates,
  onSave,
  onUpdate,
  onDelete,
  onDuplicate
}: ChecklistTemplateManagerProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null)
  const [formData, setFormData] = useState<TemplateFormData>({
    nome: '',
    descricao: '',
    categoria: '',
    itens: []
  })
  const [itemForm, setItemForm] = useState<ItemFormData>({
    titulo: '',
    descricao: '',
    tipo: 'sim_nao',
    obrigatorio: false,
    opcoes: []
  })
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      categoria: '',
      itens: []
    })
    setEditingTemplate(null)
  }

  const resetItemForm = () => {
    setItemForm({
      titulo: '',
      descricao: '',
      tipo: 'sim_nao',
      obrigatorio: false,
      opcoes: []
    })
    setEditingItemIndex(null)
  }

  const handleOpenDialog = (template?: ChecklistTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setFormData({
        nome: template.nome,
        descricao: template.descricao || '',
        categoria: template.categoria || '',
        itens: [...template.itens]
      })
    } else {
      resetForm()
    }
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    resetForm()
  }

  const handleSaveTemplate = () => {
    if (!formData.nome.trim()) {
      toast.error('Nome do template é obrigatório')
      return
    }

    if (formData.itens.length === 0) {
      toast.error('Adicione pelo menos um item ao template')
      return
    }

    if (editingTemplate) {
      onUpdate(editingTemplate.id, formData)
      toast.success('Template atualizado com sucesso!')
    } else {
      onSave(formData)
      toast.success('Template criado com sucesso!')
    }

    handleCloseDialog()
  }

  const handleAddItem = () => {
    if (!itemForm.titulo.trim()) {
      toast.error('Título do item é obrigatório')
      return
    }

    const newItem: ChecklistItem = {
      id: Math.random().toString(36).substr(2, 9),
      titulo: itemForm.titulo,
      descricao: itemForm.descricao,
      tipo: itemForm.tipo,
      obrigatorio: itemForm.obrigatorio,
      ordem: formData.itens.length + 1,
      opcoes: itemForm.tipo === 'multipla_escolha' ? itemForm.opcoes : undefined
    }

    if (editingItemIndex !== null) {
      const updatedItems = [...formData.itens]
      updatedItems[editingItemIndex] = { ...newItem, ordem: editingItemIndex + 1 }
      setFormData(prev => ({ ...prev, itens: updatedItems }))
      toast.success('Item atualizado!')
    } else {
      setFormData(prev => ({ ...prev, itens: [...prev.itens, newItem] }))
      toast.success('Item adicionado!')
    }

    setShowItemDialog(false)
    resetItemForm()
  }

  const handleEditItem = (index: number) => {
    const item = formData.itens[index]
    setItemForm({
      titulo: item.titulo,
      descricao: item.descricao || '',
      tipo: item.tipo,
      obrigatorio: item.obrigatorio,
      opcoes: item.opcoes || []
    })
    setEditingItemIndex(index)
    setShowItemDialog(true)
  }

  const handleDeleteItem = (index: number) => {
    const updatedItems = formData.itens.filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, ordem: i + 1 }))
    setFormData(prev => ({ ...prev, itens: updatedItems }))
    toast.success('Item removido!')
  }

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= formData.itens.length) return

    const updatedItems = [...formData.itens]
    const temp = updatedItems[index]
    updatedItems[index] = updatedItems[newIndex]
    updatedItems[newIndex] = temp

    // Atualizar ordem
    updatedItems.forEach((item, i) => {
      item.ordem = i + 1
    })

    setFormData(prev => ({ ...prev, itens: updatedItems }))
  }

  const handleAddOption = () => {
    setItemForm(prev => ({
      ...prev,
      opcoes: [...prev.opcoes, `Opção ${prev.opcoes.length + 1}`]
    }))
  }

  const handleUpdateOption = (index: number, value: string) => {
    const updatedOpcoes = [...itemForm.opcoes]
    updatedOpcoes[index] = value
    setItemForm(prev => ({ ...prev, opcoes: updatedOpcoes }))
  }

  const handleRemoveOption = (index: number) => {
    setItemForm(prev => ({
      ...prev,
      opcoes: prev.opcoes.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Templates de Checklist</h2>
          <p className="text-gray-600">Gerencie templates reutilizáveis para suas manutenções</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Lista de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center text-lg">
                    <CheckSquare className="h-5 w-5 mr-2 text-blue-600" />
                    {template.nome}
                  </CardTitle>
                  {template.descricao && (
                    <CardDescription className="mt-1">
                      {template.descricao}
                    </CardDescription>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                {template.categoria && (
                  <Badge variant="outline">{template.categoria}</Badge>
                )}
                <Badge variant="secondary">
                  {template.itens.length} itens
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* Preview dos primeiros itens */}
                <div className="space-y-1">
                  {template.itens.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="flex items-center text-sm text-gray-600">
                      <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-2">
                        {index + 1}
                      </span>
                      <span className="truncate">{item.titulo}</span>
                      {item.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                    </div>
                  ))}
                  {template.itens.length > 3 && (
                    <div className="text-sm text-gray-500 ml-6">
                      +{template.itens.length - 3} itens adicionais
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDialog(template)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDuplicate(template)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {new Date(template.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Template */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes do template e adicione os itens do checklist
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Template *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Manutenção Preventiva POP"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva o propósito deste template..."
                rows={3}
              />
            </div>

            {/* Lista de itens */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Itens do Checklist</h3>
                <Button
                  onClick={() => setShowItemDialog(true)}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              {formData.itens.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum item adicionado ainda</p>
                  <p className="text-sm">Clique em "Adicionar Item" para começar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.itens.map((item, index) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="flex flex-col space-y-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMoveItem(index, 'up')}
                              disabled={index === 0}
                              className="h-6 w-6 p-0"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMoveItem(index, 'down')}
                              disabled={index === formData.itens.length - 1}
                              className="h-6 w-6 p-0"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{item.titulo}</span>
                              {item.obrigatorio && <span className="text-red-500">*</span>}
                              <Badge variant="outline" className="text-xs">
                                {ITEM_TYPES.find(t => t.value === item.tipo)?.label}
                              </Badge>
                            </div>
                            {item.descricao && (
                              <p className="text-sm text-gray-600 mt-1">{item.descricao}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditItem(index)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              {editingTemplate ? 'Atualizar' : 'Criar'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Item */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItemIndex !== null ? 'Editar Item' : 'Novo Item'}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes do item do checklist
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-titulo">Título *</Label>
              <Input
                id="item-titulo"
                value={itemForm.titulo}
                onChange={(e) => setItemForm(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Verificar temperatura do equipamento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-descricao">Descrição</Label>
              <Textarea
                id="item-descricao"
                value={itemForm.descricao}
                onChange={(e) => setItemForm(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Instruções detalhadas para este item..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-tipo">Tipo de Resposta</Label>
              <Select
                value={itemForm.tipo}
                onValueChange={(value: TipoChecklistItem) => setItemForm(prev => ({ ...prev, tipo: value, opcoes: [] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_TYPES.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Opções para múltipla escolha */}
            {itemForm.tipo === 'multipla_escolha' && (
              <div className="space-y-2">
                <Label>Opções</Label>
                <div className="space-y-2">
                  {itemForm.opcoes.map((opcao, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={opcao}
                        onChange={(e) => handleUpdateOption(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddOption}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Opção
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="item-obrigatorio"
                checked={itemForm.obrigatorio}
                onCheckedChange={(checked) => setItemForm(prev => ({ ...prev, obrigatorio: !!checked }))}
              />
              <Label htmlFor="item-obrigatorio">Item obrigatório</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem}>
              {editingItemIndex !== null ? 'Atualizar' : 'Adicionar'} Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ChecklistTemplateManager