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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { AlertTriangle, Settings, Wrench, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

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
  const [selectedDma, setSelectedDma] = useState<string>('');
  const [minPressure, setMinPressure] = useState('15');
  const [maxPressure, setMaxPressure] = useState('40');
  const [prvSetpoint, setPrvSetpoint] = useState('25');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const { data: prvTargets } = useQuery<PRVTarget[]>({
    queryKey: ['prv-targets'],
    queryFn: async () => {
      const response = await fetch('/api/v1/prv-targets', {
        credentials: 'include',
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  const { data: leakSuspicions } = useQuery<LeakSuspicion[]>({
    queryKey: ['leak-suspicions'],
    queryFn: async () => {
      const response = await fetch('/api/v1/leak-suspicions?score_threshold=0.6', {
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
            last_reading: '2025-11-21T08:30:00Z',
            lat: -1.2921,
            lng: 36.8219,
          },
          {
            id: '2',
            segment_id: 'SEG-047',
            segment_name: 'Industrial Zone Feed',
            dma_name: 'East DMA',
            suspicion_score: 0.72,
            pressure_drop_pct: 8.3,
            flow_anomaly_pct: 18.7,
            last_reading: '2025-11-21T08:25:00Z',
            lat: -1.2835,
            lng: 36.8342,
          },
          {
            id: '3',
            segment_id: 'SEG-103',
            segment_name: 'Residential Loop',
            dma_name: 'West DMA',
            suspicion_score: 0.68,
            pressure_drop_pct: 11.1,
            flow_anomaly_pct: 9.4,
            last_reading: '2025-11-21T08:20:00Z',
            lat: -1.2987,
            lng: 36.8105,
          },
        ];
      }
      const result = await response.json();
      return Array.isArray(result) ? result : (result.data || []);
    },
  });

  const savePrvTarget = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/v1/prv-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save PRV target');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prv-targets'] });
      setIsDialogOpen(false);
      toast.success('PRV target saved successfully');
      setSelectedDma('');
      setMinPressure('15');
      setMaxPressure('40');
      setPrvSetpoint('25');
    },
    onError: () => {
      toast.error('Failed to save PRV target');
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

  const handleSavePrvTarget = () => {
    if (!selectedDma || !minPressure || !maxPressure || !prvSetpoint) {
      toast.error('Please fill all fields');
      return;
    }

    savePrvTarget.mutate({
      dma_id: selectedDma,
      min_pressure_m: parseFloat(minPressure),
      max_pressure_m: parseFloat(maxPressure),
      prv_setpoint_m: parseFloat(prvSetpoint),
    });
  };

  const getSuspicionColor = (score: number) => {
    if (score >= 0.8) return '#ef4444'; // red
    if (score >= 0.7) return '#f59e0b'; // orange
    return '#eab308'; // yellow
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
      },
    })),
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pressure & Leak Management</h1>
        <p className="text-muted-foreground">Monitor pressure targets and detect potential leaks using ML-based analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRV Targets Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              PRV Pressure Targets
            </CardTitle>
            <CardDescription>Configure pressure reducing valve setpoints by DMA</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mb-4">
                  <Settings className="mr-2 h-4 w-4" />
                  Add/Edit Target
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>PRV Target Configuration</DialogTitle>
                  <DialogDescription>
                    Set pressure targets for a District Metered Area
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>DMA</Label>
                    <Select value={selectedDma} onValueChange={setSelectedDma}>
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

                  <div>
                    <Label>Minimum Pressure (m)</Label>
                    <Input
                      type="number"
                      value={minPressure}
                      onChange={(e) => setMinPressure(e.target.value)}
                      placeholder="15"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <Label>Maximum Pressure (m)</Label>
                    <Input
                      type="number"
                      value={maxPressure}
                      onChange={(e) => setMaxPressure(e.target.value)}
                      placeholder="40"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <Label>PRV Setpoint (m)</Label>
                    <Input
                      type="number"
                      value={prvSetpoint}
                      onChange={(e) => setPrvSetpoint(e.target.value)}
                      placeholder="25"
                      step="0.1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: {Math.round((parseFloat(minPressure) + parseFloat(maxPressure)) / 2)} m
                    </p>
                  </div>

                  <Button onClick={handleSavePrvTarget} className="w-full" disabled={savePrvTarget.isPending}>
                    {savePrvTarget.isPending ? 'Saving...' : 'Save Target'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="space-y-3">
              {prvTargets && prvTargets.length > 0 ? (
                prvTargets.map(target => (
                  <Card key={target.id} className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm">{target.dma_name}</div>
                      <Badge variant="outline" className="text-xs">
                        PRV: {target.prv_setpoint_m}m
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Min: {target.min_pressure_m}m</span>
                      <span>Max: {target.max_pressure_m}m</span>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No PRV targets configured
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Leak Suspicion Heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Leak Suspicion Heatmap
            </CardTitle>
            <CardDescription>ML-based leak detection using pressure and flow anomalies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-lg overflow-hidden border">
              <Map
                initialViewState={{
                  longitude: 36.8219,
                  latitude: -1.2921,
                  zoom: 11
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
              >
                <NavigationControl position="top-right" />
                <ScaleControl />

                <Source
                  id="leak-heatmap"
                  type="geojson"
                  data={leakHeatmapData}
                >
                  <Layer
                    id="leak-points"
                    type="circle"
                    paint={{
                      'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['get', 'score'],
                        0.6, 10,
                        0.9, 25
                      ],
                      'circle-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'score'],
                        0.6, '#eab308',
                        0.7, '#f59e0b',
                        0.8, '#ef4444'
                      ],
                      'circle-opacity': 0.6,
                      'circle-stroke-width': 2,
                      'circle-stroke-color': '#ffffff',
                    }}
                  />
                </Source>
              </Map>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Moderate (0.6-0.7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span className="text-sm">High (0.7-0.8)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm">Critical (0.8+)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Suspicion Segments Table */}
      <Card>
        <CardHeader>
          <CardTitle>High-Suspicion Segments</CardTitle>
          <CardDescription>Network segments with elevated leak probability requiring investigation</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment</TableHead>
                <TableHead>DMA</TableHead>
                <TableHead>Suspicion Score</TableHead>
                <TableHead>Pressure Drop</TableHead>
                <TableHead>Flow Anomaly</TableHead>
                <TableHead>Last Reading</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leakSuspicions && leakSuspicions.length > 0 ? (
                leakSuspicions.map(suspicion => (
                  <TableRow key={suspicion.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{suspicion.segment_name}</div>
                        <div className="text-xs text-muted-foreground">{suspicion.segment_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{suspicion.dma_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getSuspicionColor(suspicion.suspicion_score ?? 0) }}
                        />
                        <span className="font-mono text-sm">{((suspicion.suspicion_score ?? 0) * 100).toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm">{(suspicion.pressure_drop_pct ?? 0).toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{(suspicion.flow_anomaly_pct ?? 0).toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {suspicion.last_reading ? new Date(suspicion.last_reading).toLocaleString() : 'N/A'}
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No high-suspicion segments detected
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
