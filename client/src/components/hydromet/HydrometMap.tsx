import { useState, useCallback, useMemo } from 'react';
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

export function HydrometMap({ sources, stations, selectedId, onSelect, height = '400px' }: HydrometMapProps) {
  const [viewState, setViewState] = useState({
    longitude: 36.8219,
    latitude: -1.2921,
    zoom: 8,
  });

  const sourcesGeoJSON = useMemo(() => {
    if (!sources) return null;
    
    return {
      type: 'FeatureCollection' as const,
      features: sources
        .filter(s => s.location)
        .map(source => ({
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

        {sourcesGeoJSON && (
          <Source id="sources" type="geojson" data={sourcesGeoJSON}>
            <Layer
              id="sources-layer"
              type="circle"
              paint={{
                'circle-radius': ['case', ['==', ['get', 'id'], selectedId], 10, 6],
                'circle-color': [
                  'match',
                  ['get', 'status'],
                  'Active', '#22c55e',
                  'Inactive', '#94a3b8',
                  'Abandoned', '#ef4444',
                  '#6b7280'
                ],
                'circle-stroke-width': 2,
                'circle-stroke-color': ['case', ['==', ['get', 'id'], selectedId], '#000000', '#ffffff'],
              }}
            />
          </Source>
        )}

        {stationsGeoJSON && (
          <Source id="stations" type="geojson" data={stationsGeoJSON}>
            <Layer
              id="stations-layer"
              type="circle"
              paint={{
                'circle-radius': ['case', ['==', ['get', 'id'], selectedId], 10, 6],
                'circle-color': ['case', ['get', 'active'], '#3b82f6', '#94a3b8'],
                'circle-stroke-width': 2,
                'circle-stroke-color': ['case', ['==', ['get', 'id'], selectedId], '#000000', '#ffffff'],
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
}
