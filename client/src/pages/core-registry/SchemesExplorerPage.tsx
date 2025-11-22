import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Map, { Source, Layer, NavigationControl, ScaleControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { schemeService } from '../../services/scheme.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Download, Search, Map as MapIcon, Table as TableIcon } from 'lucide-react';
import { ImportGeoJSONDialog } from '../../components/gis/ImportGeoJSONDialog';

type ViewMode = 'map' | 'table';

interface Scheme {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
  population_estimate?: number;
  geom?: any;
}

export function SchemesExplorerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const [page, setPage] = useState(1);

  const { data: schemesData, isLoading, error, refetch } = useQuery({
    queryKey: ['schemes', page, searchQuery, statusFilter, typeFilter],
    queryFn: () => schemeService.getAll({ 
      page,
      per_page: 15,
      q: searchQuery || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
    }),
  });

  const { data: geoJsonData } = useQuery({
    queryKey: ['schemes-geojson', statusFilter],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/gis/schemes/geojson${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch GeoJSON');
      return response.json();
    },
    enabled: viewMode === 'map',
  });

  const handleExport = async () => {
    try {
      const response = await fetch('/api/v1/gis/schemes/export', {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `schemes-${new Date().toISOString().split('T')[0]}.geojson`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const onMapClick = useCallback((event: any) => {
    const feature = event.features && event.features[0];
    if (feature) {
      setPopupInfo({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        feature: feature.properties,
      });
      
      const schemeFromFeature: Scheme = {
        id: feature.properties.id,
        code: feature.properties.code,
        name: feature.properties.name,
        type: feature.properties.type,
        status: feature.properties.status,
        population_estimate: feature.properties.population_estimate,
      };
      setSelectedScheme(schemeFromFeature);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'planning': return 'bg-blue-500';
      case 'decommissioned': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">Schemes Explorer</h1>
            <p className="text-muted-foreground">Water supply schemes registry with spatial visualization</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export GeoJSON
            </Button>
            <ImportGeoJSONDialog onImportComplete={() => refetch()} />
            <Button>Create Scheme</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="w-48">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="decommissioned">Decommissioned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <label className="text-sm font-medium mb-2 block">Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="urban">Urban</SelectItem>
                <SelectItem value="rural">Rural</SelectItem>
                <SelectItem value="peri-urban">Peri-Urban</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading && !schemesData ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-muted-foreground">Loading schemes...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-lg text-red-600 mb-2">Error loading schemes</p>
              <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          </div>
        ) : viewMode === 'map' ? (
          <Map
            initialViewState={{
              longitude: 36.8219,
              latitude: -1.2921,
              zoom: 8
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            interactiveLayerIds={['schemes-fill']}
            onClick={onMapClick}
          >
            <NavigationControl position="top-right" />
            <ScaleControl />

            {geoJsonData && (
              <Source
                id="schemes"
                type="geojson"
                data={geoJsonData}
              >
                <Layer
                  id="schemes-fill"
                  type="fill"
                  paint={{
                    'fill-color': [
                      'match',
                      ['get', 'status'],
                      'active', '#22c55e',
                      'planning', '#3b82f6',
                      'decommissioned', '#94a3b8',
                      '#6b7280'
                    ],
                    'fill-opacity': 0.6,
                  }}
                />
                <Layer
                  id="schemes-outline"
                  type="line"
                  paint={{
                    'line-color': '#000000',
                    'line-width': 1,
                  }}
                />
              </Source>
            )}

            {popupInfo && (
              <Popup
                longitude={popupInfo.longitude}
                latitude={popupInfo.latitude}
                closeOnClick={false}
                onClose={() => setPopupInfo(null)}
              >
                <div className="p-2">
                  <h3 className="font-semibold">{popupInfo.feature.name}</h3>
                  <p className="text-sm text-muted-foreground">Code: {popupInfo.feature.code}</p>
                  <Badge className={`mt-2 ${getStatusColor(popupInfo.feature.status)}`}>
                    {popupInfo.feature.status}
                  </Badge>
                </div>
              </Popup>
            )}
          </Map>
        ) : (
          <div className="p-4 h-full overflow-auto">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Population</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schemesData?.data.map((scheme: Scheme) => (
                      <TableRow 
                        key={scheme.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedScheme(scheme)}
                      >
                        <TableCell className="font-mono">{scheme.code}</TableCell>
                        <TableCell className="font-medium">{scheme.name}</TableCell>
                        <TableCell className="capitalize">{scheme.type}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(scheme.status)}>
                            {scheme.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {scheme.population_estimate?.toLocaleString() || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {schemesData && schemesData.last_page > 1 && (
                  <div className="flex justify-between items-center p-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {((schemesData.current_page - 1) * schemesData.per_page) + 1} to {Math.min(schemesData.current_page * schemesData.per_page, schemesData.total)} of {schemesData.total} schemes
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= schemesData.last_page}
                        onClick={() => setPage(p => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Side Drawer */}
      <Sheet open={!!selectedScheme} onOpenChange={(open) => !open && setSelectedScheme(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{selectedScheme?.name}</SheetTitle>
            <SheetDescription>Code: {selectedScheme?.code}</SheetDescription>
          </SheetHeader>
          
          {selectedScheme && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-lg capitalize">{selectedScheme.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedScheme.status)}>
                      {selectedScheme.status}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Population Served</label>
                  <p className="text-lg">{selectedScheme.population_estimate?.toLocaleString() || 'Not specified'}</p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-semibold">Quick Actions</h3>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start">View Assets</Button>
                  <Button variant="outline" className="justify-start">View DMAs</Button>
                  <Button variant="outline" className="justify-start">View Facilities</Button>
                  <Button variant="outline" className="justify-start">Network Topology</Button>
                  <Button variant="outline" className="justify-start">Edit Details</Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
