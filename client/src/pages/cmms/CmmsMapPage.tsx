import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { assetService } from '../../services/asset.service';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { MapPin, X } from 'lucide-react';
import type { Asset } from '../../types/cmms';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  inactive: '#9ca3af',
  retired: '#ef4444',
  under_maintenance: '#eab308',
};

const COUNTY_BOUNDS: Record<string, { center: [number, number]; zoom: number; bounds: [[number, number], [number, number]] }> = {
  Turkana: {
    center: [35.5, 3.5],
    zoom: 7,
    bounds: [[34.0, 1.5], [36.5, 5.5]],
  },
  Wajir: {
    center: [40.0, 1.5],
    zoom: 7,
    bounds: [[39.0, 0.5], [41.5, 3.0]],
  },
  Marsabit: {
    center: [37.5, 2.5],
    zoom: 7,
    bounds: [[36.5, 1.5], [39.0, 4.5]],
  },
  Mandera: {
    center: [40.5, 3.5],
    zoom: 7,
    bounds: [[39.5, 2.5], [41.5, 4.5]],
  },
  Garissa: {
    center: [39.5, -0.5],
    zoom: 7,
    bounds: [[38.5, -2.0], [41.0, 1.5]],
  },
};

const DEFAULT_BOUNDS = {
  center: [37.5, 1.0] as [number, number],
  zoom: 6,
  bounds: [[34.0, -2.0], [42.0, 5.5]] as [[number, number], [number, number]],
};

export function CmmsMapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { tenant } = useAuth();

  const countyName = tenant?.name || tenant?.county || '';
  const countyConfig = COUNTY_BOUNDS[countyName] || DEFAULT_BOUNDS;

  const { data: assets } = useQuery({
    queryKey: ['assets-with-geom'],
    queryFn: () => assetService.getAssets({ per_page: 1000 }),
  });

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: countyConfig.center,
      zoom: countyConfig.zoom,
      maxBounds: countyConfig.bounds,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, [countyConfig]);

  useEffect(() => {
    if (!map.current || !assets?.data) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const assetsWithGeom = assets.data.filter((a: Asset) => a.geom);

    if (assetsWithGeom.length === 0) return;

    assetsWithGeom.forEach((asset: Asset) => {
      if (!asset.geom) return;

      const el = document.createElement('div');
      el.className = 'asset-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = STATUS_COLORS[asset.status] || '#9ca3af';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(asset.geom.coordinates as [number, number])
        .addTo(map.current!);

      markersRef.current.push(marker);

      el.addEventListener('click', () => {
        setSelectedAsset(asset);
        map.current?.flyTo({
          center: asset.geom!.coordinates as [number, number],
          zoom: 14,
          duration: 1000,
        });
      });
    });

    if (assetsWithGeom.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      assetsWithGeom.forEach((asset: Asset) => {
        if (asset.geom) {
          bounds.extend(asset.geom.coordinates as [number, number]);
        }
      });
      
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, { 
          padding: 50,
          maxZoom: 12,
        });
      }
    }
  }, [assets]);

  return (
    <div className="relative h-[calc(100vh-8rem)]">
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-bold mb-1">Assets Map</h2>
            {countyName && (
              <p className="text-sm text-muted-foreground mb-3">{countyName} County</p>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: STATUS_COLORS.active }} />
                <span className="text-sm">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: STATUS_COLORS.inactive }} />
                <span className="text-sm">Inactive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: STATUS_COLORS.under_maintenance }} />
                <span className="text-sm">Under Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: STATUS_COLORS.retired }} />
                <span className="text-sm">Retired</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {assets?.data.filter((a: Asset) => a.geom).length || 0} assets with location data
            </p>
          </CardContent>
        </Card>
      </div>

      {selectedAsset && (
        <div className="absolute top-4 right-4 z-10 w-80">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold">{selectedAsset.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAsset.code}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={`bg-${selectedAsset.status === 'active' ? 'green' : selectedAsset.status === 'retired' ? 'red' : 'gray'}-100 text-${selectedAsset.status === 'active' ? 'green' : selectedAsset.status === 'retired' ? 'red' : 'gray'}-800`}>
                    {selectedAsset.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Asset Class</p>
                  <p className="text-sm font-medium">{selectedAsset.asset_class?.name || 'Unknown'}</p>
                </div>
                {selectedAsset.manufacturer && (
                  <div>
                    <p className="text-xs text-muted-foreground">Manufacturer</p>
                    <p className="text-sm">{selectedAsset.manufacturer}</p>
                  </div>
                )}
                {selectedAsset.model && (
                  <div>
                    <p className="text-xs text-muted-foreground">Model</p>
                    <p className="text-sm">{selectedAsset.model}</p>
                  </div>
                )}
                {selectedAsset.geom && (
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedAsset.geom.coordinates[1].toFixed(6)}, {selectedAsset.geom.coordinates[0].toFixed(6)}
                    </p>
                  </div>
                )}
                <Button className="w-full mt-3" size="sm" asChild>
                  <a href={`/cmms/assets/${selectedAsset.id}`}>View Details</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
