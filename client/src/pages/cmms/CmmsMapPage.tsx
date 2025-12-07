import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Map, { Marker, Popup, NavigationControl, ScaleControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { assetService } from '../../services/asset.service';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { MapPin, X, Edit, Wrench, Settings, Gauge, Database, Droplets, CircleDot } from 'lucide-react';
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

const ASSET_CLASS_MARKERS: Record<string, { shape: string; label: string }> = {
  'Pumps': { shape: 'circle', label: 'P' },
  'Valves': { shape: 'diamond', label: 'V' },
  'Pressure Reducing Valves': { shape: 'diamond', label: 'PRV' },
  'Flow Meters': { shape: 'square', label: 'M' },
  'Electromagnetic Flow Meter': { shape: 'square', label: 'EM' },
  'Reservoirs & Tanks': { shape: 'hexagon', label: 'T' },
  'Chlorinators': { shape: 'triangle', label: 'C' },
  'Data Logger / RTU': { shape: 'octagon', label: 'DL' },
  'Borehole / Well': { shape: 'circle-dot', label: 'BH' },
  'Water Kiosk': { shape: 'house', label: 'K' },
  'Unknown': { shape: 'circle', label: '?' },
};

const COUNTY_BOUNDS: Record<string, { center: [number, number]; zoom: number }> = {
  Turkana: { center: [35.5, 3.5], zoom: 7 },
  Wajir: { center: [40.0, 1.5], zoom: 7 },
  Marsabit: { center: [37.5, 2.5], zoom: 7 },
  Mandera: { center: [40.5, 3.5], zoom: 7 },
  Garissa: { center: [39.5, -0.5], zoom: 7 },
};

const DEFAULT_BOUNDS = { center: [37.5, 1.0] as [number, number], zoom: 6 };

function AssetMarker({ 
  asset, 
  isSelected, 
  onClick, 
  onHover 
}: { 
  asset: Asset; 
  isSelected: boolean;
  onClick: () => void;
  onHover: (hovering: boolean) => void;
}) {
  const className = asset.asset_class?.name || 'Unknown';
  const status = asset.status || 'inactive';
  const color = STATUS_COLORS[status] || STATUS_COLORS.inactive;
  const markerInfo = ASSET_CLASS_MARKERS[className] || ASSET_CLASS_MARKERS.Unknown;
  const size = isSelected ? 32 : 26;
  
  const getMarkerShape = () => {
    switch (markerInfo.shape) {
      case 'circle':
        return (
          <div 
            className="flex items-center justify-center"
            style={{ 
              width: size, 
              height: size,
              backgroundColor: color,
              borderRadius: '50%',
              border: '3px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-white text-[10px] font-bold">{markerInfo.label}</span>
          </div>
        );
      case 'diamond':
        return (
          <div 
            className="flex items-center justify-center"
            style={{ 
              width: size * 0.85, 
              height: size * 0.85,
              backgroundColor: color,
              borderRadius: '4px',
              transform: 'rotate(45deg)',
              border: '3px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-white text-[9px] font-bold" style={{ transform: 'rotate(-45deg)' }}>{markerInfo.label}</span>
          </div>
        );
      case 'square':
        return (
          <div 
            className="flex items-center justify-center"
            style={{ 
              width: size, 
              height: size,
              backgroundColor: color,
              borderRadius: '4px',
              border: '3px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-white text-[10px] font-bold">{markerInfo.label}</span>
          </div>
        );
      case 'hexagon':
        return (
          <div 
            className="flex items-center justify-center"
            style={{ 
              width: size * 1.1, 
              height: size,
              backgroundColor: color,
              borderRadius: '6px',
              border: '3px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-white text-[10px] font-bold">{markerInfo.label}</span>
          </div>
        );
      case 'triangle':
        return (
          <div 
            className="flex items-center justify-center"
            style={{ 
              width: 0,
              height: 0,
              borderLeft: `${size/2}px solid transparent`,
              borderRight: `${size/2}px solid transparent`,
              borderBottom: `${size}px solid ${color}`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          />
        );
      case 'circle-dot':
        return (
          <div 
            className="flex items-center justify-center"
            style={{ 
              width: size, 
              height: size,
              backgroundColor: color,
              borderRadius: '50%',
              border: '3px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        );
      case 'house':
        return (
          <div 
            className="flex flex-col items-center"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          >
            <div style={{ 
              width: 0, height: 0, 
              borderLeft: `${size/2}px solid transparent`, 
              borderRight: `${size/2}px solid transparent`, 
              borderBottom: `${size/2}px solid ${color}` 
            }} />
            <div 
              style={{ 
                width: size * 0.8, 
                height: size * 0.6,
                backgroundColor: color,
                marginTop: '-1px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="text-white text-[9px] font-bold">{markerInfo.label}</span>
            </div>
          </div>
        );
      case 'octagon':
        return (
          <div 
            className="flex items-center justify-center"
            style={{ 
              width: size, 
              height: size,
              backgroundColor: color,
              borderRadius: '30%',
              border: '3px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-white text-[8px] font-bold">{markerInfo.label}</span>
          </div>
        );
      default:
        return (
          <div 
            className="flex items-center justify-center"
            style={{ 
              width: size, 
              height: size,
              backgroundColor: color,
              borderRadius: '50%',
              border: '3px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <Settings className="h-3 w-3 text-white" />
          </div>
        );
    }
  };

  if (!asset.geom) return null;

  return (
    <Marker
      longitude={asset.geom.coordinates[0]}
      latitude={asset.geom.coordinates[1]}
      anchor="center"
    >
      <div 
        className="cursor-pointer hover:scale-110 transition-transform"
        onClick={onClick}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        {getMarkerShape()}
      </div>
    </Marker>
  );
}

export function CmmsMapPage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null);
  const { tenant } = useAuth();

  const countyName = tenant?.name || tenant?.county || '';
  const countyConfig = COUNTY_BOUNDS[countyName] || DEFAULT_BOUNDS;

  const [viewState, setViewState] = useState({
    longitude: countyConfig.center[0],
    latitude: countyConfig.center[1],
    zoom: countyConfig.zoom,
  });

  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets-with-geom'],
    queryFn: () => assetService.getAssets({ per_page: 1000 }),
  });

  const assetsWithGeom = useMemo(() => {
    return assets?.data?.filter((a: Asset) => a.geom) || [];
  }, [assets]);

  const assetClasses = useMemo(() => {
    const classes = new Set<string>();
    assetsWithGeom.forEach((a: Asset) => {
      classes.add(a.asset_class?.name || 'Unknown');
    });
    return Array.from(classes).sort();
  }, [assetsWithGeom]);

  useEffect(() => {
    if (assetsWithGeom.length > 0) {
      const lngs = assetsWithGeom.map((a: Asset) => a.geom!.coordinates[0]);
      const lats = assetsWithGeom.map((a: Asset) => a.geom!.coordinates[1]);
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      
      setViewState(prev => ({
        ...prev,
        longitude: centerLng,
        latitude: centerLat,
        zoom: 10,
      }));
    }
  }, [assetsWithGeom]);

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
      <div className="absolute top-4 left-4 z-10">
        <Card className="bg-white/95 backdrop-blur-sm max-w-[220px]">
          <CardContent className="p-3">
            <h2 className="text-sm font-bold mb-1 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Assets Map
            </h2>
            {countyName && (
              <p className="text-xs text-muted-foreground mb-2">{countyName} County</p>
            )}
            
            <p className="text-xs font-semibold text-muted-foreground mb-1.5 border-b pb-1">Asset Types</p>
            <div className="space-y-1 mb-3 max-h-[140px] overflow-y-auto">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
                  <span className="text-white text-[7px] font-bold">P</span>
                </div>
                <span className="text-xs">Pumps</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-gray-400 flex items-center justify-center" style={{ transform: 'rotate(45deg)' }}>
                  <span className="text-white text-[6px] font-bold" style={{ transform: 'rotate(-45deg)' }}>V</span>
                </div>
                <span className="text-xs">Valves</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-400 flex items-center justify-center">
                  <span className="text-white text-[7px] font-bold">M</span>
                </div>
                <span className="text-xs">Flow Meters</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-4 rounded-md bg-gray-400 flex items-center justify-center">
                  <span className="text-white text-[7px] font-bold">T</span>
                </div>
                <span className="text-xs">Reservoirs & Tanks</span>
              </div>
              <div className="flex items-center gap-2">
                <div style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '12px solid #9ca3af' }} />
                <span className="text-xs">Chlorinators</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
                <span className="text-xs">Borehole / Well</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid #9ca3af' }} />
                  <div className="w-3 h-2 bg-gray-400 -mt-px flex items-center justify-center">
                    <span className="text-white text-[5px] font-bold">K</span>
                  </div>
                </div>
                <span className="text-xs">Water Kiosk</span>
              </div>
            </div>
            
            <p className="text-xs font-semibold text-muted-foreground mb-1.5 border-b pb-1">Status Colors</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.active }} />
                <span className="text-xs">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.inactive }} />
                <span className="text-xs">Inactive</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.under_maintenance }} />
                <span className="text-xs">Under Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.retired }} />
                <span className="text-xs">Retired</span>
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs font-medium">
                {assetsWithGeom.length} assets on map
              </p>
              <p className="text-[10px] text-muted-foreground">
                {(assets?.data?.length || 0) - assetsWithGeom.length} without location
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

      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-left" />

        {assetsWithGeom.map((asset: Asset) => (
          <AssetMarker
            key={asset.id}
            asset={asset}
            isSelected={selectedAsset?.id === asset.id}
            onClick={() => setSelectedAsset(asset)}
            onHover={(hovering) => setHoveredAsset(hovering ? asset : null)}
          />
        ))}

        {hoveredAsset && !selectedAsset && hoveredAsset.geom && (
          <Popup
            longitude={hoveredAsset.geom.coordinates[0]}
            latitude={hoveredAsset.geom.coordinates[1]}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={15}
          >
            <div className="p-1 min-w-[150px]">
              <p className="font-semibold text-sm">{hoveredAsset.name}</p>
              <p className="text-xs text-muted-foreground">{hoveredAsset.code}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs">{hoveredAsset.asset_class?.name || 'Unknown'}</span>
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: STATUS_COLORS[hoveredAsset.status] || STATUS_COLORS.inactive }}
                />
                <span className="text-xs">{STATUS_LABELS[hoveredAsset.status] || hoveredAsset.status}</span>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
