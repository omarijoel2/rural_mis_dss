import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Map, { Source, Layer, NavigationControl, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, AlertTriangle, MapPin, Trash2, Users, CheckCircle, Play, RotateCcw, X, Loader2 } from 'lucide-react';
import { outagesAPI, schemesAPI } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

const stateColors: Record<string, string> = {
  draft: 'bg-gray-500',
  approved: 'bg-blue-500',
  live: 'bg-red-500',
  restored: 'bg-green-500',
  closed: 'bg-gray-600',
};

interface PolygonPoint {
  lat: number;
  lng: number;
}

export function OutagePlannerWithForm() {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [isDrawing, setIsDrawing] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<PolygonPoint[]>([]);
  const [impactStats, setImpactStats] = useState<{ customers: number; population: number } | null>(null);
  const [isCalculatingImpact, setIsCalculatingImpact] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    scheme_id: '',
    cause: 'planned',
    reason: '',
    scheduled_start: '',
    scheduled_end: '',
    isolation_plan: '',
    notes: '',
  });

  const { data: outages, refetch: refetchOutages } = useQuery({
    queryKey: ['outages'],
    queryFn: async () => {
      const laravel = await outagesAPI.list();
      if (laravel) return laravel;
      return {
        data: [
          { id: '1', scheme_id: '1', cause: 'planned', state: 'draft', reason: 'Pump maintenance', estimated_affected_population: 8900, scheduled_start: '2025-12-10T08:00:00Z', scheduled_end: '2025-12-10T16:00:00Z' },
          { id: '2', scheme_id: '1', cause: 'fault', state: 'live', reason: 'Power outage', estimated_affected_population: 4500, scheduled_start: '2025-12-08T10:00:00Z', scheduled_end: '2025-12-08T18:00:00Z' },
        ],
      };
    },
  });

  const { data: schemes } = useQuery({
    queryKey: ['schemes-for-outages'],
    queryFn: async () => {
      const laravel = await schemesAPI.list();
      if (laravel) return laravel;
      return {
        data: [
          { id: '1', name: 'Lodwar Water Supply Scheme' },
          { id: '2', name: 'Wajir Town Water Supply' },
        ],
      };
    },
  });

  const createOutageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await outagesAPI.create(data);
      if (!response) throw new Error('Failed to create outage');
      return response;
    },
    onSuccess: () => {
      toast.success('Outage planned successfully');
      refetchOutages();
      resetForm();
    },
    onError: () => {
      toast.error('Failed to plan outage');
    },
  });

  const updateOutageStateMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      const response = await fetch(`/api/v1/outages/${id}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Failed to ${action} outage`);
      return response.json();
    },
    onSuccess: (_, { action }) => {
      toast.success(`Outage ${action} successfully`);
      refetchOutages();
    },
    onError: (_, { action }) => {
      toast.error(`Failed to ${action} outage`);
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setPolygonPoints([]);
    setImpactStats(null);
    setFormData({
      scheme_id: '',
      cause: 'planned',
      reason: '',
      scheduled_start: '',
      scheduled_end: '',
      isolation_plan: '',
      notes: '',
    });
  };

  const handleMapClick = useCallback((event: any) => {
    if (!isDrawing) return;
    
    const { lngLat } = event;
    setPolygonPoints(prev => [...prev, { lat: lngLat.lat, lng: lngLat.lng }]);
  }, [isDrawing]);

  const startDrawing = () => {
    setPolygonPoints([]);
    setIsDrawing(true);
    setImpactStats(null);
    toast.info('Click on the map to draw the affected area polygon. Click "Finish Drawing" when done.');
  };

  const finishDrawing = () => {
    if (polygonPoints.length < 3) {
      toast.error('Please draw at least 3 points to create a polygon');
      return;
    }
    setIsDrawing(false);
    calculateImpact();
  };

  const calculatePolygonArea = (points: PolygonPoint[]): number => {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].lng * points[j].lat;
      area -= points[j].lng * points[i].lat;
    }
    return Math.abs(area / 2) * 111 * 111;
  };

  const calculateImpact = async () => {
    if (polygonPoints.length < 3) return;
    
    setIsCalculatingImpact(true);
    
    try {
      const response = await fetch('/api/v1/outages/impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          polygon: polygonPoints.map(p => [p.lng, p.lat]),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setImpactStats(data);
      } else {
        const areaKm2 = calculatePolygonArea(polygonPoints);
        const densityPerKm2 = 50;
        const customers = Math.floor(areaKm2 * densityPerKm2);
        const population = customers * 4;
        setImpactStats({ customers: Math.max(customers, 10), population: Math.max(population, 40) });
      }
    } catch {
      const areaKm2 = calculatePolygonArea(polygonPoints);
      const densityPerKm2 = 50;
      const customers = Math.floor(areaKm2 * densityPerKm2);
      const population = customers * 4;
      setImpactStats({ customers: Math.max(customers, 10), population: Math.max(population, 40) });
    } finally {
      setIsCalculatingImpact(false);
    }
  };

  const clearPolygon = () => {
    setPolygonPoints([]);
    setImpactStats(null);
    setIsDrawing(false);
  };

  const handleSubmit = () => {
    if (!formData.scheme_id || !formData.reason) {
      toast.error('Please fill in required fields');
      return;
    }

    if (polygonPoints.length < 3) {
      toast.error('Please draw the affected area polygon on the map (minimum 3 points)');
      return;
    }

    const polygonGeoJson = {
      type: 'Polygon',
      coordinates: [[...polygonPoints.map(p => [p.lng, p.lat]), [polygonPoints[0].lng, polygonPoints[0].lat]]],
    };

    createOutageMutation.mutate({
      ...formData,
      affected_geom: polygonGeoJson,
      estimated_affected_population: impactStats?.population,
      estimated_affected_customers: impactStats?.customers,
    });
  };

  const isFormValid = formData.scheme_id && formData.reason && polygonPoints.length >= 3;

  const polygonGeoJson = polygonPoints.length >= 3 ? {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[...polygonPoints.map(p => [p.lng, p.lat]), [polygonPoints[0].lng, polygonPoints[0].lat]]] as [number, number][][],
    },
    properties: {},
  } : null;

  const lineGeoJson = polygonPoints.length >= 2 ? {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: polygonPoints.map(p => [p.lng, p.lat]) as [number, number][],
    },
    properties: {},
  } : null;

  const causeOptions = [
    { value: 'planned', label: 'Planned Maintenance' },
    { value: 'fault', label: 'Equipment Fault' },
    { value: 'power', label: 'Power Outage' },
    { value: 'water_quality', label: 'Water Quality Issue' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="p-6 space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Outage Planner</h1>
          <p className="text-muted-foreground">Plan and manage service interruptions with polygon capture</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Plan Outage
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); else setShowForm(true); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plan Service Outage</DialogTitle>
            <DialogDescription>
              Define outage details and draw the affected area on the map
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Outage Details</TabsTrigger>
              <TabsTrigger value="map">Affected Area Map</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Scheme *</Label>
                  <Select value={formData.scheme_id} onValueChange={(v) => setFormData({ ...formData, scheme_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      {schemes?.data?.map((scheme: any) => (
                        <SelectItem key={scheme.id} value={String(scheme.id)}>
                          {scheme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cause *</Label>
                  <Select value={formData.cause} onValueChange={(v) => setFormData({ ...formData, cause: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {causeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason / Summary *</Label>
                <Input
                  placeholder="e.g., Scheduled pump maintenance"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Scheduled Start</Label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduled_start}
                    onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scheduled End</Label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduled_end}
                    onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Isolation Plan (Valves to close)</Label>
                <Textarea
                  placeholder="e.g., Close valves V-101, V-102, V-103"
                  value={formData.isolation_plan}
                  onChange={(e) => setFormData({ ...formData, isolation_plan: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional notes about the outage..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {impactStats && (
                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Estimated Impact</div>
                        <div className="text-lg font-bold">
                          {impactStats.customers.toLocaleString()} customers / {impactStats.population.toLocaleString()} population
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="map" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                {!isDrawing ? (
                  <Button onClick={startDrawing} variant="outline" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Draw Affected Area
                  </Button>
                ) : (
                  <>
                    <Button onClick={finishDrawing} variant="default" size="sm" disabled={polygonPoints.length < 3}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Finish Drawing ({polygonPoints.length} points)
                    </Button>
                    <Button onClick={clearPolygon} variant="destructive" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
                {polygonPoints.length > 0 && !isDrawing && (
                  <Button onClick={clearPolygon} variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Polygon
                  </Button>
                )}
              </div>

              <div className="h-[400px] rounded-lg overflow-hidden border">
                <Map
                  initialViewState={{
                    longitude: 35.5,
                    latitude: 3.5,
                    zoom: 6,
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                  onClick={handleMapClick}
                  cursor={isDrawing ? 'crosshair' : 'grab'}
                >
                  <NavigationControl position="top-right" />
                  
                  {polygonGeoJson && (
                    <Source id="polygon" type="geojson" data={polygonGeoJson}>
                      <Layer
                        id="polygon-fill"
                        type="fill"
                        paint={{
                          'fill-color': '#ef4444',
                          'fill-opacity': 0.3,
                        }}
                      />
                      <Layer
                        id="polygon-outline"
                        type="line"
                        paint={{
                          'line-color': '#ef4444',
                          'line-width': 2,
                        }}
                      />
                    </Source>
                  )}

                  {isDrawing && lineGeoJson && (
                    <Source id="drawing-line" type="geojson" data={lineGeoJson}>
                      <Layer
                        id="drawing-line-layer"
                        type="line"
                        paint={{
                          'line-color': '#3b82f6',
                          'line-width': 2,
                          'line-dasharray': [2, 2],
                        }}
                      />
                    </Source>
                  )}

                  {polygonPoints.map((point, index) => (
                    <Marker key={index} longitude={point.lng} latitude={point.lat}>
                      <div className={`w-3 h-3 rounded-full border-2 border-white ${isDrawing ? 'bg-blue-500' : 'bg-red-500'}`} />
                    </Marker>
                  ))}
                </Map>
              </div>

              {isDrawing && (
                <p className="text-sm text-muted-foreground">
                  Click on the map to add points. You need at least 3 points to create a polygon.
                </p>
              )}

              {isCalculatingImpact && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calculating impact...
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!isFormValid || createOutageMutation.isPending}
            >
              {createOutageMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Outage
            </Button>
            {!isFormValid && formData.scheme_id && formData.reason && (
              <p className="text-xs text-destructive">Draw an affected area polygon on the map tab first</p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4 space-y-4">
          {outages?.data?.map((outage: any) => (
            <Card key={outage.id} className="bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <AlertTriangle className="h-5 w-5" />
                      {outage.reason}
                    </CardTitle>
                    <CardDescription>
                      {schemes?.data?.find((s: any) => String(s.id) === String(outage.scheme_id))?.name || 'Unknown Scheme'}
                    </CardDescription>
                  </div>
                  <Badge className={stateColors[outage.state] || 'bg-gray-500'}>
                    {outage.state}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Cause</span>
                    <div className="font-semibold text-sm text-foreground capitalize">{outage.cause?.replace(/_/g, ' ')}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Affected Population</span>
                    <div className="font-semibold text-sm text-foreground">{(outage.estimated_affected_population ?? 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Scheduled Start</span>
                    <div className="font-semibold text-sm text-foreground">
                      {outage.scheduled_start ? format(new Date(outage.scheduled_start), 'PPp') : '-'}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Scheduled End</span>
                    <div className="font-semibold text-sm text-foreground">
                      {outage.scheduled_end ? format(new Date(outage.scheduled_end), 'PPp') : '-'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  {outage.state === 'draft' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={updateOutageStateMutation.isPending}
                      onClick={() => updateOutageStateMutation.mutate({ id: outage.id, action: 'approve' })}
                    >
                      {updateOutageStateMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                      Approve
                    </Button>
                  )}
                  {outage.state === 'approved' && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      disabled={updateOutageStateMutation.isPending}
                      onClick={() => updateOutageStateMutation.mutate({ id: outage.id, action: 'go-live' })}
                    >
                      {updateOutageStateMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
                      Go Live
                    </Button>
                  )}
                  {outage.state === 'live' && (
                    <Button 
                      size="sm" 
                      variant="default"
                      disabled={updateOutageStateMutation.isPending}
                      onClick={() => updateOutageStateMutation.mutate({ id: outage.id, action: 'restore' })}
                    >
                      {updateOutageStateMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-1" />}
                      Restore Service
                    </Button>
                  )}
                  {outage.state === 'restored' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={updateOutageStateMutation.isPending}
                      onClick={() => updateOutageStateMutation.mutate({ id: outage.id, action: 'close' })}
                    >
                      {updateOutageStateMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                      Close
                    </Button>
                  )}
                </div>

                {outage.notes && (
                  <div className="text-sm text-muted-foreground border-t pt-3">
                    {outage.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {(!outages?.data || outages.data.length === 0) && (
            <Card className="bg-card">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-4">No outages planned</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Plan First Outage
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <Card className="bg-card">
            <CardContent className="p-0">
              <div className="h-[600px]">
                <Map
                  initialViewState={{
                    longitude: 35.5,
                    latitude: 3.5,
                    zoom: 6,
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                >
                  <NavigationControl position="top-right" />
                </Map>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
