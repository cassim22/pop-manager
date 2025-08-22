import React, { useState, useEffect, useRef } from 'react'
import { Search, X, FileText, Users, MapPin, Wrench, Fuel, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface SearchResult {
  id: string
  title: string
  description: string
  path: string
  category: string
  icon: React.ReactNode
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  // Dados mockados para busca
  const searchData: SearchResult[] = [
    {
      id: '1',
      title: 'Dashboard',
      description: 'Visão geral do sistema com métricas e indicadores',
      path: '/',
      category: 'Navegação',
      icon: <Activity className="h-4 w-4" />
    },
    {
      id: '2',
      title: 'POPs',
      description: 'Gerenciar pontos de presença',
      path: '/pops',
      category: 'Navegação',
      icon: <MapPin className="h-4 w-4" />
    },
    {
      id: '3',
      title: 'Atividades',
      description: 'Acompanhar atividades e tarefas',
      path: '/activities',
      category: 'Navegação',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: '4',
      title: 'Equipe',
      description: 'Gerenciar membros da equipe',
      path: '/team',
      category: 'Navegação',
      icon: <Users className="h-4 w-4" />
    },
    {
      id: '5',
      title: 'Abastecimentos',
      description: 'Controlar abastecimentos de combustível',
      path: '/supplies',
      category: 'Navegação',
      icon: <Fuel className="h-4 w-4" />
    },
    {
      id: '6',
      title: 'Manutenções',
      description: 'Acompanhar manutenções preventivas e corretivas',
      path: '/maintenance',
      category: 'Navegação',
      icon: <Wrench className="h-4 w-4" />
    },
    {
      id: '7',
      title: 'Mapa',
      description: 'Visualizar POPs no mapa',
      path: '/map',
      category: 'Navegação',
      icon: <MapPin className="h-4 w-4" />
    },
    {
      id: '8',
      title: 'Relatórios',
      description: 'Gerar e visualizar relatórios',
      path: '/reports',
      category: 'Navegação',
      icon: <FileText className="h-4 w-4" />
    }
  ]

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (query.trim()) {
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
      setSelectedIndex(0)
    } else {
      setResults([])
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleSelect = (result: SearchResult) => {
    navigate(result.path)
    onClose()
    setQuery('')
  }

  const handleClose = () => {
    onClose()
    setQuery('')
    setResults([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Global
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar páginas, funcionalidades..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div className="max-h-96 overflow-y-auto border-t">
            {results.map((result, index) => (
              <button
                key={result.id}
                className={cn(
                  'w-full px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors',
                  index === selectedIndex && 'bg-blue-50 dark:bg-blue-900/20'
                )}
                onClick={() => handleSelect(result)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-gray-500 dark:text-gray-400">
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {result.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {result.description}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {result.category}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 border-t">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum resultado encontrado para "{query}"</p>
          </div>
        )}

        <div className="px-6 py-3 border-t bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <span>Use ↑↓ para navegar, Enter para selecionar</span>
            <span>Esc para fechar</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GlobalSearch