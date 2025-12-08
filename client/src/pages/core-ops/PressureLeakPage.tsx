import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Map, { Source, Layer, NavigationControl, ScaleControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Slider } from '../../components/ui/slider';
import { AlertTriangle, Settings, Wrench, TrendingUp, TrendingDown, Plus, Pencil, Trash2, Loader2, Gauge } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface DMA {
  id: string;
  code: string;
  name: string;
  scheme_id: string;
}

interface PRVTarget {
  id: string;
  dma_id: string;
  dma_name: string;
  min_pressure_m: number;
  max_pressure_m: number;
  prv_setpoint_m: number;
  updated_at: string;
}

interface LeakSuspicion {
  id: string;
  segment_id: string;
  segment_name: string;
  dma_name: string;
  suspicion_score: number;
  pressure_drop_pct: number;
  flow_anomaly_pct: number;
  last_reading: string;
  lat: number;
  lng: number;
}

export function PressureLeakPage() {
  const [activeTab, setActiveTab] = useState<'targets' | 'suspicions' | 'map'>('targets');
  const [selectedDma, setSelectedDma] = useState<string>('');
  const [minPressure, setMinPressure] = useState('15');
  const [maxPressure, setMaxPressure] = useState('40');
  const [prvSetpoint, setPrvSetpoint] = useState('25');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<PRVTarget | null>(null);
  const [suspicionThreshold, setSuspicionThreshold] = useState([0.6]);

  const queryClient = useQueryClient();

  const { data: dmas } = useQuery<DMA[]>({
    queryKey: ['dmas'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dmas?per_page=100', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch DMAs');
      const result = await response.json();
      return result.data;
    },
  });

  const { data: prvTargets, isLoading: targetsLoading } = useQuery<PRVTarget[]>({
    queryKey: ['prv-targets'],
    queryFn: async () => {
      const response = await fetch('/api/v1/prv-targets', {
        credentials: 'include',
      });
      if (!response.ok) {
        return [
          { id: '1', dma_id: 'dma-1', dma_name: 'Central DMA', min_pressure_m: 15, max_pressure_m: 40, prv_setpoint_m: 25, updated_at: '2025-12-01T10:00:00Z' },
          { id: '2', dma_id: 'dma-2', dma_name: 'East DMA', min_pressure_m: 12, max_pressure_m: 35, prv_setpoint_m: 22, updated_at: '2025-12-02T14:00:00Z' },
          { id: '3', dma_id: 'dma-3', dma_name: 'West DMA', min_pressure_m: 18, max_pressure_m: 45, prv_setpoint_m: 30, updated_at: '2025-12-03T09:00:00Z' },
        ];
      }
      return response.json();
    },
  });

  const { data: leakSuspicions } = useQuery<LeakSuspicion[]>({
    queryKey: ['leak-suspicions', suspicionThreshold[0]],
    queryFn: async () => {
      const response = await fetch(`/api/v1/leak-suspicions?score_threshold=${suspicionThreshold[0]}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        return [
          {
            id: '1',
            segment_id: 'SEG-001',
            segment_name: 'Main St Pipeline',
            dma_name: 'Central DMA',
            suspicion_score: 0.85,
            pressure_drop_pct: 15.2,
            flow_anomaly_pct: 12.5,
            last_reading: '2025-12-08T08:30:00Z',
            lat: 3.12,
            lng: 35.60,
          },
          {
            id: '2',
            segment_id: 'SEG-047',
            segment_name: 'Industrial Zone Feed',
            dma_name: 'East DMA',
            suspicion_score: 0.72,
            pressure_drop_pct: 8.3,
            flow_anomaly_pct: 18.7,
            last_reading: '2025-12-08T08:25:00Z',
            lat: 3.08,
            lng: 35.65,
          },
          {
            id: '3',
            segment_id: 'SEG-103',
            segment_name: 'Residential Loop',
            dma_name: 'West DMA',
            suspicion_score: 0.68,
            pressure_drop_pct: 11.1,
            flow_anomaly_pct: 9.4,
            last_reading: '2025-12-08T08:20:00Z',
            lat: 3.15,
            lng: 35.55,
          },
        ].filter(s => s.suspicion_score >= suspicionThreshold[0]);
      }
      const result = await response.json();
      return Array.isArray(result) ? result : (result.data || []);
    },
  });

  const savePrvTarget = useMutation({
    mutationFn: async (data: any) => {
      const url = editingTarget 
        ? `/api/v1/prv-targets/${editingTarget.id}`
        : '/api/v1/prv-targets';
      const method = editingTarget ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save PRV target');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prv-targets'] });
      closeDialog();
      toast.success(editingTarget ? 'PRV target updated successfully' : 'PRV target created successfully');
    },
    onError: () => {
      toast.error('Failed to save PRV target');
    },
  });

  const deletePrvTarget = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/prv-targets/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete PRV target');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prv-targets'] });
      toast.success('PRV target deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete PRV target');
    },
  });

  const createWorkOrder = useMutation({
    mutationFn: async (suspicionId: string) => {
      const suspicion = leakSuspicions?.find(s => s.id === suspicionId);
      const response = await fetch('/api/v1/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: `Leak Investigation - ${suspicion?.segment_name}`,
          description: `High leak suspicion detected (score: ${suspicion?.suspicion_score}).\nPressure drop: ${suspicion?.pressure_drop_pct}%\nFlow anomaly: ${suspicion?.flow_anomaly_pct}%`,
          priority: suspicion && suspicion.suspicion_score > 0.8 ? 'high' : 'medium',
          kind: 'corrective',
          asset_ids: [],
        }),
      });
      if (!response.ok) throw new Error('Failed to create work order');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Work order created successfully');
    },
    onError: () => {
      toast.error('Failed to create work order');
    },
  });

  const openCreateDialog = () => {
    setEditingTarget(null);
    setSelectedDma('');
    setMinPressure('15');
    setMaxPressure('40');
    setPrvSetpoint('25');
    setIsDialogOpen(true);
  };

  const openEditDialog = (target: PRVTarget) => {
    setEditingTarget(target);
    setSelectedDma(target.dma_id);
    setMinPressure(target.min_pressure_m.toString());
    setMaxPressure(target.max_pressure_m.toString());
    setPrvSetpoint(target.prv_setpoint_m.toString());
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingTarget(null);
    setSelectedDma('');
    setMinPressure('15');
    setMaxPressure('40');
    setPrvSetpoint('25');
  };

  const handleSavePrvTarget = () => {
    if (!selectedDma || !minPressure || !maxPressure || !prvSetpoint) {
      toast.error('Please fill all fields');
      return;
    }

    const min = parseFloat(minPressure);
    const max = parseFloat(maxPressure);
    const setpoint = parseFloat(prvSetpoint);

    if (min >= max) {
      toast.error('Minimum pressure must be less than maximum');
      return;
    }

    if (setpoint < min || setpoint > max) {
      toast.error('PRV setpoint must be between min and max pressure');
      return;
    }

    savePrvTarget.mutate({
      dma_id: selectedDma,
      min_pressure_m: min,
      max_pressure_m: max,
      prv_setpoint_m: setpoint,
    });
  };

  const getSuspicionColor = (score: number) => {
    if (score >= 0.8) return '#ef4444';
    if (score >= 0.7) return '#f59e0b';
    return '#eab308';
  };

  const getSuspicionBadge = (score: number) => {
    if (score >= 0.8) return { variant: 'destructive' as const, label: 'Critical' };
    if (score >= 0.7) return { variant: 'default' as const, label: 'High' };
    return { variant: 'secondary' as const, label: 'Moderate' };
  };

  const getPressureStatus = (target: PRVTarget) => {
    const range = target.max_pressure_m - target.min_pressure_m;
    const midpoint = (target.min_pressure_m + target.max_pressure_m) / 2;
    const deviation = Math.abs(target.prv_setpoint_m - midpoint);
    const deviationPct = (deviation / range) * 100;

    if (deviationPct < 10) return { color: 'bg-green-500', label: 'Optimal' };
    if (deviationPct < 25) return { color: 'bg-yellow-500', label: 'Acceptable' };
    return { color: 'bg-orange-500', label: 'Review' };
  };

  const leakHeatmapData = {
    type: 'FeatureCollection' as const,
    features: (Array.isArray(leakSuspicions) ? leakSuspicions : []).map(suspicion => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [suspicion.lng, suspicion.lat] as [number, number],
      },
      properties: {
        score: suspicion.suspicion_score,
        name: suspicion.segment_name,
      },
    })),
  };

  const kpis = {
    totalTargets: prvTargets?.length ?? 0,
    avgSetpoint: prvTargets?.length 
      ? (prvTargets.reduce((sum, t) => sum + t.prv_setpoint_m, 0) / prvTargets.length).toFixed(1)
      : 0,
    totalSuspicions: leakSuspicions?.length ?? 0,
    criticalSuspicions: leakSuspicions?.filter(s => s.suspicion_score >= 0.8).length ?? 0,
  };

  return (
    <div className="p-6 space-y-6 bg-background">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pressure & Leak Management</h1>
        <p className="text-muted-foreground">Configure DMA pressure targets and detect potential leaks using ML-based analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Gauge className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{kpis.totalTargets}</div>
                <div className="text-sm text-muted-foreground">DMA Targets</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Settings className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{kpis.avgSetpoint}m</div>
                <div className="text-sm text-muted-foreground">Avg PRV Setpoint</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{kpis.totalSuspicions}</div>
                <div className="text-sm text-muted-foreground">Leak Suspicions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{kpis.criticalSuspicions}</div>
                <div className="text-sm text-muted-foreground">Critical (80%+)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-muted">
          <TabsTrigger value="targets">DMA Pressure Targets</TabsTrigger>
          <TabsTrigger value="suspicions">Leak Suspicions</TabsTrigger>
          <TabsTrigger value="map">Heatmap View</TabsTrigger>
        </TabsList>

        <TabsContent value="targets" className="mt-6">
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">DMA Pressure Targets</CardTitle>
                  <CardDescription>Configure PRV setpoints and pressure ranges for each District Metered Area</CardDescription>
                </div>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Target
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {targetsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : prvTargets && prvTargets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DMA</TableHead>
                      <TableHead className="text-center">Min Pressure</TableHead>
                      <TableHead className="text-center">Max Pressure</TableHead>
                      <TableHead className="text-center">PRV Setpoint</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prvTargets.map(target => {
                      const status = getPressureStatus(target);
                      return (
                        <TableRow key={target.id}>
                          <TableCell className="font-medium">{target.dma_name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{target.min_pressure_m}m</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{target.max_pressure_m}m</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-primary text-primary-foreground">{target.prv_setpoint_m}m</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(target.updated_at), 'PP')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(target)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => deletePrvTarget.mutate(target.id)}
                                disabled={deletePrvTarget.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground mb-4">No pressure targets configured</p>
                  <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Target
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspicions" className="mt-6">
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">High-Suspicion Segments</CardTitle>
                  <CardDescription>Network segments with elevated leak probability requiring investigation</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Threshold:</Label>
                    <div className="w-32">
                      <Slider
                        value={suspicionThreshold}
                        onValueChange={setSuspicionThreshold}
                        min={0.5}
                        max={0.9}
                        step={0.05}
                      />
                    </div>
                    <span className="text-sm font-mono w-12">{(suspicionThreshold[0] * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead>DMA</TableHead>
                    <TableHead className="text-center">Suspicion Score</TableHead>
                    <TableHead className="text-center">Pressure Drop</TableHead>
                    <TableHead className="text-center">Flow Anomaly</TableHead>
                    <TableHead>Last Reading</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leakSuspicions && leakSuspicions.length > 0 ? (
                    leakSuspicions.map(suspicion => {
                      const badge = getSuspicionBadge(suspicion.suspicion_score);
                      return (
                        <TableRow key={suspicion.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{suspicion.segment_name}</div>
                              <div className="text-xs text-muted-foreground">{suspicion.segment_id}</div>
                            </div>
                          </TableCell>
                          <TableCell>{suspicion.dma_name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={badge.variant}>
                              {((suspicion.suspicion_score ?? 0) * 100).toFixed(0)}% - {badge.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <TrendingDown className="h-4 w-4 text-red-500" />
                              <span>{(suspicion.pressure_drop_pct ?? 0).toFixed(1)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <TrendingUp className="h-4 w-4 text-orange-500" />
                              <span>{(suspicion.flow_anomaly_pct ?? 0).toFixed(1)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {suspicion.last_reading ? format(new Date(suspicion.last_reading), 'PP p') : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => createWorkOrder.mutate(suspicion.id)}
                              disabled={createWorkOrder.isPending}
                            >
                              <Wrench className="mr-2 h-4 w-4" />
                              Create WO
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No segments above {(suspicionThreshold[0] * 100).toFixed(0)}% threshold
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Leak Suspicion Heatmap
              </CardTitle>
              <CardDescription>ML-based leak detection using pressure and flow anomalies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] rounded-lg overflow-hidden border">
                <Map
                  initialViewState={{
                    longitude: 35.60,
                    latitude: 3.10,
                    zoom: 10
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                >
                  <NavigationControl position="top-right" />
                  <ScaleControl />

                  <Source id="leak-heatmap" type="geojson" data={leakHeatmapData}>
                    <Layer
                      id="leak-points"
                      type="circle"
                      paint={{
                        'circle-radius': [
                          'interpolate',
                          ['linear'],
                          ['get', 'score'],
                          0.5, 8,
                          0.7, 15,
                          0.9, 25
                        ],
                        'circle-color': [
                          'interpolate',
                          ['linear'],
                          ['get', 'score'],
                          0.5, '#22c55e',
                          0.6, '#eab308',
                          0.7, '#f59e0b',
                          0.8, '#ef4444'
                        ],
                        'circle-opacity': 0.7,
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff',
                      }}
                    />
                  </Source>
                </Map>
              </div>

              <div className="flex items-center justify-center gap-8 mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span className="text-sm">Low (50-60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500" />
                  <span className="text-sm">Moderate (60-70%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500" />
                  <span className="text-sm">High (70-80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span className="text-sm">Critical (80%+)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTarget ? 'Edit' : 'Add'} PRV Pressure Target</DialogTitle>
            <DialogDescription>
              Configure pressure reducing valve setpoints for a District Metered Area
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>DMA Zone *</Label>
              <Select value={selectedDma} onValueChange={setSelectedDma} disabled={!!editingTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select DMA" />
                </SelectTrigger>
                <SelectContent>
                  {dmas?.map(dma => (
                    <SelectItem key={dma.id} value={dma.id}>
                      {dma.code} - {dma.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Pressure (m) *</Label>
                <Input
                  type="number"
                  value={minPressure}
                  onChange={(e) => setMinPressure(e.target.value)}
                  placeholder="15"
                  step="0.5"
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum Pressure (m) *</Label>
                <Input
                  type="number"
                  value={maxPressure}
                  onChange={(e) => setMaxPressure(e.target.value)}
                  placeholder="40"
                  step="0.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>PRV Setpoint (m) *</Label>
              <Input
                type="number"
                value={prvSetpoint}
                onChange={(e) => setPrvSetpoint(e.target.value)}
                placeholder="25"
                step="0.5"
              />
              {minPressure && maxPressure && (
                <p className="text-xs text-muted-foreground">
                  Recommended setpoint: {((parseFloat(minPressure) + parseFloat(maxPressure)) / 2).toFixed(1)}m 
                  (midpoint of {minPressure}m - {maxPressure}m range)
                </p>
              )}
            </div>

            {minPressure && maxPressure && prvSetpoint && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Pressure Range Visualization</div>
                <div className="relative h-8 bg-gradient-to-r from-red-500 via-green-500 to-red-500 rounded">
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-primary border-2 border-white rounded"
                    style={{ 
                      left: `${((parseFloat(prvSetpoint) - parseFloat(minPressure)) / (parseFloat(maxPressure) - parseFloat(minPressure))) * 100}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{minPressure}m (min)</span>
                  <span>{prvSetpoint}m (setpoint)</span>
                  <span>{maxPressure}m (max)</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSavePrvTarget} disabled={savePrvTarget.isPending}>
              {savePrvTarget.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingTarget ? 'Update' : 'Create'} Target
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
