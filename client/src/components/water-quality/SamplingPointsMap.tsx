import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, MapPin } from 'lucide-react';

interface SamplingPoint {
  id: number;
  name: string;
  code: string;
  kind: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  elevation_m?: number;
  is_active: boolean;
  scheme?: any;
}

interface SamplingPointsMapProps {
  points: SamplingPoint[];
  onPointSelect?: (point: SamplingPoint | null) => void;
}

const KIND_COLORS = {
  source: '#3b82f6',
  treatment: '#8b5cf6',
  reservoir: '#10b981',
  distribution: '#eab308',
  kiosk: '#f97316',
  household: '#ec4899',
};

export function SamplingPointsMap({ points, onPointSelect }: SamplingPointsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<SamplingPoint | null>(null);

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
      center: [36.8219, -1.2921],
      zoom: 8,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    return () => {
      markers.current.forEach(m => m.remove());
      markers.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !points?.length) return;

    markers.current.forEach(m => m.remove());
    markers.current = [];

    const validPoints = points.filter((p) => p.location?.coordinates);

    if (validPoints.length === 0) return;

    validPoints.forEach((point) => {
      if (!point.location?.coordinates) return;

      const el = document.createElement('div');
      el.className = 'sampling-point-marker';
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = KIND_COLORS[point.kind as keyof typeof KIND_COLORS] || '#6b7280';
      el.style.border = point.is_active ? '3px solid white' : '3px solid #ef4444';
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.opacity = point.is_active ? '1' : '0.6';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(point.location.coordinates as [number, number])
        .addTo(map.current!);

      markers.current.push(marker);

      el.addEventListener('click', () => {
        setSelectedPoint(point);
        onPointSelect?.(point);
        map.current?.flyTo({
          center: point.location.coordinates as [number, number],
          zoom: 14,
          duration: 1000,
        });
      });
    });

    if (validPoints.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      validPoints.forEach((point) => {
        if (point.location?.coordinates) {
          bounds.extend(point.location.coordinates as [number, number]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [points, onPointSelect]);

  const handleClosePanel = () => {
    setSelectedPoint(null);
    onPointSelect?.(null);
  };

  return (
    <div className="relative h-96 w-full">
      <div className="absolute top-4 left-4 z-10">
        <Card className="max-w-xs">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold mb-3">Sampling Point Types</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(KIND_COLORS).map(([kind, color]) => (
                <div key={kind} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color, border: '2px solid white' }} />
                  <span className="text-xs capitalize">{kind}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-gray-400" style={{ border: '2px solid white' }} />
                <span className="text-xs">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-400 opacity-60" style={{ border: '2px solid #ef4444' }} />
                <span className="text-xs">Inactive</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedPoint && (
        <div className="absolute top-4 right-4 z-10 w-80">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{selectedPoint.name}</h3>
                    <Badge variant={selectedPoint.is_active ? 'default' : 'destructive'} className="text-xs">
                      {selectedPoint.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Code: {selectedPoint.code}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClosePanel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className="capitalize" variant="outline">
                    {selectedPoint.kind}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {selectedPoint.location.coordinates[1].toFixed(6)}, {selectedPoint.location.coordinates[0].toFixed(6)}
                  </span>
                </div>

                {selectedPoint.elevation_m && (
                  <div className="text-muted-foreground">
                    <span className="font-medium">Elevation:</span> {selectedPoint.elevation_m}m
                  </div>
                )}

                {selectedPoint.scheme && (
                  <div className="text-muted-foreground">
                    <span className="font-medium">Scheme:</span> {selectedPoint.scheme.name}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div ref={mapContainer} className="h-full w-full rounded-lg" />
    </div>
  );
}
