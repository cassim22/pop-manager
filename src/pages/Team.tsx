import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// Removed unused Select and Dialog imports

import DataTable from '@/components/ui/data-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Users, Plus, Search, Filter, Edit, Trash2, Eye, Phone, Mail, MapPin, Calendar, MoreHorizontal, User, CheckCircle, Clock } from 'lucide-react'
import { useTecnicos } from '@/hooks/useAPI'
import { Tecnico } from '@/types/entities'
import { formatDate } from '@/lib/utils'

const Team: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const { data: tecnicosData, isLoading, error } = useTecnicos({
    page: 1,
    limit: 50,
    busca: searchTerm
  })

  const getStatusColor = (ativo: boolean) => {
    return ativo ? 'default' : 'secondary'
  }

  const getStatusLabel = (ativo: boolean) => {
    return ativo ? 'Ativo' : 'Inativo'
  }

  const getStatusIcon = (ativo: boolean) => {
    return ativo ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar equipe</h3>
          <p className="text-gray-500">Tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }

  const tecnicos = tecnicosData?.dados || []
  const filteredTecnicos = tecnicos.filter((tecnico: Tecnico) => {
    if (statusFilter === 'ativo' && !tecnico.ativo) return false
    if (statusFilter === 'inativo' && tecnico.ativo) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground">
            Gerenciamento da equipe técnica ({filteredTecnicos.length} técnicos)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Técnico
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar técnicos..."
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
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      {/* Tabela Responsiva de Técnicos */}
      <DataTable
        data={filteredTecnicos}
        columns={[
          {
            key: 'nome',
            label: 'Técnico',
            render: (tecnico: Tecnico) => (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">{tecnico.nome}</div>
                  <div className="text-sm text-gray-500">{tecnico.especializacao?.join(', ') || 'Técnico Geral'}</div>
                </div>
              </div>
            )
          },
          {
            key: 'contato',
            label: 'Contato',
            render: (tecnico: Tecnico) => (
              <div className="space-y-1">
                {tecnico.email && (
                  <div className="flex items-center space-x-1 text-sm">
                    <Mail className="h-3 w-3 text-gray-500" />
                    <span>{tecnico.email}</span>
                  </div>
                )}
                {tecnico.telefone && (
                  <div className="flex items-center space-x-1 text-sm">
                    <Phone className="h-3 w-3 text-gray-500" />
                    <span>{tecnico.telefone}</span>
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'status',
            label: 'Status',
            render: (tecnico: Tecnico) => (
              <Badge variant={getStatusColor(tecnico.ativo)}>
                {getStatusIcon(tecnico.ativo)}
                <span className="ml-1">{getStatusLabel(tecnico.ativo)}</span>
              </Badge>
            )
          },
          {
            key: 'endereco',
            label: 'Localização',
            render: (tecnico: Tecnico) => (
              tecnico.endereco ? (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="truncate">{tecnico.endereco}</span>
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )
            )
          },
          {
            key: 'admissao',
            label: 'Admissão',
            render: (tecnico: Tecnico) => (
              tecnico.data_admissao ? (
                <div className="flex items-center space-x-1 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(tecnico.data_admissao)}</span>
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )
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
                    Ver Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" />
                    Contatar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
        ]}
        loading={isLoading}
        emptyMessage="Nenhum técnico encontrado"
      />

      {/* Empty State */}
      {filteredTecnicos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum técnico encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece adicionando o primeiro técnico à equipe.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Técnico
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Team