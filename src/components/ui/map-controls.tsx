import { useState } from 'react'
import { useMap } from 'react-leaflet'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Badge } from './badge'
import { 
  Ruler, 
  Target, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Satellite,
  Map as MapIcon,
  Navigation2
} from 'lucide-react'
import L from 'leaflet'

interface MapControlsProps {
  onLayerChange?: (layer: string) => void
  currentLayer?: string
  onLocateUser?: () => void
  isLocating?: boolean
  userLocation?: [number, number] | null
}

export function MapControls({ onLayerChange, currentLayer = 'osm' }: MapControlsProps) {
  const map = useMap()
  const [isLocating, setIsLocating] = useState(false)
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null)
  const [measurementLine, setMeasurementLine] = useState<L.Polyline | null>(null)
  const [measurementPoints, setMeasurementPoints] = useState<L.LatLng[]>([])

  // Geolocalização
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const userPos = L.latLng(latitude, longitude)
        
        setUserLocation(userPos)
        map.setView(userPos, 15)
        
        // Adicionar marcador da localização do usuário
        L.marker(userPos, {
          icon: L.divIcon({
            html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
            className: 'user-location-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }).addTo(map)
        
        // Adicionar círculo de precisão
        const accuracy = position.coords.accuracy
        L.circle(userPos, { radius: accuracy, fillOpacity: 0.1, color: '#3b82f6' }).addTo(map)
        
        setIsLocating(false)
      },
      (error) => {
        console.error('Erro ao obter localização:', error)
        alert('Não foi possível obter sua localização')
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  // Controle de zoom
  const handleZoomIn = () => {
    map.zoomIn()
  }

  const handleZoomOut = () => {
    map.zoomOut()
  }

  // Reset da visualização
  const handleResetView = () => {
    map.setView([-14.235, -51.9253], 6) // Centro do Brasil
  }

  // Alternar camadas do mapa
  const handleLayerChange = (layer: string) => {
    if (onLayerChange) {
      onLayerChange(layer)
    }
  }

  // Ferramenta de medição
  const toggleMeasurement = () => {
    if (isMeasuring) {
      // Parar medição
      setIsMeasuring(false)
      if (measurementLine) {
        map.removeLayer(measurementLine)
        setMeasurementLine(null)
      }
      setMeasurementPoints([])
      map.off('click', handleMeasurementClick)
    } else {
      // Iniciar medição
      setIsMeasuring(true)
      setMeasurementPoints([])
      map.on('click', handleMeasurementClick)
    }
  }

  const handleMeasurementClick = (e: L.LeafletMouseEvent) => {
    const newPoint = e.latlng
    const newPoints = [...measurementPoints, newPoint]
    setMeasurementPoints(newPoints)

    if (measurementLine) {
      map.removeLayer(measurementLine)
    }

    if (newPoints.length >= 2) {
      const line = L.polyline(newPoints, {
        color: '#ef4444',
        weight: 3,
        opacity: 0.8,
        dashArray: '5, 10'
      }).addTo(map)
      
      setMeasurementLine(line)
      
      // Calcular distância total
      let totalDistance = 0
      for (let i = 1; i < newPoints.length; i++) {
        totalDistance += newPoints[i-1].distanceTo(newPoints[i])
      }
      
      // Mostrar popup com a distância
      const lastPoint = newPoints[newPoints.length - 1]
      L.popup()
        .setLatLng(lastPoint)
        .setContent(`<div class="text-center"><strong>Distância:</strong><br/>${(totalDistance / 1000).toFixed(2)} km</div>`)
        .openOn(map)
    }
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] space-y-2">
      {/* Controles de Zoom */}
      <Card className="p-2">
        <div className="flex flex-col space-y-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Controles de Navegação */}
      <Card className="p-2">
        <div className="flex flex-col space-y-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLocateUser}
            disabled={isLocating}
            className="h-8 w-8 p-0"
            title="Minha Localização"
          >
            {isLocating ? (
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            ) : (
              <Target className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetView}
            className="h-8 w-8 p-0"
            title="Reset Visualização"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Controles de Camadas */}
      <Card className="p-2">
        <div className="flex flex-col space-y-1">
          <Button
            variant={currentLayer === 'osm' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLayerChange('osm')}
            className="h-8 w-8 p-0"
            title="Mapa Padrão"
          >
            <MapIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={currentLayer === 'satellite' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLayerChange('satellite')}
            className="h-8 w-8 p-0"
            title="Satélite"
          >
            <Satellite className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Ferramentas */}
      <Card className="p-2">
        <div className="flex flex-col space-y-1">
          <Button
            variant={isMeasuring ? 'default' : 'outline'}
            size="sm"
            onClick={toggleMeasurement}
            className="h-8 w-8 p-0"
            title="Ferramenta de Medição"
          >
            <Ruler className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Status da Medição */}
      {isMeasuring && (
        <Card className="p-2 max-w-48">
          <CardContent className="p-0">
            <div className="text-xs text-center">
              <Badge variant="secondary" className="mb-1">
                Medindo
              </Badge>
              <p className="text-gray-600">
                Clique no mapa para medir distâncias
              </p>
              {measurementPoints.length > 0 && (
                <p className="mt-1 font-medium">
                  {measurementPoints.length} ponto(s)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Localização do Usuário */}
      {userLocation && (
        <Card className="p-2 max-w-48">
          <CardContent className="p-0">
            <div className="text-xs text-center">
              <Badge variant="default" className="mb-1">
                <Navigation2 className="h-3 w-3 mr-1" />
                Localizado
              </Badge>
              <p className="text-gray-600">
                Sua localização atual
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MapControls