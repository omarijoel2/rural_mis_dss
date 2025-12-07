import { useState, useCallback, useMemo, useEffect } from 'react';
import Map, { Source, Layer, Marker, NavigationControl, ScaleControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';
import type { Source as WaterSource, HydrometStation } from '../../services/hydromet.service';

interface HydrometMapProps {
  sources?: WaterSource[];
  stations?: HydrometStation[];
  selectedId?: number;
  onSelect?: (id: number, type: 'source' | 'station') => void;
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

export function HydrometMap({ sources, stations, selectedId, onSelect, height = '400px' }: HydrometMapProps) {
  const calculatedBounds = useMemo(() => calculateBounds(sources, stations), [sources, stations]);
  
  const [viewState, setViewState] = useState({
    longitude: calculatedBounds.longitude,
    latitude: calculatedBounds.latitude,
    zoom: calculatedBounds.zoom,
  });

  const [hasInitialized, setHasInitialized] = useState(false);
  
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
    console.log('[HydrometMap] Sources with location:', sourcesWithLocation.length, 'of', sources.length);
    
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
    
    console.log('[HydrometMap] GeoJSON features:', geojson.features.length);
    return geojson;
  }, [sources]);

  const stationsGeoJSON = useMemo(() => {
    if (!stations) return null;
    
    return {
      type: 'FeatureCollection' as const,
      features: stations
        .filter(s => s.location)
        .map(station => ({
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
      const id = feature.properties.id;
      const layer = feature.layer.id;
      
      if (onSelect) {
        onSelect(id, layer === 'sources-layer' ? 'source' : 'station');
      }
    }
  }, [onSelect]);

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={['sources-layer', 'stations-layer']}
        onClick={handleMapClick}
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
                  ? ['case', ['==', ['get', 'id'], selectedId], 10, 8]
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
                  ? ['case', ['==', ['get', 'id'], selectedId], 10, 8]
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
      </Map>
    </div>
  );
}
