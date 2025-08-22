import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import {
  Plus, Search, MoreVertical, Edit, Trash2, Copy,
  Download, Eye, Star, StarOff, Clock,
  FileText, BarChart3, PieChart, Building2,
  Activity, Settings
} from 'lucide-react'

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'operacional' | 'infraestrutura' | 'desempenho' | 'financeiro' | 'personalizado'
  author: string
  createdAt: string
  updatedAt: string
  isPublic: boolean
  isFavorite: boolean
  usageCount: number
  rating: number
  tags: string[]
  config: {
    dataSources: string[]
    filters: any[]
    metrics: any[]
    visualizations: any[]
    schedule?: any
    format: 'pdf' | 'excel' | 'csv'
  }
}

interface ReportTemplatesProps {
  onUseTemplate?: (template: ReportTemplate) => void
  onEditTemplate?: (template: ReportTemplate) => void
  onCreateTemplate?: () => void
}

// Templates mock
const mockTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Relatório Mensal de Operações',
    description: 'Relatório completo das operações mensais incluindo POPs, atividades e performance',
    category: 'operacional',
    author: 'Sistema',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    isPublic: true,
    isFavorite: true,
    usageCount: 234,
    rating: 4.8,
    tags: ['mensal', 'operações', 'pops', 'atividades'],
    config: {
      dataSources: ['pops', 'atividades', 'tecnicos'],
      filters: [],
      metrics: [],
      visualizations: [],
      format: 'pdf'
    }
  },
  {
    id: '2',
    name: 'Status de Infraestrutura',
    description: 'Visão geral do status da infraestrutura de rede e equipamentos',
    category: 'infraestrutura',
    author: 'João Silva',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-12',
    isPublic: true,
    isFavorite: false,
    usageCount: 189,
    rating: 4.6,
    tags: ['infraestrutura', 'rede', 'equipamentos', 'status'],
    config: {
      dataSources: ['pops', 'geradores'],
      filters: [],
      metrics: [],
      visualizations: [],
      format: 'excel'
    }
  },
  {
    id: '3',
    name: 'Análise de Performance Técnicos',
    description: 'Relatório de desempenho e produtividade dos técnicos',
    category: 'desempenho',
    author: 'Maria Santos',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-14',
    isPublic: false,
    isFavorite: true,
    usageCount: 156,
    rating: 4.4,
    tags: ['técnicos', 'performance', 'produtividade'],
    config: {
      dataSources: ['tecnicos', 'atividades'],
      filters: [],
      metrics: [],
      visualizations: [],
      format: 'pdf'
    }
  },
  {
    id: '4',
    name: 'Custos Operacionais Detalhado',
    description: 'Análise detalhada dos custos operacionais por categoria',
    category: 'financeiro',
    author: 'Carlos Oliveira',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-13',
    isPublic: true,
    isFavorite: false,
    usageCount: 134,
    rating: 4.7,
    tags: ['custos', 'financeiro', 'operacional'],
    config: {
      dataSources: ['atividades', 'geradores'],
      filters: [],
      metrics: [],
      visualizations: [],
      format: 'excel'
    }
  },
  {
    id: '5',
    name: 'Manutenções Preventivas',
    description: 'Relatório personalizado de manutenções preventivas e corretivas',
    category: 'personalizado',
    author: 'Ana Costa',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-15',
    isPublic: false,
    isFavorite: true,
    usageCount: 98,
    rating: 4.5,
    tags: ['manutenções', 'preventiva', 'corretiva'],
    config: {
      dataSources: ['manutencoes', 'geradores'],
      filters: [],
      metrics: [],
      visualizations: [],
      format: 'pdf'
    }
  }
]

const categoryIcons = {
  operacional: <Activity className="h-4 w-4" />,
  infraestrutura: <Building2 className="h-4 w-4" />,
  desempenho: <BarChart3 className="h-4 w-4" />,
  financeiro: <PieChart className="h-4 w-4" />,
  personalizado: <Settings className="h-4 w-4" />
}

const categoryColors = {
  operacional: 'bg-blue-100 text-blue-800 border-blue-200',
  infraestrutura: 'bg-green-100 text-green-800 border-green-200',
  desempenho: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  financeiro: 'bg-red-100 text-red-800 border-red-200',
  personalizado: 'bg-purple-100 text-purple-800 border-purple-200'
}

const ReportTemplates: React.FC<ReportTemplatesProps> = ({
  onUseTemplate,
  onEditTemplate,
  onCreateTemplate
}) => {
  const [templates, setTemplates] = useState<ReportTemplate[]>(mockTemplates)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('usage')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'personalizado' as const,
    isPublic: false
  })

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesFavorites = !showFavoritesOnly || template.isFavorite
    
    return matchesSearch && matchesCategory && matchesFavorites
  })

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'date':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case 'rating':
        return b.rating - a.rating
      case 'usage':
      default:
        return b.usageCount - a.usageCount
    }
  })

  const toggleFavorite = useCallback((templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ))
  }, [])

  const duplicateTemplate = useCallback((template: ReportTemplate) => {
    const newTemplate: ReportTemplate = {
      ...template,
      id: `${template.id}_copy_${Date.now()}`,
      name: `${template.name} (Cópia)`,
      author: 'Você',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isPublic: false,
      usageCount: 0
    }
    setTemplates(prev => [newTemplate, ...prev])
  }, [])

  const deleteTemplate = useCallback((templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId))
  }, [])

  const handleCreateTemplate = () => {
    if (newTemplate.name.trim()) {
      const template: ReportTemplate = {
        id: `template_${Date.now()}`,
        name: newTemplate.name,
        description: newTemplate.description,
        category: newTemplate.category,
        author: 'Você',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        isPublic: newTemplate.isPublic,
        isFavorite: false,
        usageCount: 0,
        rating: 0,
        tags: [],
        config: {
          dataSources: [],
          filters: [],
          metrics: [],
          visualizations: [],
          format: 'pdf'
        }
      }
      
      setTemplates(prev => [template, ...prev])
      setIsCreateDialogOpen(false)
      setNewTemplate({ name: '', description: '', category: 'personalizado', isPublic: false })
      onEditTemplate?.(template)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Templates de Relatórios</h2>
          <p className="text-muted-foreground">
            Reutilize configurações salvas ou crie novos templates personalizados
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => onCreateTemplate?.()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Template</DialogTitle>
              <DialogDescription>
                Crie um template personalizado para reutilizar configurações de relatórios
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Nome do Template</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Relatório Semanal de Operações"
                />
              </div>
              <div>
                <Label htmlFor="template-description">Descrição</Label>
                <Textarea
                  id="template-description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o propósito e conteúdo do template..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="template-category">Categoria</Label>
                <Select 
                  value={newTemplate.category} 
                  onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                    <SelectItem value="desempenho">Desempenho</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTemplate}>
                Criar Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="operacional">Operacional</SelectItem>
            <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
            <SelectItem value="desempenho">Desempenho</SelectItem>
            <SelectItem value="financeiro">Financeiro</SelectItem>
            <SelectItem value="personalizado">Personalizado</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usage">Mais usados</SelectItem>
            <SelectItem value="rating">Melhor avaliados</SelectItem>
            <SelectItem value="date">Mais recentes</SelectItem>
            <SelectItem value="name">Nome A-Z</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Star className={`h-4 w-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          Favoritos
        </Button>
      </div>

      {/* Lista de Templates */}
      {sortedTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum template encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory !== 'all' || showFavoritesOnly
              ? 'Tente ajustar os filtros de busca'
              : 'Crie seu primeiro template personalizado'}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {categoryIcons[template.category]}
                    <Badge className={categoryColors[template.category]}>
                      {template.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(template.id)}
                    >
                      {template.isFavorite ? (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onUseTemplate?.(template)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Usar Template
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditTemplate?.(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateTemplate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir o template "${template.name}"? Esta ação não pode ser desfeita.`)) {
                              deleteTemplate(template.id)
                            }
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Por {template.author}</span>
                  <div className="flex items-center space-x-1">
                    {renderStars(template.rating)}
                    <span className="ml-1">({template.rating})</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>{template.usageCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(template.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  {template.isPublic && (
                    <Badge variant="outline" className="text-xs">
                      Público
                    </Badge>
                  )}
                </div>
                
                {template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-center space-x-2 pt-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => onUseTemplate?.(template)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Usar Template
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEditTemplate?.(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReportTemplates