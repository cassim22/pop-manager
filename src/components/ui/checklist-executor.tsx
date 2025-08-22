import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Input } from './input'
import { Textarea } from './textarea'
import { Label } from './label'
import { Progress } from './progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
// Removed unused Checkbox import
import { RadioGroup, RadioGroupItem } from './radio-group'
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare,
  Play,
  Pause,
  Save
} from 'lucide-react'
import { ChecklistTemplate, ChecklistItem, ChecklistExecution } from '@/types/entities'
import { cn } from '@/lib/utils'

interface ChecklistExecutorProps {
  template: ChecklistTemplate
  execution?: ChecklistExecution
  onSave: (execution: ChecklistExecution) => void
  onComplete: (execution: ChecklistExecution) => void
  onCancel?: () => void
  onPause?: () => void
  readOnly?: boolean
  className?: string
}

interface ItemResponse {
  itemId: string
  valor: string | number | boolean | string[]
  observacoes?: string
  fotos?: string[]
  timestamp: Date
}

export function ChecklistExecutor({
  template,
  execution,
  onSave,
  onComplete,
  onPause,
  readOnly = false,
  className
}: ChecklistExecutorProps) {
  const [responses, setResponses] = useState<Record<string, ItemResponse>>({})
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [startTime, setStartTime] = useState<Date>(new Date())
  const [isExecuting, setIsExecuting] = useState(false)
  const [showAllItems, setShowAllItems] = useState(false)

  // Inicializar respostas existentes
  useEffect(() => {
    if (execution?.itens) {
      const existingResponses: Record<string, ItemResponse> = {}
      execution.itens.forEach(item => {
        if (item.concluido) {
          existingResponses[item.item_id] = {
            itemId: item.item_id,
            valor: item.valor || '',
            observacoes: item.observacoes,
            fotos: item.fotos,
            timestamp: new Date()
          }
        }
      })
      setResponses(existingResponses)
    }
    
    if (execution?.data_inicio) {
      setStartTime(new Date(execution.data_inicio))
      setIsExecuting(execution.status === 'em_andamento')
    }
  }, [execution])

  const handleItemResponse = (itemId: string, valor: string | boolean | string[]) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        itemId,
        valor,
        timestamp: new Date()
      }
    }))
  }

  const handleObservation = (itemId: string, observacoes: string) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        itemId,
        valor: prev[itemId]?.valor || '',
        observacoes,
        timestamp: new Date()
      }
    }))
  }

  const getProgress = () => {
    const totalItems = template.itens.length
    const completedItems = template.itens.filter(item => {
      const response = responses[item.id]
      return response && response.valor !== undefined && response.valor !== ''
    }).length
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0
  }

  const isItemComplete = (item: ChecklistItem) => {
    const response = responses[item.id]
    return response && response.valor !== undefined && response.valor !== ''
  }

  const getItemStatus = (item: ChecklistItem) => {
    if (isItemComplete(item)) {
      const response = responses[item.id]
      if (item.tipo === 'sim_nao' && response.valor === false) {
        return 'warning'
      }
      return 'completed'
    }
    return 'pending'
  }

  const handleStart = () => {
    setIsExecuting(true)
    setStartTime(new Date())
  }

  const handleSave = () => {
    const executionData: ChecklistExecution = {
      id: execution?.id || Math.random().toString(36).substr(2, 9),
      template_id: template.id,
      template_name: template.nome,
      tecnico: execution?.tecnico || { id: '1', nome: 'Técnico Padrão' },
      status: isExecuting ? 'em_andamento' : 'nao_iniciado',
      data_inicio: startTime,
      progresso: getProgress(),
      itens: template.itens.map(item => {
        const response = responses[item.id]
        return {
          item_id: item.id,
          titulo: item.titulo,
          tipo: item.tipo,
          concluido: !!response,
          valor: response?.valor,
          observacoes: response?.observacoes,
          fotos: response?.fotos || []
        }
      }),
      created_at: execution?.created_at || new Date(),
      updated_at: new Date()
    }
    onSave(executionData)
  }

  const handleComplete = () => {
    const progress = getProgress()
    if (progress < 100) {
      const missingItems = template.itens.filter(item => !isItemComplete(item))
      const requiredMissing = missingItems.filter(item => item.obrigatorio)
      
      if (requiredMissing.length > 0) {
        alert(`Itens obrigatórios não preenchidos: ${requiredMissing.map(i => i.titulo).join(', ')}`)
        return
      }
    }

    const executionData: ChecklistExecution = {
      id: execution?.id || Math.random().toString(36).substr(2, 9),
      template_id: template.id,
      template_name: template.nome,
      tecnico: execution?.tecnico || { id: '1', nome: 'Técnico Padrão' },
      status: 'concluido',
      data_inicio: startTime,
      data_conclusao: new Date(),
      progresso: 100,
      itens: template.itens.map(item => {
        const response = responses[item.id]
        return {
          item_id: item.id,
          titulo: item.titulo,
          tipo: item.tipo,
          concluido: !!response,
          valor: response?.valor,
          observacoes: response?.observacoes,
          fotos: response?.fotos || []
        }
      }),
      created_at: execution?.created_at || new Date(),
      updated_at: new Date()
    }
    onComplete(executionData)
  }

  const renderItemInput = (item: ChecklistItem) => {
    const response = responses[item.id]
    const currentValue = response?.valor

    switch (item.tipo) {
      case 'sim_nao':
        return (
          <RadioGroup
            value={currentValue?.toString() || ''}
            onValueChange={(value) => handleItemResponse(item.id, value === 'true')}
            disabled={readOnly}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${item.id}-sim`} />
              <Label htmlFor={`${item.id}-sim`} className="text-green-600 font-medium">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${item.id}-nao`} />
              <Label htmlFor={`${item.id}-nao`} className="text-red-600 font-medium">Não</Label>
            </div>
          </RadioGroup>
        )

      case 'multipla_escolha':
        return (
          <Select
            value={currentValue?.toString() || ''}
            onValueChange={(value) => handleItemResponse(item.id, value)}
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {item.opcoes?.map((opcao, index) => (
                <SelectItem key={index} value={opcao}>
                  {opcao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'texto_livre':
        return (
          <Input
            value={currentValue?.toString() || ''}
            onChange={(e) => handleItemResponse(item.id, e.target.value)}
            placeholder="Digite sua resposta"
            disabled={readOnly}
          />
        )

      case 'numero':
        return (
          <Input
            type="number"
            value={currentValue?.toString() || ''}
            onChange={(e) => handleItemResponse(item.id, e.target.value)}
            placeholder="Digite um número"
            disabled={readOnly}
          />
        )

      case 'upload_foto':
        return (
          <Textarea
            value={currentValue?.toString() || ''}
            onChange={(e) => handleItemResponse(item.id, e.target.value)}
            placeholder="Digite sua resposta detalhada"
            disabled={readOnly}
            rows={3}
          />
        )

      default:
        return null
    }
  }

  const currentItem = template.itens[currentItemIndex]
  const progress = getProgress()

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header com progresso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                {template.nome}
              </CardTitle>
              <CardDescription>{template.descricao}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isExecuting ? 'default' : 'secondary'}>
                {isExecuting ? 'Em Execução' : 'Pausado'}
              </Badge>
              {!readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllItems(!showAllItems)}
                >
                  {showAllItems ? 'Modo Sequencial' : 'Ver Todos'}
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Controles */}
      {!readOnly && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!isExecuting ? (
              <Button onClick={handleStart}>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Checklist
              </Button>
            ) : (
              <Button variant="outline" onClick={onPause}>
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Progresso
            </Button>
            
            {progress >= 80 && (
              <Button onClick={handleComplete}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar Checklist
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Lista de itens */}
      <div className="space-y-4">
        {showAllItems ? (
          // Mostrar todos os itens
          template.itens.map((item, index) => (
            <Card key={item.id} className={cn(
              'transition-all duration-200',
              getItemStatus(item) === 'completed' && 'border-green-200 bg-green-50',
              getItemStatus(item) === 'warning' && 'border-yellow-200 bg-yellow-50'
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center">
                      {getItemStatus(item) === 'completed' ? (
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      ) : getItemStatus(item) === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                      ) : (
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      )}
                      {item.titulo}
                      {item.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                    </CardTitle>
                    {item.descricao && (
                      <CardDescription className="mt-1">{item.descricao}</CardDescription>
                    )}
                  </div>
                  <Badge variant="outline">{index + 1}</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {renderItemInput(item)}
                
                {/* Campo de observações */}
                <div>
                  <Label className="text-sm text-gray-600 flex items-center mb-2">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Observações (opcional)
                  </Label>
                  <Textarea
                    value={responses[item.id]?.observacoes || ''}
                    onChange={(e) => handleObservation(item.id, e.target.value)}
                    placeholder="Adicione observações sobre este item..."
                    disabled={readOnly}
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Modo sequencial - mostrar apenas o item atual
          currentItem && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium mr-3">
                      {currentItemIndex + 1} de {template.itens.length}
                    </span>
                    {currentItem.titulo}
                    {currentItem.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                  </CardTitle>
                </div>
                {currentItem.descricao && (
                  <CardDescription>{currentItem.descricao}</CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {renderItemInput(currentItem)}
                
                <div>
                  <Label className="text-sm text-gray-600 flex items-center mb-2">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Observações (opcional)
                  </Label>
                  <Textarea
                    value={responses[currentItem.id]?.observacoes || ''}
                    onChange={(e) => handleObservation(currentItem.id, e.target.value)}
                    placeholder="Adicione observações sobre este item..."
                    disabled={readOnly}
                    rows={2}
                  />
                </div>
                
                {/* Navegação */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentItemIndex(Math.max(0, currentItemIndex - 1))}
                    disabled={currentItemIndex === 0 || readOnly}
                  >
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Item {currentItemIndex + 1} de {template.itens.length}
                  </span>
                  
                  <Button
                    onClick={() => setCurrentItemIndex(Math.min(template.itens.length - 1, currentItemIndex + 1))}
                    disabled={currentItemIndex === template.itens.length - 1 || readOnly}
                  >
                    Próximo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  )
}

export default ChecklistExecutor