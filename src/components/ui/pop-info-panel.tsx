import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Progress } from './progress'
import { 
  MapPin, 
  Building2, 
  Users, 
  Zap, 
  AlertTriangle, 
  Thermometer,
  Wifi,
  Server,
  Activity,
  Clock,
  ExternalLink,
  Navigation
} from 'lucide-react'
import { POP, StatusPOP } from '@/types/entities'

interface PopInfoPanelProps {
  pop: POP | null
  onClose: () => void
  onNavigate?: (pop: POP) => void
  onViewDetails?: (pop: POP) => void
}

const getStatusColor = (status: StatusPOP) => {
  switch (status) {
    case 'operacional': return 'bg-green-500'
    case 'manutencao': return 'bg-yellow-500'
    case 'critico': return 'bg-red-500'
    case 'desmobilizacao': return 'bg-gray-500'
    case 'desmobilizado': return 'bg-gray-700'
    default: return 'bg-gray-500'
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

const getStatusIcon = (status: StatusPOP) => {
  switch (status) {
    case 'operacional': return <Building2 className="h-4 w-4" />
    case 'manutencao': return <Zap className="h-4 w-4" />
    case 'critico': return <AlertTriangle className="h-4 w-4" />
    default: return <MapPin className="h-4 w-4" />
  }
}

const getHealthPercentage = (status: StatusPOP) => {
  switch (status) {
    case 'operacional': return 95
    case 'manutencao': return 70
    case 'critico': return 25
    case 'desmobilizacao': return 10
    case 'desmobilizado': return 0
    default: return 50
  }
}

export function PopInfoPanel({ pop, onClose, onNavigate, onViewDetails }: PopInfoPanelProps) {
  if (!pop) return null

  const healthPercentage = getHealthPercentage(pop.status)
  const isOperational = pop.status === 'operacional'

  return (
    <div className="absolute top-4 left-4 z-[1000] w-80 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center text-lg">
                {getStatusIcon(pop.status)}
                <span className="ml-2">{pop.nome}</span>
              </CardTitle>
              <CardDescription className="mt-1">
                {pop.cidade}, {pop.estado}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              ×
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            <Badge 
              variant={isOperational ? 'default' : 
                      pop.status === 'critico' ? 'destructive' : 'secondary'}
              className="flex items-center space-x-1"
            >
              <div className={`w-2 h-2 rounded-full ${getStatusColor(pop.status)}`} />
              <span>{getStatusLabel(pop.status)}</span>
            </Badge>
            <Badge variant="outline">{pop.tipo}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status de Saúde */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center">
                <Activity className="h-4 w-4 mr-1" />
                Saúde do Sistema
              </span>
              <span className="text-sm text-gray-600">{healthPercentage}%</span>
            </div>
            <Progress value={healthPercentage} className="h-2" />
          </div>

          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">{pop.quantidade_clientes}</p>
                <p className="text-gray-600 text-xs">Clientes</p>
              </div>
            </div>
            
            {pop.temperatura && (
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{pop.temperatura}°C</p>
                  <p className="text-gray-600 text-xs">Temperatura</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">{pop.racks.length || 0}</p>
                <p className="text-gray-600 text-xs">Racks</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">{pop.backup_ativo ? 'Ativo' : 'Inativo'}</p>
                <p className="text-gray-600 text-xs">Backup</p>
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="border-t pt-3">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Localização
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{pop.logradouro}{pop.numero ? `, ${pop.numero}` : ''}</p>
              {pop.bairro && <p>{pop.bairro}</p>}
              <p>{pop.cidade}, {pop.estado}</p>
              {pop.cep && <p>CEP: {pop.cep}</p>}
              {pop.coordenadas && (
                <p className="text-xs">
                  {pop.coordenadas.lat.toFixed(6)}, {pop.coordenadas.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Informações adicionais podem ser adicionadas aqui no futuro */}

          {/* Última Atualização */}
          <div className="border-t pt-3">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              Atualizado em {new Date(pop.updated_at).toLocaleString('pt-BR')}
            </div>
          </div>

          {/* Ações */}
          <div className="border-t pt-3 space-y-2">
            {onNavigate && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => onNavigate(pop)}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Navegar até aqui
              </Button>
            )}
            
            {onViewDetails && (
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => onViewDetails(pop)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Detalhes Completos
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PopInfoPanel