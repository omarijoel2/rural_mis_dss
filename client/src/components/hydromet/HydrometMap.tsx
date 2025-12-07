import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Map, { NavigationControl, ScaleControl, Popup, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Droplets, Edit, X, Circle, Triangle, Square, Diamond, Waves, Database } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Source as WaterSource, HydrometStation } from '../../services/hydromet.service';

interface HydrometMapProps {
  sources?: WaterSource[];
  stations?: HydrometStation[];
  selectedId?: number;
  onSelect?: (id: number, type: 'source' | 'station') => void;
  onEdit?: (source: WaterSource) => void;
  height?: string;
}

const COUNTY_CENTERS: Record<string, { longitude: number; latitude: number; zoom: number }> = {
  turkana: { longitude: 35.5, latitude: 3.5, zoom: 7 },
  wajir: { longitude: 40.0, latitude: 1.75, zoom: 7 },
  marsabit: { longitude: 37.98, latitude: 2.33, zoom: 7 },
  mandera: { longitude: 40.95, latitude: 3.93, zoom: 7 },
  garissa: { longitude: 39.63, latitude: -0.45, zoom: 7 },
  default: { longitude: 38.0, latitude: 1.5, zoom: 6 },
};

const STATUS_COLORS: Record<string, string> = {
  'Active': '#22c55e',
  'Inactive': '#94a3b8',
  'Abandoned': '#ef4444',
  'Unknown': '#3b82f6',
};

const SOURCE_TYPE_ICONS: Record<string, { icon: string; label: string }> = {
  'Borehole': { icon: '●', label: 'Borehole' },
  'Well': { icon: '◆', label: 'Well' },
  'River Intake': { icon: '▲', label: 'River Intake' },
  'Spring': { icon: '◐', label: 'Spring' },
  'Dam/Reservoir': { icon: '■', label: 'Dam/Reservoir' },
  'Lake': { icon: '◯', label: 'Lake' },
  'Unknown': { icon: '●', label: 'Unknown' },
};

function calculateBounds(sources?: WaterSource[], stations?: HydrometStation[]) {
  const points: [number, number][] = [];
  
  sources?.forEach(s => {
    if (s.location?.coordinates) {
      points.push([s.location.coordinates[0], s.location.coordinates[1]]);
    }
  });
  
  stations?.forEach(s => {
    if (s.location?.coordinates) {
      points.push([s.location.coordinates[0], s.location.coordinates[1]]);
    }
  });
  
  if (points.length === 0) {
    return COUNTY_CENTERS.turkana;
  }
  
  if (points.length === 1) {
    return { longitude: points[0][0], latitude: points[0][1], zoom: 10 };
  }
  
  const lngs = points.map(p => p[0]);
  const lats = points.map(p => p[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  
  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;
  
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);
  
  let zoom = 10;
  if (maxDiff > 2) zoom = 6;
  else if (maxDiff > 1) zoom = 7;
  else if (maxDiff > 0.5) zoom = 8;
  else if (maxDiff > 0.1) zoom = 9;
  
  return { longitude: centerLng, latitude: centerLat, zoom };
}

interface PopupInfo {
  source: WaterSource;
  longitude: number;
  latitude: number;
}

function SourceMarker({ 
  source, 
  isSelected, 
  onClick, 
  onHover 
}: { 
  source: WaterSource; 
  isSelected: boolean;
  onClick: () => void;
  onHover: (hovering: boolean) => void;
}) {
  const kind = source.kind?.name || 'Unknown';
  const status = source.status?.name || 'Unknown';
  const color = STATUS_COLORS[status] || STATUS_COLORS.Unknown;
  const typeInfo = SOURCE_TYPE_ICONS[kind] || SOURCE_TYPE_ICONS.Unknown;
  
  const getMarkerShape = () => {
    switch (kind) {
      case 'Borehole':
        return (
          <div 
            className="flex items-center justify-center transition-transform"
            style={{ 
              width: isSelected ? 32 : 26, 
              height: isSelected ? 32 : 26,
              backgroundColor: color,
              borderRadius: '50%',
              border: '3px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-white text-xs font-bold">B</span>
          </div>
        );
      case 'Well':
        return (
          <div 
            className="flex items-center justify-center transition-transform"
            style={{ 
              width: isSelected ? 32 : 26, 
              height: isSelected ? 32 : 26,
              backgroundColor: color,
              borderRadius: '4px',
              transform: 'rotate(45deg)',
              border: '3px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-white text-xs font-bold" style={{ transform: 'rotate(-45deg)' }}>W</span>
          </div>
        );
      case 'River Intake':
        return (
          <div 
            className="flex items-center justify-center transition-transform"
            style={{ 
              width: 0,
              height: 0,
              borderLeft: `${isSelected ? 16 : 13}px solid transparent`,
              borderRight: `${isSelected ? 16 : 13}px solid transparent`,
              borderBottom: `${isSelected ? 28 : 22}px solid ${color}`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          />
        );
      case 'Spring':
        return (
          <div 
            className="flex items-center justify-center transition-transform"
            style={{ 
              width: isSelected ? 32 : 26, 
              height: isSelected ? 32 : 26,
              backgroundColor: color,
              borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
              border: '3px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          />
        );
      case 'Dam/Reservoir':
        return (
          <div 
            className="flex items-center justify-center transition-transform"
            style={{ 
              width: isSelected ? 32 : 26, 
              height: isSelected ? 24 : 20,
              backgroundColor: color,
              borderRadius: '4px',
              border: '3px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-white text-xs font-bold">D</span>
          </div>
        );
      case 'Lake':
        return (
          <div 
            className="flex items-center justify-center transition-transform"
            style={{ 
              width: isSelected ? 36 : 30, 
              height: isSelected ? 24 : 20,
              backgroundColor: color,
              borderRadius: '50%',
              border: '3px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <Waves className="h-3 w-3 text-white" />
          </div>
        );
      default:
        return (
          <div 
            className="flex items-center justify-center transition-transform"
            style={{ 
              width: isSelected ? 32 : 26, 
              height: isSelected ? 32 : 26,
              backgroundColor: color,
              borderRadius: '50%',
              border: '3px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <Droplets className="h-3 w-3 text-white" />
          </div>
        );
    }
  };

  if (!source.location) return null;

  return (
    <Marker
      longitude={source.location.coordinates[0]}
      latitude={source.location.coordinates[1]}
      anchor="center"
    >
      <div 
        className="cursor-pointer hover:scale-110 transition-transform"
        onClick={onClick}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        {getMarkerShape()}
      </div>
    </Marker>
  );
}

export function HydrometMap({ sources, stations, selectedId, onSelect, onEdit, height = '400px' }: HydrometMapProps) {
  const calculatedBounds = useMemo(() => calculateBounds(sources, stations), [sources, stations]);
  
  const [viewState, setViewState] = useState({
    longitude: calculatedBounds.longitude,
    latitude: calculatedBounds.latitude,
    zoom: calculatedBounds.zoom,
  });

  const [hasInitialized, setHasInitialized] = useState(false);
  const [hoveredSource, setHoveredSource] = useState<WaterSource | null>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  
  useEffect(() => {
    if (!hasInitialized && (sources?.length || stations?.length)) {
      setViewState({
        longitude: calculatedBounds.longitude,
        latitude: calculatedBounds.latitude,
        zoom: calculatedBounds.zoom,
      });
      setHasInitialized(true);
    }
  }, [calculatedBounds, sources, stations, hasInitialized]);

  const sourcesWithLocation = useMemo(() => {
    return sources?.filter(s => s.location) || [];
  }, [sources]);

  const sourceTypes = useMemo(() => {
    const types = new Set<string>();
    sourcesWithLocation.forEach(s => {
      types.add(s.kind?.name || 'Unknown');
    });
    return Array.from(types);
  }, [sourcesWithLocation]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'abandoned': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border relative">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-left" />

        {sourcesWithLocation.map(source => (
          <SourceMarker
            key={source.id}
            source={source}
            isSelected={selectedId === source.id}
            onClick={() => {
              setPopupInfo({
                source,
                longitude: source.location!.coordinates[0],
                latitude: source.location!.coordinates[1],
              });
              if (onSelect) onSelect(source.id, 'source');
            }}
            onHover={(hovering) => setHoveredSource(hovering ? source : null)}
          />
        ))}

        {hoveredSource && !popupInfo && hoveredSource.location && (
          <Popup
            longitude={hoveredSource.location.coordinates[0]}
            latitude={hoveredSource.location.coordinates[1]}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={15}
          >
            <div className="p-1 min-w-[150px]">
              <p className="font-semibold text-sm">{hoveredSource.name}</p>
              <p className="text-xs text-muted-foreground">{hoveredSource.code}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs">{hoveredSource.kind?.name || 'Unknown'}</span>
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: STATUS_COLORS[hoveredSource.status?.name || 'Unknown'] }}
                />
                <span className="text-xs">{hoveredSource.status?.name || 'Unknown'}</span>
              </div>
            </div>
          </Popup>
        )}

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={15}
            maxWidth="300px"
          >
            <div className="p-2 min-w-[220px]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-semibold text-sm">{popupInfo.source.name}</p>
                    <p className="text-xs text-muted-foreground">{popupInfo.source.code}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setPopupInfo(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{popupInfo.source.kind?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={getStatusBadgeVariant(popupInfo.source.status?.name || '')}>
                    {popupInfo.source.status?.name || 'Unknown'}
                  </Badge>
                </div>
                {popupInfo.source.catchment && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Catchment:</span>
                    <span>{popupInfo.source.catchment}</span>
                  </div>
                )}
                {popupInfo.source.capacity_m3_per_day && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span>{popupInfo.source.capacity_m3_per_day.toLocaleString()} m³/day</span>
                  </div>
                )}
                {popupInfo.source.depth_m && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Depth:</span>
                    <span>{popupInfo.source.depth_m} m</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="text-xs">
                    {popupInfo.latitude.toFixed(4)}, {popupInfo.longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              {onEdit && (
                <div className="mt-3 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onEdit(popupInfo.source);
                      setPopupInfo(null);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit Source
                  </Button>
                </div>
              )}
            </div>
          </Popup>
        )}
      </Map>

      <div className="absolute bottom-8 left-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-3 text-xs max-w-[200px]">
        <p className="font-semibold mb-2 text-muted-foreground border-b pb-1">Source Types</p>
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">B</span>
            </div>
            <span>Borehole</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400 flex items-center justify-center" style={{ transform: 'rotate(45deg)' }}>
              <span className="text-white text-[8px] font-bold" style={{ transform: 'rotate(-45deg)' }}>W</span>
            </div>
            <span>Well</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ 
              width: 0, height: 0, 
              borderLeft: '7px solid transparent', 
              borderRight: '7px solid transparent', 
              borderBottom: '12px solid #9ca3af' 
            }} />
            <span>River Intake</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400" style={{ borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)' }} />
            <span>Spring</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-gray-400 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">D</span>
            </div>
            <span>Dam/Reservoir</span>
          </div>
        </div>
        
        <p className="font-semibold mb-2 text-muted-foreground border-b pb-1">Status Colors</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#94a3b8]" />
            <span>Inactive</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
            <span>Abandoned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
