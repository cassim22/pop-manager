import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X, Filter, Clock, Tag, MapPin, User, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchFilter {
  id: string
  label: string
  value: string
  type: 'text' | 'select' | 'date' | 'tag'
  icon?: React.ReactNode
}

interface SearchSuggestion {
  id: string
  text: string
  type: 'recent' | 'popular' | 'suggestion'
  category?: string
  count?: number
}

interface IntelligentSearchProps {
  placeholder?: string
  onSearch: (query: string, filters: SearchFilter[]) => void
  suggestions?: SearchSuggestion[]
  recentSearches?: string[]
  popularTags?: string[]
  filterOptions?: {
    categories?: { value: string; label: string }[]
    pops?: { value: string; label: string }[]
    users?: { value: string; label: string }[]
  }
  className?: string
}

const IntelligentSearch: React.FC<IntelligentSearchProps> = ({
  placeholder = "Buscar...",
  onSearch,
  suggestions = [],
  recentSearches = [],
  popularTags = [],
  filterOptions = {},
  className
}) => {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [focusedSuggestion, setFocusedSuggestion] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Gerar sugestões baseadas na query atual
  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) {
      // Mostrar sugestões padrão quando não há query
      const defaultSuggestions: SearchSuggestion[] = [
        ...recentSearches.slice(0, 3).map((search, index) => ({
          id: `recent-${index}`,
          text: search,
          type: 'recent' as const
        })),
        ...popularTags.slice(0, 5).map((tag, index) => ({
          id: `popular-${index}`,
          text: tag,
          type: 'popular' as const,
          category: 'tag'
        }))
      ]
      return defaultSuggestions
    }

    // Filtrar sugestões baseadas na query
    const queryLower = query.toLowerCase()
    return suggestions.filter(suggestion => 
      suggestion.text.toLowerCase().includes(queryLower)
    ).slice(0, 8)
  }, [query, suggestions, recentSearches, popularTags])

  // Detectar comandos especiais na busca (ex: categoria:manutenção, pop:centro)
  const parseSearchQuery = (searchQuery: string) => {
    const commandRegex = /(\w+):(\w+)/g
    const commands: SearchFilter[] = []
    let cleanQuery = searchQuery

    let match
    while ((match = commandRegex.exec(searchQuery)) !== null) {
      const [fullMatch, key, value] = match
      
      let filter: SearchFilter | null = null
      
      switch (key.toLowerCase()) {
        case 'categoria':
        case 'category':
          filter = {
            id: `category-${Date.now()}`,
            label: 'Categoria',
            value,
            type: 'select',
            icon: <Tag className="h-3 w-3" />
          }
          break
        case 'pop':
          filter = {
            id: `pop-${Date.now()}`,
            label: 'POP',
            value,
            type: 'select',
            icon: <MapPin className="h-3 w-3" />
          }
          break
        case 'usuario':
        case 'user':
          filter = {
            id: `user-${Date.now()}`,
            label: 'Usuário',
            value,
            type: 'select',
            icon: <User className="h-3 w-3" />
          }
          break
        case 'data':
        case 'date':
          filter = {
            id: `date-${Date.now()}`,
            label: 'Data',
            value,
            type: 'date',
            icon: <Calendar className="h-3 w-3" />
          }
          break
      }
      
      if (filter) {
        commands.push(filter)
        cleanQuery = cleanQuery.replace(fullMatch, '').trim()
      }
    }

    return { cleanQuery, commands }
  }

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    const { cleanQuery, commands } = parseSearchQuery(finalQuery)
    
    const allFilters = [...filters, ...commands]
    onSearch(cleanQuery, allFilters)
    
    // Adicionar aos filtros ativos
    if (commands.length > 0) {
      setFilters(prev => [...prev, ...commands])
      setQuery(cleanQuery)
    }
    
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'popular' && suggestion.category === 'tag') {
      setQuery(prev => prev ? `${prev} ${suggestion.text}` : suggestion.text)
    } else {
      setQuery(suggestion.text)
    }
    handleSearch(suggestion.text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedSuggestion(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedSuggestion(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (focusedSuggestion >= 0 && filteredSuggestions[focusedSuggestion]) {
          handleSuggestionClick(filteredSuggestions[focusedSuggestion])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setFocusedSuggestion(-1)
        break
    }
  }

  const addFilter = (type: string, value: string, label: string) => {
    const newFilter: SearchFilter = {
      id: `${type}-${Date.now()}`,
      label,
      value,
      type: 'select',
      icon: type === 'category' ? <Tag className="h-3 w-3" /> : 
            type === 'pop' ? <MapPin className="h-3 w-3" /> : 
            <User className="h-3 w-3" />
    }
    
    setFilters(prev => [...prev, newFilter])
    onSearch(query, [...filters, newFilter])
  }

  const removeFilter = (filterId: string) => {
    const newFilters = filters.filter(f => f.id !== filterId)
    setFilters(newFilters)
    onSearch(query, newFilters)
  }

  const clearAll = () => {
    setQuery('')
    setFilters([])
    onSearch('', [])
  }

  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'recent':
        return <Clock className="h-4 w-4 text-gray-400" />
      case 'popular':
        return <Tag className="h-4 w-4 text-blue-500" />
      default:
        return <Search className="h-4 w-4 text-gray-400" />
    }
  }

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn('relative', className)}>
      {/* Barra de Busca Principal */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'h-7 w-7 p-0',
                showFilters && 'bg-blue-100 text-blue-600'
              )}
            >
              <Filter className="h-3 w-3" />
            </Button>
            {(query || filters.length > 0) && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={clearAll}
                className="h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Filtros Ativos */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.map((filter) => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {filter.icon}
                <span className="text-xs">{filter.label}: {filter.value}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFilter(filter.id)}
                  className="h-4 w-4 p-0 ml-1 hover:bg-gray-200"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Sugestões */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto" ref={suggestionsRef}>
          <CardContent className="p-2">
            <div className="space-y-1">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors',
                    'hover:bg-gray-100',
                    focusedSuggestion === index && 'bg-blue-50 border-blue-200'
                  )}
                >
                  {getSuggestionIcon(suggestion)}
                  <div className="flex-1">
                    <span className="text-sm">{suggestion.text}</span>
                    {suggestion.count && (
                      <span className="text-xs text-gray-500 ml-2">({suggestion.count})</span>
                    )}
                  </div>
                  {suggestion.type === 'recent' && (
                    <span className="text-xs text-gray-400">Recente</span>
                  )}
                  {suggestion.type === 'popular' && (
                    <span className="text-xs text-blue-500">Popular</span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Painel de Filtros Avançados */}
      {showFilters && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-40">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filterOptions.categories && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Categoria</label>
                  <Select onValueChange={(value) => {
                    const option = filterOptions.categories?.find(c => c.value === value)
                    if (option) addFilter('category', value, option.label)
                  }}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {filterOptions.pops && (
                <div>
                  <label className="text-sm font-medium mb-2 block">POP</label>
                  <Select onValueChange={(value) => {
                    const option = filterOptions.pops?.find(p => p.value === value)
                    if (option) addFilter('pop', value, option.label)
                  }}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.pops.map((pop) => (
                        <SelectItem key={pop.value} value={pop.value}>
                          {pop.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {filterOptions.users && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Usuário</label>
                  <Select onValueChange={(value) => {
                    const option = filterOptions.users?.find(u => u.value === value)
                    if (option) addFilter('user', value, option.label)
                  }}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.users.map((user) => (
                        <SelectItem key={user.value} value={user.value}>
                          {user.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="text-xs text-gray-500">
                💡 Dica: Use comandos como "categoria:manutenção" ou "pop:centro" na busca
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFilters(false)}
              >
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default IntelligentSearch