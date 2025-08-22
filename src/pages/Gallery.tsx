import React, { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

import { 
  Image, 
  Upload, 
  Filter, 
  Search, 
  Grid3X3, 
  List, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  X,
  Share2,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Building2,
  Zap,
  Wrench,
  FileText
} from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'

// Mock data for gallery images
const mockImages = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    title: 'Inspeção POP Central',
    description: 'Foto da inspeção realizada no POP Central - Equipamentos em bom estado',
    category: 'inspecao',
    tags: ['POP', 'inspeção', 'equipamentos'],
    uploadedBy: 'João Silva',
    uploadedAt: '2024-01-15T10:30:00Z',
    size: 2.4 * 1024 * 1024, // 2.4MB
    dimensions: '1920x1080',
    relatedTo: { type: 'POP', id: 'pop-001', name: 'POP Central' },
    likes: 5,
    comments: 2
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=200&fit=crop',
    title: 'Gerador Diesel - Manutenção',
    description: 'Registro da manutenção preventiva do gerador diesel',
    category: 'manutencao',
    tags: ['gerador', 'manutenção', 'diesel'],
    uploadedBy: 'Maria Santos',
    uploadedAt: '2024-01-14T14:20:00Z',
    size: 3.1 * 1024 * 1024,
    dimensions: '1920x1280',
    relatedTo: { type: 'Gerador', id: 'gen-001', name: 'Gerador Principal' },
    likes: 8,
    comments: 3
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=200&fit=crop',
    title: 'Documentação Técnica',
    description: 'Esquema elétrico do sistema de energia',
    category: 'documentacao',
    tags: ['esquema', 'elétrico', 'documentação'],
    uploadedBy: 'Carlos Oliveira',
    uploadedAt: '2024-01-13T09:15:00Z',
    size: 1.8 * 1024 * 1024,
    dimensions: '1600x1200',
    relatedTo: { type: 'Documentação', id: 'doc-001', name: 'Esquemas Elétricos' },
    likes: 3,
    comments: 1
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=200&fit=crop',
    title: 'Equipe de Campo',
    description: 'Equipe técnica durante atividade de campo',
    category: 'equipe',
    tags: ['equipe', 'campo', 'técnicos'],
    uploadedBy: 'Ana Costa',
    uploadedAt: '2024-01-12T16:45:00Z',
    size: 2.7 * 1024 * 1024,
    dimensions: '1920x1080',
    relatedTo: { type: 'Atividade', id: 'act-001', name: 'Inspeção Mensal' },
    likes: 12,
    comments: 5
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop',
    title: 'Painel de Controle',
    description: 'Vista do painel de controle principal',
    category: 'equipamento',
    tags: ['painel', 'controle', 'equipamento'],
    uploadedBy: 'Pedro Lima',
    uploadedAt: '2024-01-11T11:30:00Z',
    size: 2.1 * 1024 * 1024,
    dimensions: '1600x1200',
    relatedTo: { type: 'Equipamento', id: 'eq-001', name: 'Painel Principal' },
    likes: 7,
    comments: 2
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=300&h=200&fit=crop',
    title: 'Instalação Externa',
    description: 'Vista externa das instalações',
    category: 'instalacao',
    tags: ['instalação', 'externa', 'estrutura'],
    uploadedBy: 'Lucia Ferreira',
    uploadedAt: '2024-01-10T08:20:00Z',
    size: 3.5 * 1024 * 1024,
    dimensions: '2048x1536',
    relatedTo: { type: 'POP', id: 'pop-002', name: 'POP Norte' },
    likes: 4,
    comments: 1
  }
]

const categories = [
  { id: 'all', name: 'Todas', count: mockImages.length },
  { id: 'inspecao', name: 'Inspeções', count: mockImages.filter(img => img.category === 'inspecao').length },
  { id: 'manutencao', name: 'Manutenções', count: mockImages.filter(img => img.category === 'manutencao').length },
  { id: 'documentacao', name: 'Documentação', count: mockImages.filter(img => img.category === 'documentacao').length },
  { id: 'equipe', name: 'Equipe', count: mockImages.filter(img => img.category === 'equipe').length },
  { id: 'equipamento', name: 'Equipamentos', count: mockImages.filter(img => img.category === 'equipamento').length },
  { id: 'instalacao', name: 'Instalações', count: mockImages.filter(img => img.category === 'instalacao').length }
]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'inspecao': return <Eye className="h-4 w-4" />
    case 'manutencao': return <Wrench className="h-4 w-4" />
    case 'documentacao': return <FileText className="h-4 w-4" />
    case 'equipe': return <User className="h-4 w-4" />
    case 'equipamento': return <Zap className="h-4 w-4" />
    case 'instalacao': return <Building2 className="h-4 w-4" />
    default: return <Image className="h-4 w-4" />
  }
}

const getRelatedIcon = (type: string) => {
  switch (type) {
    case 'POP': return <Building2 className="h-4 w-4" />
    case 'Gerador': return <Zap className="h-4 w-4" />
    case 'Atividade': return <Calendar className="h-4 w-4" />
    case 'Equipamento': return <Wrench className="h-4 w-4" />
    default: return <FileText className="h-4 w-4" />
  }
}

interface ImageModalProps {
  image: typeof mockImages[0] | null
  onClose: () => void
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  if (!image) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-6xl max-h-full">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {/* Image */}
        <img
          src={image.url}
          alt={image.title}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        
        {/* Image info */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 rounded-b-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{image.title}</h3>
              <p className="text-sm text-gray-300 mb-2">{image.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>Por {image.uploadedBy}</span>
                <span>{formatDate(image.uploadedAt)}</span>
                <span>{image.dimensions}</span>
                <span>{formatFileSize(image.size)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white hover:bg-opacity-20">
                <Heart className="h-4 w-4 mr-1" />
                {image.likes}
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white hover:bg-opacity-20">
                <MessageSquare className="h-4 w-4 mr-1" />
                {image.comments}
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white hover:bg-opacity-20">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white hover:bg-opacity-20">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ImageCardProps {
  image: typeof mockImages[0]
  viewMode: 'grid' | 'list'
  onImageClick: (image: typeof mockImages[0]) => void
}

const ImageCard: React.FC<ImageCardProps> = ({ image, viewMode, onImageClick }) => {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div 
              className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
              onClick={() => onImageClick(image)}
            >
              <img
                src={image.thumbnail}
                alt={image.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                <Eye className="h-5 w-5 text-white opacity-0 hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg truncate">{image.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{image.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {image.uploadedBy}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(image.uploadedAt)}
                    </div>
                    <div className="flex items-center">
                      {getRelatedIcon(image.relatedTo.type)}
                      <span className="ml-1">{image.relatedTo.name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <Badge variant="outline" className="text-xs">
                    {getCategoryIcon(image.category)}
                    <span className="ml-1 capitalize">{image.category}</span>
                  </Badge>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {image.likes}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {image.comments}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
        <img
          src={image.thumbnail}
          alt={image.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 cursor-pointer"
          onClick={() => onImageClick(image)}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-2">
            <Button variant="secondary" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs">
            {getCategoryIcon(image.category)}
            <span className="ml-1 capitalize">{image.category}</span>
          </Badge>
        </div>
        
        {/* Related item */}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="text-xs bg-white bg-opacity-90">
            {getRelatedIcon(image.relatedTo.type)}
            <span className="ml-1">{image.relatedTo.type}</span>
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-1">{image.title}</h3>
          <p className="text-xs text-gray-600 line-clamp-2">{image.description}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Heart className="h-3 w-3 mr-1" />
                {image.likes}
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                {image.comments}
              </div>
            </div>
            <span>{formatDate(image.uploadedAt)}</span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center text-xs text-gray-600">
              <User className="h-3 w-3 mr-1" />
              {image.uploadedBy}
            </div>
            <div className="text-xs text-gray-500">
              {formatFileSize(image.size)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Gallery: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImage, setSelectedImage] = useState<typeof mockImages[0] | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter images
  const filteredImages = mockImages.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setIsUploading(true)
      // Simulate upload process
      setTimeout(() => {
        setIsUploading(false)
        // Here you would handle the actual file upload
        console.log('Files uploaded:', files)
      }, 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galeria</h1>
          <p className="text-muted-foreground">
            Galeria de imagens e documentos visuais ({filteredImages.length} itens)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4 mr-2" /> : <Grid3X3 className="h-4 w-4 mr-2" />}
            {viewMode === 'grid' ? 'Lista' : 'Grade'}
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Enviando...' : 'Upload'}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar imagens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap"
          >
            {category.id !== 'all' && getCategoryIcon(category.id)}
            <span className={category.id !== 'all' ? 'ml-2' : ''}>{category.name}</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Gallery Grid/List */}
      {filteredImages.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
          : 'space-y-4'
        }>
          {filteredImages.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              viewMode={viewMode}
              onImageClick={setSelectedImage}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Nenhuma imagem encontrada' 
                : 'Nenhuma imagem na galeria'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece fazendo upload de suas primeiras imagens.'}
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Fazer Upload
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Image Modal */}
      <ImageModal 
        image={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  )
}

export default Gallery