import { useState, useCallback } from 'react';
import Map, { Source, Layer, NavigationControl, ScaleControl, FullscreenControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface MapLayer {
  id: string;
  name: string;
  url: string;
  type: 'fill' | 'circle' | 'line';
  paint: any;
}

const BASEMAP_STYLES = [
  {
    id: 'positron',
    name: 'Light',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  },
  {
    id: 'dark-matter',
    name: 'Dark',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  },
  {
    id: 'voyager',
    name: 'Voyager',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  },
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://tiles.openfreemap.org/styles/liberty',
  },
];

const MAP_LAYERS: MapLayer[] = [
  {
    id: 'schemes',
    name: 'Water Supply Schemes',
    url: '/api/v1/gis/schemes/geojson',
    type: 'fill',
    paint: {
      'fill-color': [
        'match',
        ['get', 'status'],
        'active', '#22c55e',
        'planning', '#3b82f6',
        'decommissioned', '#94a3b8',
        '#6b7280'
      ],
      'fill-opacity': 0.6,
      'fill-outline-color': '#000000',
    },
  },
  {
    id: 'dmas',
    name: 'District Metered Areas',
    url: '/api/v1/gis/dmas/geojson',
    type: 'fill',
    paint: {
      'fill-color': [
        'match',
        ['get', 'status'],
        'active', '#8b5cf6',
        'planned', '#06b6d4',
        'retired', '#94a3b8',
        '#6b7280'
      ],
      'fill-opacity': 0.5,
      'fill-outline-color': '#000000',
    },
  },
  {
    id: 'facilities',
    name: 'Facilities',
    url: '/api/v1/gis/facilities/geojson',
    type: 'circle',
    paint: {
      'circle-radius': 6,
      'circle-color': [
        'match',
        ['get', 'category'],
        'source', '#10b981',
        'treatment', '#3b82f6',
        'pumpstation', '#f59e0b',
        'reservoir', '#06b6d4',
        '#6b7280'
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  },
];

async function fetchGeoJSON(url: string) {
  const response = await fetch(url, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.json();
}

function useLayerData(layerId: string, url: string, enabled: boolean) {
  return useQuery({
    queryKey: ['gis-layer', layerId],
    queryFn: () => fetchGeoJSON(url),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

interface MapConsoleProps {
  className?: string;
}

export function MapConsole({ className }: MapConsoleProps) {
  const [viewState, setViewState] = useState({
    longitude: 36.8219,
    latitude: -1.2921,
    zoom: 8,
  });

  const [basemapId, setBasemapId] = useState('positron');
  const [enabledLayers, setEnabledLayers] = useState<Set<string>>(
    new Set(['schemes', 'dmas', 'facilities'])
  );

  const toggleLayer = useCallback((layerId: string) => {
    setEnabledLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  }, []);

  const schemesQuery = useLayerData('schemes', MAP_LAYERS[0].url, enabledLayers.has('schemes'));
  const dmasQuery = useLayerData('dmas', MAP_LAYERS[1].url, enabledLayers.has('dmas'));
  const facilitiesQuery = useLayerData('facilities', MAP_LAYERS[2].url, enabledLayers.has('facilities'));

  const layerQueries = {
    schemes: schemesQuery,
    dmas: dmasQuery,
    facilities: facilitiesQuery,
  };

  const selectedBasemap = BASEMAP_STYLES.find((style) => style.id === basemapId) || BASEMAP_STYLES[0];

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={selectedBasemap.url}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-left" />
        <FullscreenControl position="top-right" />

        {MAP_LAYERS.map((layer) => {
          const query = layerQueries[layer.id as keyof typeof layerQueries];
          if (!enabledLayers.has(layer.id) || !query.data) return null;

          return (
            <Source
              key={layer.id}
              id={layer.id}
              type="geojson"
              data={query.data}
            >
              <Layer
                id={layer.id}
                type={layer.type}
                paint={layer.paint}
              />
            </Source>
          );
        })}
      </Map>

      <Card className="absolute top-4 left-4 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Map Controls</h3>
          
          <div className="mb-4">
            <Label className="text-sm mb-2 block text-gray-700 dark:text-gray-300">Basemap</Label>
            <Select value={basemapId} onValueChange={setBasemapId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BASEMAP_STYLES.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    {style.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Layers</h4>
          <div className="space-y-3">
            {MAP_LAYERS.map((layer) => {
              const query = layerQueries[layer.id as keyof typeof layerQueries];
              return (
                <div key={layer.id} className="flex items-center justify-between">
                  <Label
                    htmlFor={`layer-${layer.id}`}
                    className="text-sm cursor-pointer text-gray-700 dark:text-gray-300"
                  >
                    {layer.name}
                  </Label>
                  <div className="flex items-center gap-2">
                    {query.isLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    {query.isError && (
                      <span className="text-xs text-red-500">Error</span>
                    )}
                    <Switch
                      id={`layer-${layer.id}`}
                      checked={enabledLayers.has(layer.id)}
                      onCheckedChange={() => toggleLayer(layer.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                <span className="text-gray-700 dark:text-gray-300">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                <span className="text-gray-700 dark:text-gray-300">Planning/Treatment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                <span className="text-gray-700 dark:text-gray-300">Pump Station</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
