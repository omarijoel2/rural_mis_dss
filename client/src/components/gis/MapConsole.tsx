import { useState, useCallback } from 'react';
import Map, { Source, Layer, NavigationControl, ScaleControl, FullscreenControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NetworkLayersPanel } from './NetworkLayersPanel';
import { Layers } from 'lucide-react';

interface MapLayer {
  id: string;
  name: string;
  tileUrl: string;
  sourceLayer: string;
  type: 'fill' | 'circle' | 'line';
  category: 'coverage' | 'infrastructure' | 'network';
  paint: any;
  minZoom?: number;
  maxZoom?: number;
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
    category: 'coverage',
    tileUrl: '/api/v1/gis/tiles/schemes/{z}/{x}/{y}.mvt',
    sourceLayer: 'schemes',
    type: 'fill',
    minZoom: 0,
    maxZoom: 22,
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
    category: 'coverage',
    tileUrl: '/api/v1/gis/tiles/dmas/{z}/{x}/{y}.mvt',
    sourceLayer: 'dmas',
    type: 'fill',
    minZoom: 0,
    maxZoom: 22,
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
    category: 'infrastructure',
    tileUrl: '/api/v1/gis/tiles/facilities/{z}/{x}/{y}.mvt',
    sourceLayer: 'facilities',
    type: 'circle',
    minZoom: 8,
    maxZoom: 22,
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
  {
    id: 'pipelines',
    name: 'Pipelines',
    category: 'network',
    tileUrl: '/api/v1/gis/tiles/pipelines/{z}/{x}/{y}.mvt',
    sourceLayer: 'pipelines',
    type: 'line',
    minZoom: 12,
    maxZoom: 22,
    paint: {
      'line-color': [
        'match',
        ['get', 'status'],
        'active', '#3b82f6',
        'leak', '#ef4444',
        'rehab', '#f59e0b',
        'abandoned', '#94a3b8',
        '#6b7280'
      ],
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        12, 1,
        16, 3,
        20, 6
      ],
      'line-opacity': 0.8,
    },
  },
  {
    id: 'network-nodes',
    name: 'Network Nodes',
    category: 'network',
    tileUrl: '/api/v1/gis/tiles/network-nodes/{z}/{x}/{y}.mvt',
    sourceLayer: 'network_nodes',
    type: 'circle',
    minZoom: 14,
    maxZoom: 22,
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        14, 2,
        18, 4,
        22, 8
      ],
      'circle-color': [
        'match',
        ['get', 'type'],
        'source', '#10b981',
        'wtp', '#3b82f6',
        'reservoir', '#06b6d4',
        'junction', '#fbbf24',
        'valve', '#8b5cf6',
        'pump', '#f59e0b',
        '#6b7280'
      ],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    },
  },
];


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
    new Set(['schemes', 'dmas', 'facilities', 'pipelines'])
  );
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [layerOpacity, setLayerOpacity] = useState(80);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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

  const handleCategoryFilterChange = useCallback((category: string) => {
    setCategoryFilter(category);
    if (category === 'all') {
      setEnabledLayers(new Set(['schemes', 'dmas', 'facilities', 'pipelines']));
    } else {
      const categoryLayers = MAP_LAYERS
        .filter(layer => layer.category === category)
        .map(layer => layer.id);
      setEnabledLayers(new Set(categoryLayers));
    }
  }, []);

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
          if (!enabledLayers.has(layer.id)) return null;
          if (categoryFilter !== 'all' && layer.category !== categoryFilter) return null;

          const adjustedPaint = { ...layer.paint };
          
          if (layer.type === 'fill') {
            adjustedPaint['fill-opacity'] = (layer.paint['fill-opacity'] || 0.6) * (layerOpacity / 100);
          } else if (layer.type === 'circle') {
            adjustedPaint['circle-opacity'] = layerOpacity / 100;
          } else if (layer.type === 'line') {
            adjustedPaint['line-opacity'] = (layer.paint['line-opacity'] || 0.8) * (layerOpacity / 100);
          }

          return (
            <Source
              key={layer.id}
              id={layer.id}
              type="vector"
              tiles={[layer.tileUrl]}
              minzoom={layer.minZoom}
              maxzoom={layer.maxZoom}
            >
              <Layer
                id={layer.id}
                source-layer={layer.sourceLayer}
                type={layer.type}
                paint={adjustedPaint}
                filter={statusFilter !== 'all' ? ['==', ['get', 'status'], statusFilter] : undefined}
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

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowLayersPanel(!showLayersPanel)}
          >
            <Layers className="w-4 h-4 mr-2" />
            {showLayersPanel ? 'Hide' : 'Show'} Network Layers
          </Button>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">Quick Layers</h4>
              <Badge variant="outline" className="text-xs">Vector Tiles</Badge>
            </div>
            <div className="space-y-2">
              {MAP_LAYERS.slice(0, 3).map((layer) => {
                return (
                  <div key={layer.id} className="flex items-center justify-between">
                    <Label
                      htmlFor={`quick-layer-${layer.id}`}
                      className="text-xs cursor-pointer text-gray-700 dark:text-gray-300"
                    >
                      {layer.name}
                    </Label>
                    <Switch
                      id={`quick-layer-${layer.id}`}
                      checked={enabledLayers.has(layer.id)}
                      onCheckedChange={() => toggleLayer(layer.id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {showLayersPanel && (
        <NetworkLayersPanel
          enabledLayers={enabledLayers}
          onLayerToggle={toggleLayer}
          onStatusFilterChange={setStatusFilter}
          onCategoryFilterChange={handleCategoryFilterChange}
          onOpacityChange={setLayerOpacity}
          className="absolute top-4 left-72"
        />
      )}
    </div>
  );
}
