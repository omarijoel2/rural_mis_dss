import { useState, useCallback, useEffect } from 'react';
import Map, { Source, Layer, NavigationControl, ScaleControl, FullscreenControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NetworkLayersPanel } from './NetworkLayersPanel';
import { Layers, MapPin, Building2, ChevronDown, Grid3X3, LayoutGrid } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

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


interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties: Record<string, any>;
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

interface PopupInfo {
  longitude: number;
  latitude: number;
  feature: GeoJSONFeature;
  layerType: 'county' | 'sub_county' | 'ward';
}

interface MapConsoleProps {
  className?: string;
}

export function MapConsole({ className }: MapConsoleProps) {
  const { tenant } = useAuth();
  const [tenantBoundary, setTenantBoundary] = useState<GeoJSONFeature | null>(null);
  const [subCountiesData, setSubCountiesData] = useState<GeoJSONFeatureCollection | null>(null);
  const [wardsData, setWardsData] = useState<GeoJSONFeatureCollection | null>(null);
  
  const [showCountyBoundary, setShowCountyBoundary] = useState(true);
  const [showSubCounties, setShowSubCounties] = useState(true);
  const [showWards, setShowWards] = useState(false);
  const [adminLayersOpen, setAdminLayersOpen] = useState(true);
  
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  
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

  useEffect(() => {
    const fetchAdminBoundaries = async () => {
      try {
        const [boundaryRes, subCountiesRes, wardsRes] = await Promise.all([
          apiClient.get<{ data: GeoJSONFeature }>('/tenants/current/boundary'),
          apiClient.get<{ data: GeoJSONFeatureCollection }>('/tenants/current/sub-counties/geojson'),
          apiClient.get<{ data: GeoJSONFeatureCollection }>('/tenants/current/wards/geojson'),
        ]);
        
        if (boundaryRes.data) {
          setTenantBoundary(boundaryRes.data);
          const coords = boundaryRes.data.geometry.coordinates[0] as number[][];
          if (coords && coords.length > 0) {
            const lngs = coords.map(c => c[0]);
            const lats = coords.map(c => c[1]);
            const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
            const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
            setViewState(prev => ({
              ...prev,
              longitude: centerLng,
              latitude: centerLat,
              zoom: 8
            }));
          }
        }
        
        if (subCountiesRes.data) {
          setSubCountiesData(subCountiesRes.data);
        }
        
        if (wardsRes.data) {
          setWardsData(wardsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin boundaries:', error);
      }
    };
    fetchAdminBoundaries();
  }, [tenant?.id]);

  const getPolygonCenter = (feature: GeoJSONFeature): [number, number] => {
    const coords = feature.geometry.coordinates[0] as number[][];
    if (!coords || coords.length === 0) return [0, 0];
    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    return [(Math.min(...lngs) + Math.max(...lngs)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2];
  };

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

  const handleMapClick = useCallback((event: any) => {
    const features = event.features;
    if (!features || features.length === 0) {
      setPopupInfo(null);
      return;
    }
    
    const feature = features[0];
    const layerId = feature.layer?.id;
    
    let layerType: 'county' | 'sub_county' | 'ward' = 'county';
    if (layerId?.includes('ward')) {
      layerType = 'ward';
    } else if (layerId?.includes('sub-count')) {
      layerType = 'sub_county';
    }
    
    const center = getPolygonCenter(feature as GeoJSONFeature);
    setPopupInfo({
      longitude: center[0],
      latitude: center[1],
      feature: feature as GeoJSONFeature,
      layerType,
    });
  }, []);

  const interactiveLayerIds = [
    ...(showCountyBoundary && tenantBoundary ? ['tenant-boundary-fill'] : []),
    ...(showSubCounties && subCountiesData ? ['sub-counties-fill'] : []),
    ...(showWards && wardsData ? ['wards-fill'] : []),
  ];

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={handleMapClick}
        interactiveLayerIds={interactiveLayerIds}
        mapStyle={selectedBasemap.url}
        style={{ width: '100%', height: '100%' }}
        cursor={interactiveLayerIds.length > 0 ? 'pointer' : 'grab'}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-left" />
        <FullscreenControl position="top-right" />

        {wardsData && showWards && (
          <Source
            id="wards"
            type="geojson"
            data={wardsData}
          >
            <Layer
              id="wards-fill"
              type="fill"
              paint={{
                'fill-color': '#f97316',
                'fill-opacity': 0.15
              }}
            />
            <Layer
              id="wards-line"
              type="line"
              paint={{
                'line-color': '#ea580c',
                'line-width': 1.5,
                'line-dasharray': [1, 1]
              }}
            />
            <Layer
              id="wards-label"
              type="symbol"
              layout={{
                'text-field': ['get', 'name'],
                'text-size': 10,
                'text-anchor': 'center',
                'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular']
              }}
              paint={{
                'text-color': '#c2410c',
                'text-halo-color': '#ffffff',
                'text-halo-width': 1.5
              }}
            />
          </Source>
        )}

        {subCountiesData && showSubCounties && (
          <Source
            id="sub-counties"
            type="geojson"
            data={subCountiesData}
          >
            <Layer
              id="sub-counties-fill"
              type="fill"
              paint={{
                'fill-color': '#8b5cf6',
                'fill-opacity': 0.1
              }}
            />
            <Layer
              id="sub-counties-line"
              type="line"
              paint={{
                'line-color': '#7c3aed',
                'line-width': 2
              }}
            />
            <Layer
              id="sub-counties-label"
              type="symbol"
              layout={{
                'text-field': ['get', 'name'],
                'text-size': 12,
                'text-anchor': 'center',
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
              }}
              paint={{
                'text-color': '#6d28d9',
                'text-halo-color': '#ffffff',
                'text-halo-width': 2
              }}
            />
          </Source>
        )}

        {tenantBoundary && showCountyBoundary && (
          <Source
            id="tenant-boundary"
            type="geojson"
            data={tenantBoundary}
          >
            <Layer
              id="tenant-boundary-fill"
              type="fill"
              paint={{
                'fill-color': '#3b82f6',
                'fill-opacity': 0.05
              }}
            />
            <Layer
              id="tenant-boundary-line"
              type="line"
              paint={{
                'line-color': '#1d4ed8',
                'line-width': 3
              }}
            />
            <Layer
              id="tenant-boundary-label"
              type="symbol"
              layout={{
                'text-field': ['get', 'name'],
                'text-size': 16,
                'text-anchor': 'center',
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
              }}
              paint={{
                'text-color': '#1e40af',
                'text-halo-color': '#ffffff',
                'text-halo-width': 2
              }}
            />
          </Source>
        )}

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="p-2 min-w-[180px]">
              <h4 className="font-semibold text-sm mb-1">{popupInfo.feature.properties.name}</h4>
              {popupInfo.layerType === 'sub_county' && (
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>Population: {popupInfo.feature.properties.population?.toLocaleString()}</p>
                  <p>Area: {popupInfo.feature.properties.area_km2?.toLocaleString()} km²</p>
                  <p>HQ: {popupInfo.feature.properties.headquarters}</p>
                </div>
              )}
              {popupInfo.layerType === 'ward' && (
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>Sub-county: {popupInfo.feature.properties.sub_county_name}</p>
                  <p>Population: {popupInfo.feature.properties.population?.toLocaleString()}</p>
                </div>
              )}
            </div>
          </Popup>
        )}

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

      <Card className="absolute top-4 left-4 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <CardContent className="p-4">
          {tenant && (
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{tenant.county} County</p>
                <p className="text-[10px] text-blue-500">{tenant.name}</p>
              </div>
            </div>
          )}
          
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

          <Collapsible open={adminLayersOpen} onOpenChange={setAdminLayersOpen} className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <CollapsibleTrigger className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">Administrative Boundaries</h4>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">{tenant?.county}</Badge>
              </div>
              <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${adminLayersOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="county-boundary"
                    className="text-xs cursor-pointer text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                  >
                    <MapPin className="w-3 h-3 text-blue-600" />
                    County Outline
                  </Label>
                  <Switch
                    id="county-boundary"
                    checked={showCountyBoundary}
                    onCheckedChange={setShowCountyBoundary}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="sub-counties"
                    className="text-xs cursor-pointer text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                  >
                    <Grid3X3 className="w-3 h-3 text-purple-600" />
                    Sub-Counties
                    {subCountiesData && <span className="text-[10px] text-gray-400">({subCountiesData.features.length})</span>}
                  </Label>
                  <Switch
                    id="sub-counties"
                    checked={showSubCounties}
                    onCheckedChange={setShowSubCounties}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="wards"
                    className="text-xs cursor-pointer text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                  >
                    <LayoutGrid className="w-3 h-3 text-orange-600" />
                    Wards
                    {wardsData && <span className="text-[10px] text-gray-400">({wardsData.features.length})</span>}
                  </Label>
                  <Switch
                    id="wards"
                    checked={showWards}
                    onCheckedChange={setShowWards}
                  />
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex gap-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                    <span className="w-2 h-2 rounded-sm bg-blue-600"></span>County
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                    <span className="w-2 h-2 rounded-sm bg-purple-600"></span>Sub-County
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                    <span className="w-2 h-2 rounded-sm bg-orange-500"></span>Ward
                  </span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
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
