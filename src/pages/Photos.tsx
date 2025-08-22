import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Upload, List, Trash2, Eye, Calendar, MapPin, Grid, Camera, Tag, Download } from 'lucide-react'
import PhotoUpload from '@/components/ui/photo-upload'
import IntelligentSearch from '@/components/ui/intelligent-search'
import { Pagination } from '@/components/ui/pagination'

// Mock data para demonstração
interface Photo {
  id: string
  titulo: string
  descricao?: string
  url: string
  categoria: 'manutencao' | 'instalacao' | 'documentacao' | 'incidente' | 'inspecao'
  pop_id?: string
  pop_nome?: string
  data_upload: Date
  uploaded_by: string
  tags: string[]
  tamanho: number
  formato: string
}

const mockPhotos: Photo[] = [
  {
    id: '1',
    titulo: 'Manutenção Ar Condicionado - POP Centro',
    descricao: 'Limpeza dos filtros do sistema de climatização',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
    categoria: 'manutencao',
    pop_id: 'pop-001',
    pop_nome: 'POP Centro',
    data_upload: new Date('2024-01-15'),
    uploaded_by: 'João Silva',
    tags: ['ar-condicionado', 'limpeza', 'filtros'],
    tamanho: 2.5,
    formato: 'JPG'
  },
  {
    id: '2',
    titulo: 'Instalação Novo Switch - POP Norte',
    descricao: 'Instalação e configuração do switch principal',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    categoria: 'instalacao',
    pop_id: 'pop-002',
    pop_nome: 'POP Norte',
    data_upload: new Date('2024-01-14'),
    uploaded_by: 'Maria Santos',
    tags: ['switch', 'rede', 'instalacao'],
    tamanho: 1.8,
    formato: 'PNG'
  },
  {
    id: '3',
    titulo: 'Documentação Rack Principal',
    descricao: 'Estado atual do rack de equipamentos',
    url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400',
    categoria: 'documentacao',
    pop_id: 'pop-001',
    pop_nome: 'POP Centro',
    data_upload: new Date('2024-01-13'),
    uploaded_by: 'Carlos Oliveira',
    tags: ['rack', 'documentacao', 'equipamentos'],
    tamanho: 3.2,
    formato: 'JPG'
  },
  {
    id: '4',
    titulo: 'Incidente - Vazamento Sala Técnica',
    descricao: 'Registro do vazamento identificado na sala técnica',
    url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
    categoria: 'incidente',
    pop_id: 'pop-003',
    pop_nome: 'POP Sul',
    data_upload: new Date('2024-01-12'),
    uploaded_by: 'Ana Costa',
    tags: ['vazamento', 'incidente', 'sala-tecnica'],
    tamanho: 2.1,
    formato: 'JPG'
  },
  {
    id: '5',
    titulo: 'Inspeção Gerador Diesel',
    descricao: 'Inspeção mensal do gerador de emergência',
    url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
    categoria: 'inspecao',
    pop_id: 'pop-002',
    pop_nome: 'POP Norte',
    data_upload: new Date('2024-01-11'),
    uploaded_by: 'Pedro Lima',
    tags: ['gerador', 'inspecao', 'diesel'],
    tamanho: 2.8,
    formato: 'JPG'
  },
  {
    id: '6',
    titulo: 'Cabeamento Estruturado - Sala 1',
    descricao: 'Organização do cabeamento após manutenção',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    categoria: 'manutencao',
    pop_id: 'pop-001',
    pop_nome: 'POP Centro',
    data_upload: new Date('2024-01-10'),
    uploaded_by: 'João Silva',
    tags: ['cabeamento', 'organizacao', 'rede'],
    tamanho: 1.9,
    formato: 'PNG'
  }
]

const Photos: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>(mockPhotos)
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>(mockPhotos)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory] = useState<string>('all')
  const [selectedPOP] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [showUploadArea, setShowUploadArea] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  
  // Estados para busca inteligente
  const [activeFilters, setActiveFilters] = useState<any[]>([])
  const [recentSearches] = useState<string[]>(['manutenção ar condicionado', 'instalação switch', 'documentação rack'])
  const [popularTags] = useState<string[]>(['ar-condicionado', 'switch', 'rack', 'gerador', 'cabeamento'])
  const [searchSuggestions] = useState([
    { id: '1', text: 'manutenção preventiva', type: 'suggestion' as const, category: 'manutenção' },
    { id: '2', text: 'instalação equipamentos', type: 'suggestion' as const, category: 'instalação' },
    { id: '3', text: 'documentação técnica', type: 'suggestion' as const, category: 'documentação' },
    { id: '4', text: 'incidente crítico', type: 'suggestion' as const, category: 'incidente' },
    { id: '5', text: 'inspeção mensal', type: 'suggestion' as const, category: 'inspeção' }
  ])
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [paginatedPhotos, setPaginatedPhotos] = useState<Photo[]>([])

  const [newPhoto, setNewPhoto] = useState({
    titulo: '',
    descricao: '',
    categoria: 'documentacao' as Photo['categoria'],
    pop_id: '',
    tags: ''
  })

  // Função para busca inteligente
  const handleIntelligentSearch = (query: string, filters: any[]) => {
    setSearchTerm(query)
    setActiveFilters(filters)
    
    let filtered = photos

    // Aplicar busca por texto
    if (query.trim()) {
      const queryLower = query.toLowerCase()
      filtered = filtered.filter(photo => 
        photo.titulo.toLowerCase().includes(queryLower) ||
        photo.descricao?.toLowerCase().includes(queryLower) ||
        photo.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
        photo.uploaded_by.toLowerCase().includes(queryLower)
      )
    }

    // Aplicar filtros avançados
    filters.forEach(filter => {
      switch (filter.label.toLowerCase()) {
        case 'categoria':
          filtered = filtered.filter(photo => photo.categoria === filter.value)
          break
        case 'pop':
          filtered = filtered.filter(photo => photo.pop_id === filter.value)
          break
        case 'usuário':
          filtered = filtered.filter(photo => 
            photo.uploaded_by.toLowerCase().includes(filter.value.toLowerCase())
          )
          break
      }
    })

    setFilteredPhotos(filtered)
     setCurrentPage(1) // Reset para primeira página ao filtrar
   }

   // Filtrar fotos (fallback para filtros antigos)
   useEffect(() => {
     if (activeFilters.length === 0 && !searchTerm) {
       let filtered = photos

       if (selectedCategory !== 'all') {
         filtered = filtered.filter(photo => photo.categoria === selectedCategory)
       }

       if (selectedPOP !== 'all') {
         filtered = filtered.filter(photo => photo.pop_id === selectedPOP)
       }

       setFilteredPhotos(filtered)
       setCurrentPage(1) // Reset para primeira página ao filtrar
     }
   }, [photos, selectedCategory, selectedPOP, activeFilters.length, searchTerm])

   // Paginação
   useEffect(() => {
     const startIndex = (currentPage - 1) * itemsPerPage
     const endIndex = startIndex + itemsPerPage
     setPaginatedPhotos(filteredPhotos.slice(startIndex, endIndex))
   }, [filteredPhotos, currentPage, itemsPerPage])

   const handlePageChange = (page: number) => {
     setCurrentPage(page)
   }

   const handleItemsPerPageChange = (newItemsPerPage: number) => {
     setItemsPerPage(newItemsPerPage)
     setCurrentPage(1) // Reset para primeira página ao mudar itens por página
   }

   const totalPages = Math.ceil(filteredPhotos.length / itemsPerPage)

  const handleUpload = () => {
    // Simular upload de foto
    const newPhotoData: Photo = {
      id: Date.now().toString(),
      titulo: newPhoto.titulo,
      descricao: newPhoto.descricao,
      url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400',
      categoria: newPhoto.categoria,
      pop_id: newPhoto.pop_id || undefined,
      pop_nome: newPhoto.pop_id ? `POP ${newPhoto.pop_id}` : undefined,
      data_upload: new Date(),
      uploaded_by: 'Usuário Atual',
      tags: newPhoto.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      tamanho: Math.random() * 3 + 1,
      formato: 'JPG'
    }

    setPhotos(prev => [newPhotoData, ...prev])
    setIsUploadDialogOpen(false)
    setNewPhoto({
      titulo: '',
      descricao: '',
      categoria: 'documentacao',
      pop_id: '',
      tags: ''
    })
  }

  const handleAdvancedUpload = async (files: File[]): Promise<void> => {
    // Simular processamento de múltiplos arquivos
    const newPhotos: Photo[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      titulo: file.name.replace(/\.[^/.]+$/, ''), // Remove extensão
      descricao: `Upload automático de ${file.name}`,
      url: URL.createObjectURL(file), // Preview local
      categoria: 'documentacao' as Photo['categoria'],
      pop_id: undefined,
      pop_nome: undefined,
      data_upload: new Date(),
      uploaded_by: 'Usuário Atual',
      tags: ['upload-automatico'],
      tamanho: file.size / (1024 * 1024), // Converter para MB
      formato: file.type.split('/')[1]?.toUpperCase() || 'UNKNOWN'
    }))

    // Adicionar as novas fotos ao estado
    setPhotos(prev => [...newPhotos, ...prev])
    
    // Fechar área de upload após sucesso
    setTimeout(() => {
      setShowUploadArea(false)
    }, 1000)
  }

  const handleDelete = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId))
  }

  const getCategoryColor = (category: Photo['categoria']) => {
    switch (category) {
      case 'manutencao':
        return 'bg-blue-100 text-blue-800'
      case 'instalacao':
        return 'bg-green-100 text-green-800'
      case 'documentacao':
        return 'bg-gray-100 text-gray-800'
      case 'incidente':
        return 'bg-red-100 text-red-800'
      case 'inspecao':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category: Photo['categoria']) => {
    switch (category) {
      case 'manutencao':
        return 'Manutenção'
      case 'instalacao':
        return 'Instalação'
      case 'documentacao':
        return 'Documentação'
      case 'incidente':
        return 'Incidente'
      case 'inspecao':
        return 'Inspeção'
      default:
        return category
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galeria de Fotos</h1>
          <p className="text-muted-foreground">
            Gerenciamento de fotos e documentação visual
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            onClick={() => setShowUploadArea(!showUploadArea)}
          >
            <Upload className="h-4 w-4 mr-2" />
            {showUploadArea ? 'Fechar Upload' : 'Upload Fotos'}
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Simples
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload de Foto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={newPhoto.titulo}
                    onChange={(e) => setNewPhoto({ ...newPhoto, titulo: e.target.value })}
                    placeholder="Título da foto"
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={newPhoto.descricao}
                    onChange={(e) => setNewPhoto({ ...newPhoto, descricao: e.target.value })}
                    placeholder="Descrição opcional"
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={newPhoto.categoria} onValueChange={(value) => setNewPhoto({ ...newPhoto, categoria: value as Photo['categoria'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="instalacao">Instalação</SelectItem>
                      <SelectItem value="documentacao">Documentação</SelectItem>
                      <SelectItem value="incidente">Incidente</SelectItem>
                      <SelectItem value="inspecao">Inspeção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pop">POP (Opcional)</Label>
                  <Input
                    id="pop"
                    value={newPhoto.pop_id}
                    onChange={(e) => setNewPhoto({ ...newPhoto, pop_id: e.target.value })}
                    placeholder="ID do POP"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={newPhoto.tags}
                    onChange={(e) => setNewPhoto({ ...newPhoto, tags: e.target.value })}
                    placeholder="Tags separadas por vírgula"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpload} disabled={!newPhoto.titulo}>
                    Upload
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Busca Inteligente */}
      <IntelligentSearch
        placeholder="Buscar fotos, tags, categorias..."
        onSearch={handleIntelligentSearch}
        suggestions={searchSuggestions}
        recentSearches={recentSearches}
        popularTags={popularTags}
        filterOptions={{
          categories: [
            { value: 'manutencao', label: 'Manutenção' },
            { value: 'instalacao', label: 'Instalação' },
            { value: 'documentacao', label: 'Documentação' },
            { value: 'incidente', label: 'Incidente' },
            { value: 'inspecao', label: 'Inspeção' }
          ],
          pops: [
            { value: 'pop-001', label: 'POP Centro' },
            { value: 'pop-002', label: 'POP Norte' },
            { value: 'pop-003', label: 'POP Sul' }
          ],
          users: [
            { value: 'joao-silva', label: 'João Silva' },
            { value: 'maria-santos', label: 'Maria Santos' },
            { value: 'carlos-oliveira', label: 'Carlos Oliveira' }
          ]
        }}
      />

      {/* Área de Upload Avançado */}
      {showUploadArea && (
        <PhotoUpload
          onUpload={handleAdvancedUpload}
          maxFiles={10}
          maxSize={5}
          acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
        />
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Fotos</p>
                <p className="text-2xl font-bold">{photos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Upload className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Este Mês</p>
                <p className="text-2xl font-bold">{photos.filter(p => p.data_upload.getMonth() === new Date().getMonth()).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categorias</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">POPs</p>
                <p className="text-2xl font-bold">{new Set(photos.filter(p => p.pop_id).map(p => p.pop_id)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Galeria */}
      <Card>
        <CardHeader>
          <CardTitle>Galeria ({filteredPhotos.length} fotos)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma foto encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                Tente ajustar os filtros ou faça upload de novas fotos.
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
              {paginatedPhotos.map((photo) => (
                <div key={photo.id} className={viewMode === 'grid' ? 'group' : 'flex items-center space-x-4 p-4 border rounded-lg'}>
                  {viewMode === 'grid' ? (
                    <div className="relative overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={photo.url}
                        alt={photo.titulo}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200" />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedPhoto(photo)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDelete(photo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                        <Badge className={`mb-2 ${getCategoryColor(photo.categoria)}`}>
                          {getCategoryLabel(photo.categoria)}
                        </Badge>
                        <h3 className="text-white font-medium text-sm truncate">{photo.titulo}</h3>
                        <p className="text-gray-300 text-xs">{photo.data_upload.toLocaleDateString()}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={photo.url}
                        alt={photo.titulo}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">{photo.titulo}</h3>
                          <Badge className={getCategoryColor(photo.categoria)}>
                            {getCategoryLabel(photo.categoria)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{photo.descricao}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {photo.data_upload.toLocaleDateString()}
                          </span>
                          {photo.pop_nome && (
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {photo.pop_nome}
                            </span>
                          )}
                          <span>{photo.tamanho.toFixed(1)} MB</span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPhoto(photo)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(photo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {filteredPhotos.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredPhotos.length}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Dialog de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedPhoto && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPhoto.titulo}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.titulo}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categoria</Label>
                    <Badge className={getCategoryColor(selectedPhoto.categoria)}>
                      {getCategoryLabel(selectedPhoto.categoria)}
                    </Badge>
                  </div>
                  <div>
                    <Label>Data de Upload</Label>
                    <p>{selectedPhoto.data_upload.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>Enviado por</Label>
                    <p>{selectedPhoto.uploaded_by}</p>
                  </div>
                  <div>
                    <Label>Tamanho</Label>
                    <p>{selectedPhoto.tamanho.toFixed(1)} MB ({selectedPhoto.formato})</p>
                  </div>
                  {selectedPhoto.pop_nome && (
                    <div>
                      <Label>POP</Label>
                      <p>{selectedPhoto.pop_nome}</p>
                    </div>
                  )}
                  {selectedPhoto.tags.length > 0 && (
                    <div>
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-1">
                        {selectedPhoto.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {selectedPhoto.descricao && (
                  <div>
                    <Label>Descrição</Label>
                    <p className="text-sm text-gray-600">{selectedPhoto.descricao}</p>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => handleDelete(selectedPhoto.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
              </div>
   )
 }

export default Photos