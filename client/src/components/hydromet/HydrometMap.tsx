import { useState, useCallback, useMemo, useEffect } from 'react';
import Map, { Source, Layer, NavigationControl, ScaleControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Droplets, Edit, X } from 'lucide-react';
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

interface HoverInfo {
  longitude: number;
  latitude: number;
  name: string;
  code: string;
  kind: string;
  status: string;
}

interface PopupInfo {
  source: WaterSource;
  longitude: number;
  latitude: number;
}

export function HydrometMap({ sources, stations, selectedId, onSelect, onEdit, height = '400px' }: HydrometMapProps) {
  const calculatedBounds = useMemo(() => calculateBounds(sources, stations), [sources, stations]);
  
  const [viewState, setViewState] = useState({
    longitude: calculatedBounds.longitude,
    latitude: calculatedBounds.latitude,
    zoom: calculatedBounds.zoom,
  });

  const [hasInitialized, setHasInitialized] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
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

  const sourcesGeoJSON = useMemo(() => {
    if (!sources) return null;
    
    const sourcesWithLocation = sources.filter(s => s.location);
    
    if (sourcesWithLocation.length === 0) return null;
    
    const geojson = {
      type: 'FeatureCollection' as const,
      features: sourcesWithLocation.map(source => ({
          type: 'Feature' as const,
          id: source.id,
          geometry: source.location!,
          properties: {
            id: source.id,
            name: source.name,
            code: source.code,
            kind: source.kind?.name || 'Unknown',
            status: source.status?.name || 'Unknown',
          },
        })),
    };
    
    return geojson;
  }, [sources]);

  const stationsGeoJSON = useMemo(() => {
    if (!stations) return null;
    
    const stationsWithLocation = stations.filter(s => s.location);
    if (stationsWithLocation.length === 0) return null;
    
    return {
      type: 'FeatureCollection' as const,
      features: stationsWithLocation.map(station => ({
          type: 'Feature' as const,
          id: station.id,
          geometry: station.location!,
          properties: {
            id: station.id,
            name: station.name,
            code: station.code,
            type: station.station_type?.name || 'Unknown',
            active: station.active,
          },
        })),
    };
  }, [stations]);

  const handleMapClick = useCallback((event: any) => {
    const features = event.features;
    if (features && features.length > 0) {
      const feature = features[0];
      const props = feature.properties;
      const coords = feature.geometry.coordinates;
      
      if (feature.layer.id === 'sources-layer' && sources) {
        const source = sources.find(s => s.id === props.id);
        if (source) {
          setPopupInfo({
            source,
            longitude: coords[0],
            latitude: coords[1],
          });
          if (onSelect) {
            onSelect(props.id, 'source');
          }
        }
      } else if (feature.layer.id === 'stations-layer') {
        if (onSelect) {
          onSelect(props.id, 'station');
        }
      }
    }
  }, [onSelect, sources]);

  const handleMouseEnter = useCallback((event: any) => {
    const features = event.features;
    if (features && features.length > 0) {
      const feature = features[0];
      const props = feature.properties;
      const coords = feature.geometry.coordinates;
      
      setHoverInfo({
        longitude: coords[0],
        latitude: coords[1],
        name: props.name,
        code: props.code,
        kind: props.kind,
        status: props.status,
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

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
        interactiveLayerIds={['sources-layer', 'stations-layer']}
        onClick={handleMapClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        cursor={hoverInfo ? 'pointer' : 'grab'}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-left" />

        {sourcesGeoJSON && sourcesGeoJSON.features.length > 0 && (
          <Source id="sources" type="geojson" data={sourcesGeoJSON as any}>
            <Layer
              id="sources-layer"
              type="circle"
              paint={{
                'circle-radius': selectedId != null 
                  ? ['case', ['==', ['get', 'id'], selectedId], 12, 8]
                  : 8,
                'circle-color': [
                  'match',
                  ['get', 'status'],
                  'Active', '#22c55e',
                  'Inactive', '#94a3b8',
                  'Abandoned', '#ef4444',
                  '#3b82f6'
                ],
                'circle-stroke-width': 2,
                'circle-stroke-color': selectedId != null
                  ? ['case', ['==', ['get', 'id'], selectedId], '#000000', '#ffffff']
                  : '#ffffff',
              }}
            />
          </Source>
        )}

        {stationsGeoJSON && stationsGeoJSON.features.length > 0 && (
          <Source id="stations" type="geojson" data={stationsGeoJSON as any}>
            <Layer
              id="stations-layer"
              type="circle"
              paint={{
                'circle-radius': selectedId != null
                  ? ['case', ['==', ['get', 'id'], selectedId], 12, 8]
                  : 8,
                'circle-color': ['case', ['get', 'active'], '#3b82f6', '#94a3b8'],
                'circle-stroke-width': 2,
                'circle-stroke-color': selectedId != null
                  ? ['case', ['==', ['get', 'id'], selectedId], '#000000', '#ffffff']
                  : '#ffffff',
              }}
            />
          </Source>
        )}

        {hoverInfo && !popupInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={12}
          >
            <div className="p-1 min-w-[150px]">
              <p className="font-semibold text-sm">{hoverInfo.name}</p>
              <p className="text-xs text-muted-foreground">{hoverInfo.code}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs">{hoverInfo.kind}</span>
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: STATUS_COLORS[hoverInfo.status] || STATUS_COLORS.Unknown }}
                />
                <span className="text-xs">{hoverInfo.status}</span>
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
            offset={12}
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

      <div className="absolute bottom-8 left-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-2 text-xs">
        <p className="font-semibold mb-1.5 text-muted-foreground">Source Status</p>
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
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3b82f6]" />
            <span>Unknown</span>
          </div>
        </div>
      </div>
    </div>
  );
}
