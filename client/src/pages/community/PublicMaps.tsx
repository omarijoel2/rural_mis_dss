import { useState, useCallback, useMemo, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Map, { Source, Layer, NavigationControl, ScaleControl, FullscreenControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Map as MapIcon, Layers, Download, Code, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface MapLayer {
  id: string;
  name: string;
  category: string;
  visible: boolean;
  color: string;
  description: string;
}

const BASEMAP_STYLES = [
  {
    id: 'positron',
    name: 'Light',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
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
  { id: 'coverage', name: 'Water Coverage Areas', category: 'Coverage', visible: true, color: '#22c55e', description: 'Active water supply scheme coverage zones' },
  { id: 'facilities', name: 'Water Facilities', category: 'Infrastructure', visible: true, color: '#3b82f6', description: 'Treatment plants, pump stations, reservoirs' },
  { id: 'kiosks', name: 'Water Kiosks', category: 'Infrastructure', visible: true, color: '#f59e0b', description: 'Community water point locations' },
  { id: 'pipelines', name: 'Water Pipelines', category: 'Network', visible: true, color: '#8b5cf6', description: 'Primary and secondary water distribution lines' },
  { id: 'meters', name: 'Service Connections', category: 'Network', visible: false, color: '#06b6d4', description: 'Individual household/business meters' },
  { id: 'complaints', name: 'Reported Issues', category: 'Community', visible: false, color: '#ef4444', description: 'Active grievances and reported problems' },
];

export function PublicMaps() {
  const [viewState, setViewState] = useState({ longitude: 36.8219, latitude: -1.2921, zoom: 8 });
  const [basemap, setBasemap] = useState(BASEMAP_STYLES[0].url);
  const [layers, setLayers] = useState(MAP_LAYERS);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [grmTickets, setGrmTickets] = useState<any[]>([]);
  const [showTicketsPanel, setShowTicketsPanel] = useState(false);

  // Lazy-loaded GeoJSON data per layer
  const [layerData, setLayerData] = useState<Record<string, any>>({});
  const [loadingLayers, setLoadingLayers] = useState<Record<string, boolean>>({});
  const [layerErrors, setLayerErrors] = useState<Record<string, string | null>>({});

  const getLayerEndpoint = (layerId: string) => {
    switch (layerId) {
      case 'coverage': return '/api/v1/gis/schemes/geojson';
      case 'facilities': return '/api/v1/gis/facilities/geojson';
      case 'kiosks': return '/api/v1/gis/facilities/geojson?kind=kiosk';
      case 'pipelines': return '/api/v1/gis/pipelines/geojson';
      case 'meters': return '/api/v1/meters?per_page=1000';
      case 'complaints': return '/api/crm/tickets?per_page=1000';
      default: return null;
    }
  };

  const loadLayer = async (layerId: string) => {
    if (loadingLayers[layerId] || layerData[layerId]) return;
    const endpoint = getLayerEndpoint(layerId);
    if (!endpoint) return;

    setLoadingLayers(prev => ({ ...prev, [layerId]: true }));
    setLayerErrors(prev => ({ ...prev, [layerId]: null }));

    try {
      const res: any = await apiClient.get(endpoint);
      let geojson = res?.data || res || null;

      // Convert meters list to GeoJSON if needed
      if (layerId === 'meters' && Array.isArray(geojson)) {
        geojson = {
          type: 'FeatureCollection',
          features: geojson.map((m: any) => ({
            type: 'Feature',
            properties: m,
            geometry: m.location || m.geom || null,
          })),
        };
      }

      setLayerData(prev => ({ ...prev, [layerId]: geojson }));
    } catch (err: any) {
      setLayerErrors(prev => ({ ...prev, [layerId]: err?.message || 'Failed to load' }));
      setLayerData(prev => ({ ...prev, [layerId]: null }));
    } finally {
      setLoadingLayers(prev => ({ ...prev, [layerId]: false }));
    }
  };

  // Load catalog, tickets and any initially visible layers
  useEffect(() => {
    apiClient.get('/api/open-data/catalog')
      .then((res: any) => setCatalog(res?.data || res || []))
      .catch(() => setCatalog([]));

    apiClient.get('/api/crm/tickets')
      .then((res: any) => setGrmTickets(res?.data || res || []))
      .catch(() => setGrmTickets([]));

    // Load visible layers initially
    layers.filter(l => l.visible).forEach(l => loadLayer(l.id));
  }, []);

  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => {
      return prev.map(l => {
        if (l.id === layerId) {
          const visible = !l.visible;
          if (visible) loadLayer(l.id);
          return { ...l, visible };
        }
        return l;
      });
    });
  }, []);

  const visibleCount = useMemo(() => layers.filter(l => l.visible).length, [layers]);
  const categories = useMemo(() => Array.from(new Set(layers.map(l => l.category))), []);

  const embedCode = useMemo(() => {
    const { longitude, latitude, zoom } = viewState;
    return `<iframe src="${window.location.origin}${window.location.pathname}?map=${longitude.toFixed(3)},${latitude.toFixed(3)},${zoom}" width="100%" height="600" frameborder="0" style="border:1px solid #ccc;"></iframe>`;
  }, [viewState]);

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Public Interactive Maps</h1>
          <p className="text-muted-foreground mt-1">Share water infrastructure, coverage, and service data through interactive maps</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visible Layers</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visibleCount}</div>
            <p className="text-xs text-muted-foreground">Of {layers.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Layers</CardTitle>
            <MapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">{categories.join(', ')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">542</div>
            <p className="text-xs text-muted-foreground">GeoJSON/CSV exports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Embeds</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Active on websites</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Interactive Map Viewer</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 relative">
                <Map 
                  initialViewState={viewState}
                  onMove={e => setViewState(e.viewState)}
                  mapStyle={basemap}
                >
                  <NavigationControl position="top-right" />
                  <ScaleControl />
                  <FullscreenControl position="top-right" />
                  
                  {/* GeoJSON layers (loaded lazily from server) */}
                  {layers.filter(l => l.visible).map(layer => (
                    <Source key={layer.id} id={layer.id + '-source'} type="geojson" data={layerData[layer.id] || { type: 'FeatureCollection', features: [] }}>
                      <Layer 
                        id={layer.id + '-layer'}
                        type="circle"
                        paint={{ 'circle-color': layer.color, 'circle-radius': 6 }}
                      />
                    </Source>
                  ))}
                </Map>
              </div>
            </CardContent>

            {/* Layer load statuses */}
            <div className="p-2 mt-2 text-xs flex flex-wrap gap-2">
              {layers.filter(l => l.visible).map(layer => {
                const loading = loadingLayers[layer.id];
                const err = layerErrors[layer.id];
                return (
                  <div key={layer.id} className={`px-2 py-1 rounded ${err ? 'bg-red-50 text-red-700' : loading ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                    {loading ? `Loading ${layer.name}…` : err ? `${layer.name} failed` : `${layer.name} loaded`}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          {/* Basemap Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Basemap Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {BASEMAP_STYLES.map(style => (
                <Button 
                  key={style.id}
                  variant={basemap === style.url ? 'default' : 'outline'}
                  onClick={() => setBasemap(style.url)}
                  className="w-full justify-start text-xs"
                >
                  {style.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Layer Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Layer Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.map(category => (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">{category}</h4>
                  <div className="space-y-2">
                    {layers.filter(l => l.category === category).map(layer => (
                      <div key={layer.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={layer.id}
                          checked={layer.visible}
                          onCheckedChange={() => toggleLayer(layer.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <Label htmlFor={layer.id} className="text-xs cursor-pointer">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: layer.color }} />
                              {layer.name}
                            </div>
                          </Label>
                          <p className="text-xs text-muted-foreground">{layer.description}</p>
                        </div>

                        {layer.id === 'complaints' && (
                          <div className="ml-2">
                            <Button size="xs" onClick={() => setShowTicketsPanel(prev => !prev)}>
                              {showTicketsPanel ? 'Hide' : `Load (${grmTickets.length})`}
                            </Button>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {showTicketsPanel && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold">Reported Issues (GRM)</h4>
                  <div className="max-h-48 overflow-auto mt-2 space-y-2">
                    {grmTickets.length === 0 ? (
                      <div className="text-xs text-muted-foreground">No tickets found</div>
                    ) : (
                      grmTickets.map((t: any) => (
                        <div key={t.id} className="p-2 bg-muted rounded text-xs">
                          <div className="font-medium">{t.ticketNumber || `#${t.id}`}</div>
                          <div className="text-muted-foreground">{t.category} • {t.status}</div>
                          <div className="mt-1">{t.details}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Embed & Export */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Share & Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Dialog open={embedOpen} onOpenChange={setEmbedOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-xs">
                    <Code className="h-3 w-3 mr-2" /> Generate Embed
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Embed Code</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Copy and paste this code to embed the map on your website:</p>
                    <div className="bg-muted p-3 rounded font-mono text-xs overflow-auto max-h-32 break-all">
                      {embedCode}
                    </div>
                    <Button 
                      onClick={copyEmbed}
                      className="w-full"
                      variant={copied ? 'default' : 'outline'}
                    >
                      {copied ? (
                        <>✓ Copied to clipboard</>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-2" /> Copy Embed Code
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full justify-start text-xs">
                <Download className="h-3 w-3 mr-2" /> Download GeoJSON
              </Button>

              <Button variant="outline" className="w-full justify-start text-xs">
                <Download className="h-3 w-3 mr-2" /> Download CSV
              </Button>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {layers.map(layer => (
                <div key={layer.id} className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: layer.color }} />
                  <span>{layer.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
