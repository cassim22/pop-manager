// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { MapContainer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapControls } from '@/components/ui/map-controls'
import { MapLayers } from '@/components/ui/map-layers'
import { PopInfoPanel } from '@/components/ui/pop-info-panel'
import { Plus, Filter, Search, Building2, Zap, AlertTriangle, Map, MapPin, Users } from 'lucide-react'
import { usePOPs } from '@/hooks/useAPI'
import { POP, StatusPOP } from '@/types/entities'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom cluster styles
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount()
  let size = 'small'
  let color = '#3b82f6' // blue
  
  if (count >= 10) {
    size = 'large'
    color = '#ef4444' // red for large clusters
  } else if (count >= 5) {
    size = 'medium'
    color = '#f59e0b' // yellow for medium clusters
  }
  
  return L.divIcon({
    html: `<div class="cluster-icon cluster-${size}" style="background-color: ${color};"><span>${count}</span></div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(40, 40, true)
  })
}

// Add cluster styles to document head
const addClusterStyles = () => {
  if (document.getElementById('cluster-styles')) return
  
  const style = document.createElement('style')
  style.id = 'cluster-styles'
  style.textContent = `
    .custom-cluster-icon {
      background: transparent !important;
      border: none !important;
    }
    
    .cluster-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: transform 0.2s ease;
    }
    
    .cluster-icon:hover {
      transform: scale(1.1);
    }
    
    .cluster-small {
      width: 35px;
      height: 35px;
      font-size: 12px;
    }
    
    .cluster-medium {
      width: 40px;
      height: 40px;
      font-size: 14px;
    }
    
    .cluster-large {
      width: 45px;
      height: 45px;
      font-size: 16px;
    }
  `
  document.head.appendChild(style)
}

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons based on POP status
const createCustomIcon = (status: StatusPOP) => {
  const color = getStatusColor(status)
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}

const getStatusColor = (status: StatusPOP) => {
  switch (status) {
    case 'operacional': return '#10b981' // green
    case 'manutencao': return '#f59e0b' // yellow
    case 'critico': return '#ef4444' // red
    case 'desmobilizacao': return '#6b7280' // gray
    case 'desmobilizado': return '#374151' // dark gray
    default: return '#6b7280'
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

// Component to fit map bounds to markers
const FitBounds: React.FC<{ pops: POP[] }> = ({ pops }) => {
  const map = useMap()
  
  useEffect(() => {
    if (pops.length > 0) {
      const validPops = pops.filter((pop: POP) => pop.coordenadas?.lat && pop.coordenadas?.lng)
      if (validPops.length > 0) {
        const bounds = L.latLngBounds(
          validPops.map(pop => [pop.coordenadas!.lat, pop.coordenadas!.lng])
        )
        map.fitBounds(bounds, { padding: [20, 20] })
      }
    }
  }, [map, pops])
  
  return null
}

const MapPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusPOP | 'all'>('all')
  const [selectedPop, setSelectedPop] = useState<POP | null>(null)
  const [currentLayer, setCurrentLayer] = useState('openstreetmap')
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  
  const { data: popsData, isLoading, error } = usePOPs({
    page: 1,
    limit: 100,
    busca: searchTerm,
    status: statusFilter === 'all' ? undefined : [statusFilter]
  })
  
  // Add cluster styles on component mount
  useEffect(() => {
    addClusterStyles()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mapa</h1>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
        <Card className="h-96">
          <CardContent className="flex items-center justify-center h-full">
            <div className="animate-pulse text-center">
              <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Carregando mapa...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar mapa</h3>
          <p className="text-gray-500">Tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }

  const pops = popsData?.dados || []
  const validPops = pops.filter((pop: POP) => pop.coordenadas?.lat && pop.coordenadas?.lng)
  
  // const filteredPops = pops?.filter(pop => { // Removido temporariamente
  //   const matchesSearch = pop.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //                        pop.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //                        pop.estado.toLowerCase().includes(searchTerm.toLowerCase())
  //   const matchesStatus = statusFilter === 'all' || pop.status === statusFilter
  //   return matchesSearch && matchesStatus
  // }) || []

  // Funções de controle do mapa
  const handleLocateUser = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          setIsLocating(false)
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
          setIsLocating(false)
        }
      )
    } else {
      console.error('Geolocalização não suportada')
      setIsLocating(false)
    }
  }

  const handleNavigateToPop = (pop: POP) => {
    if (pop.coordenadas) {
      // Abrir no Google Maps
      const url = `https://www.google.com/maps/dir/?api=1&destination=${pop.coordenadas.lat},${pop.coordenadas.lng}`
      window.open(url, '_blank')
    }
  }

  const handleViewPopDetails = (pop: POP) => {
    // Navegar para a página de detalhes do POP
    // Implementar navegação quando a página estiver pronta
    console.log('Ver detalhes do POP:', pop.nome)
  }
  
  // Default center (Brazil)
  const defaultCenter: [number, number] = [-14.235, -51.9253]
  const mapCenter = validPops.length > 0 
    ? [validPops[0].coordenadas!.lat, validPops[0].coordenadas!.lng] as [number, number]
    : defaultCenter

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mapa</h1>
          <p className="text-muted-foreground">
            Visualização geográfica dos POPs ({validPops.length} localizados)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar POP
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar POPs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusPOP | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">Todos os Status</option>
          <option value="operacional">Operacional</option>
          <option value="manutencao">Manutenção</option>
          <option value="critico">Crítico</option>
          <option value="desmobilizacao">Desmobilização</option>
          <option value="desmobilizado">Desmobilizado</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="h-5 w-5 mr-2" />
                Mapa Interativo
              </CardTitle>
              <CardDescription>
                Clique nos marcadores para ver detalhes dos POPs
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 w-full relative">
                <MapContainer
                  center={mapCenter as any}
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-b-lg"
                >
                  <MapLayers currentLayer={currentLayer} />
                  
                  <FitBounds pops={validPops} />
                  
                  <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterCustomIcon}
                    maxClusterRadius={50}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    zoomToBoundsOnClick={true}
                    spiderfyDistanceMultiplier={2}
                  >
                    {validPops.map((pop: POP) => (
                      <Marker
                        key={pop.id}
                        position={[pop.coordenadas!.lat, pop.coordenadas!.lng] as any}
                        icon={createCustomIcon(pop.status) as any}
                        eventHandlers={{
                          click: () => setSelectedPop(pop)
                        } as any}
                      >
                        <Popup>
                          <div className="p-2 min-w-48">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg">{pop.nome}</h3>
                              <Badge 
                                variant={pop.status === 'operacional' ? 'default' : 
                                        pop.status === 'critico' ? 'destructive' : 'secondary'}
                              >
                                {getStatusLabel(pop.status)}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {pop.cidade}, {pop.estado}
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                {pop.quantidade_clientes} clientes
                              </div>
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 mr-2" />
                                {pop.tipo}
                              </div>
                            </div>
                            <div className="mt-3">
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => setSelectedPop(pop)}
                              >
                                Ver Detalhes
                              </Button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    
                    {/* Marcador da localização do usuário */}
                    {userLocation && (
                      <Marker
                        position={userLocation as any}
                        icon={L.divIcon({
                          className: 'user-location-marker',
                          html: '<div style="background: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                          iconSize: [16, 16],
                          iconAnchor: [8, 8]
                        }) as any}
                      >
                        <Popup>
                          <div className="text-center">
                            <p className="font-medium">Sua Localização</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MarkerClusterGroup>
                  
                  {/* Controles do Mapa */}
                  <MapControls
                    onLocateUser={handleLocateUser}
                    isLocating={isLocating}
                    currentLayer={currentLayer}
                    onLayerChange={setCurrentLayer}
                    userLocation={userLocation}
                  />
                </MapContainer>
                
                {/* Painel de Informações do POP */}
                <PopInfoPanel
                  pop={selectedPop}
                  onClose={() => setSelectedPop(null)}
                  onNavigate={handleNavigateToPop}
                  onViewDetails={handleViewPopDetails}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm">Operacional</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Manutenção</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm">Crítico</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                <span className="text-sm">Desmobilização</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-gray-700"></div>
                <span className="text-sm">Desmobilizado</span>
              </div>
            </CardContent>
          </Card>

          {/* Selected POP Details */}
          {selectedPop && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  {getStatusIcon(selectedPop.status)}
                  <span className="ml-2">{selectedPop.nome}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Badge variant={selectedPop.status === 'operacional' ? 'default' : 
                                selectedPop.status === 'critico' ? 'destructive' : 'secondary'}>
                    {getStatusLabel(selectedPop.status)}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Localização:</span>
                    <p className="text-gray-600">{selectedPop.cidade}, {selectedPop.estado}</p>
                  </div>
                  <div>
                    <span className="font-medium">Clientes:</span>
                    <p className="text-gray-600">{selectedPop.quantidade_clientes}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span>
                    <p className="text-gray-600">{selectedPop.tipo}</p>
                  </div>
                  {selectedPop.temperatura && (
                    <div>
                      <span className="font-medium">Temperatura:</span>
                      <p className="text-gray-600">{selectedPop.temperatura}°C</p>
                    </div>
                  )}
                </div>
                <Button size="sm" className="w-full">
                  Ver Detalhes Completos
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total de POPs:</span>
                <span className="font-semibold">{pops.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Localizados:</span>
                <span className="font-semibold">{validPops.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Operacionais:</span>
                <span className="font-semibold text-green-600">
                  {pops.filter((p: POP) => p.status === 'operacional').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Em Manutenção:</span>
                <span className="font-semibold text-yellow-600">
                  {pops.filter((p: POP) => p.status === 'manutencao').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Críticos:</span>
                <span className="font-semibold text-red-600">
                  {pops.filter((p: POP) => p.status === 'critico').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default MapPage