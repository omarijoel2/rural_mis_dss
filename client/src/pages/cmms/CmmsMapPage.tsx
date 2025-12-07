import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { assetService } from '../../services/asset.service';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { MapPin, X, Edit, Wrench, Settings } from 'lucide-react';
import type { Asset } from '../../types/cmms';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  inactive: '#9ca3af',
  retired: '#ef4444',
  under_maintenance: '#eab308',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  retired: 'Retired',
  under_maintenance: 'Under Maintenance',
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
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { tenant } = useAuth();

  const countyName = tenant?.name || tenant?.county || '';
  const countyConfig = COUNTY_BOUNDS[countyName] || DEFAULT_BOUNDS;

  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets-with-geom'],
    queryFn: () => assetService.getAssets({ per_page: 1000 }),
  });

  const createPopupContent = useCallback((asset: Asset) => {
    return `
      <div style="min-width: 180px; font-family: system-ui, sans-serif;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${asset.name}</div>
        <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${asset.code}</div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${STATUS_COLORS[asset.status] || '#9ca3af'};"></span>
          <span>${STATUS_LABELS[asset.status] || asset.status}</span>
        </div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
          ${asset.asset_class?.name || 'Unknown class'}
        </div>
      </div>
    `;
  }, []);

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
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      popupRef.current?.remove();
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
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = STATUS_COLORS[asset.status] || '#9ca3af';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.15s ease';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(asset.geom.coordinates as [number, number])
        .addTo(map.current!);

      markersRef.current.push(marker);

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
        
        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 15,
        })
          .setLngLat(asset.geom!.coordinates as [number, number])
          .setHTML(createPopupContent(asset))
          .addTo(map.current!);
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        popupRef.current?.remove();
      });

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
  }, [assets, createPopupContent]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'retired': return 'bg-red-100 text-red-800';
      case 'under_maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative h-[calc(100vh-8rem)]">
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Assets Map
            </h2>
            {countyName && (
              <p className="text-sm text-muted-foreground mb-3">{countyName} County</p>
            )}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">Asset Status</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: STATUS_COLORS.active }} />
                <span className="text-sm">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: STATUS_COLORS.inactive }} />
                <span className="text-sm">Inactive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: STATUS_COLORS.under_maintenance }} />
                <span className="text-sm">Under Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: STATUS_COLORS.retired }} />
                <span className="text-sm">Retired</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm font-medium">
                {assets?.data.filter((a: Asset) => a.geom).length || 0} assets with location
              </p>
              <p className="text-xs text-muted-foreground">
                {(assets?.data.length || 0) - (assets?.data.filter((a: Asset) => a.geom).length || 0)} without location
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedAsset && (
        <div className="absolute top-4 right-4 z-10 w-80">
          <Card className="bg-white/95 backdrop-blur-sm">
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
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={getStatusBadgeClass(selectedAsset.status)}>
                    {STATUS_LABELS[selectedAsset.status] || selectedAsset.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Asset Class</span>
                  <span className="text-sm font-medium">{selectedAsset.asset_class?.name || 'Unknown'}</span>
                </div>
                
                {selectedAsset.manufacturer && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Manufacturer</span>
                    <span className="text-sm">{selectedAsset.manufacturer}</span>
                  </div>
                )}
                
                {selectedAsset.model && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Model</span>
                    <span className="text-sm">{selectedAsset.model}</span>
                  </div>
                )}
                
                {selectedAsset.install_date && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Install Date</span>
                    <span className="text-sm">{new Date(selectedAsset.install_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                {selectedAsset.geom && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Coordinates</span>
                    <span className="text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedAsset.geom.coordinates[1].toFixed(4)}, {selectedAsset.geom.coordinates[0].toFixed(4)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t space-y-2">
                <Link to={`/core/assets/${selectedAsset.id}`}>
                  <Button className="w-full" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    View / Edit Asset
                  </Button>
                </Link>
                <Link to={`/cmms/work-orders?asset_id=${selectedAsset.id}`}>
                  <Button variant="outline" className="w-full" size="sm">
                    <Wrench className="h-4 w-4 mr-2" />
                    View Work Orders
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading assets...</p>
          </div>
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
