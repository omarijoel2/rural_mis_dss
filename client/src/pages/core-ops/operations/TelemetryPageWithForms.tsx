import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Zap, TrendingUp, BarChart2, X, Download } from 'lucide-react';
import { telemetryAPI, assetsAPI } from '@/lib/api';
import { TelemetryTagForm } from '@/components/forms/TelemetryTagForm';
import { useTelemetryWebSocket } from '@/hooks/useTelemetryWebSocket';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, subHours } from 'date-fns';

interface TrendDataPoint {
  timestamp: string;
  value: number;
  formatted_time: string;
}

export function TelemetryPageWithForms() {
  const [showTagForm, setShowTagForm] = useState(false);
  const [subscribedTags, setSubscribedTags] = useState<number[]>([]);
  const [trendModalOpen, setTrendModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [trendPeriod, setTrendPeriod] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [isLoadingTrend, setIsLoadingTrend] = useState(false);

  const { data: tags, refetch: refetchTags } = useQuery({
    queryKey: ['telemetry-tags'],
    queryFn: async () => {
      const laravel = await telemetryAPI.tags();
      return laravel || { data: [] };
    },
  });

  const { data: assets } = useQuery({
    queryKey: ['assets-for-telemetry'],
    queryFn: async () => {
      const laravel = await assetsAPI.list();
      return laravel || { data: [] };
    },
  });

  const { measurements, isConnected } = useTelemetryWebSocket(subscribedTags);

  useEffect(() => {
    if (tags?.data) {
      setSubscribedTags(tags.data.map((t: any) => t.id));
    }
  }, [tags?.data]);

  const handleSubmit = async (data: any) => {
    try {
      await telemetryAPI.createTag(data);
      setShowTagForm(false);
      refetchTags();
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const openTrendModal = async (tag: any) => {
    setSelectedTag(tag);
    setTrendModalOpen(true);
    await fetchTrendData(tag.id, trendPeriod);
  };

  const fetchTrendData = async (tagId: number, period: string) => {
    setIsLoadingTrend(true);
    
    try {
      let from: Date;
      const to = new Date();
      
      switch (period) {
        case '1h':
          from = subHours(to, 1);
          break;
        case '6h':
          from = subHours(to, 6);
          break;
        case '24h':
          from = subDays(to, 1);
          break;
        case '7d':
          from = subDays(to, 7);
          break;
        default:
          from = subDays(to, 1);
      }

      // Request tag-specific measurements from the backend using server-side params
      const result: any = await telemetryAPI.measurements(tagId, { from: from.toISOString(), to: to.toISOString(), per_page: 500 });

      const payload = (result && (result.data || result)) || null;
      if (payload && Array.isArray(payload)) {
        const data = payload.map((m: any) => ({
          timestamp: m.ts || m.timestamp,
          value: Number(m.value),
          formatted_time: format(new Date(m.ts || m.timestamp), period === '7d' ? 'MMM dd HH:mm' : 'HH:mm'),
        }));
        setTrendData(data);
      } else {
        setTrendData([]);
      }
    } catch {
      setTrendData([]);
    } finally {
      setIsLoadingTrend(false);
    }
  };

  const generateMockTrendData = (period: string): TrendDataPoint[] => {
    const data: TrendDataPoint[] = [];
    const now = new Date();
    let points: number;
    let intervalMs: number;

    switch (period) {
      case '1h':
        points = 60;
        intervalMs = 60 * 1000;
        break;
      case '6h':
        points = 72;
        intervalMs = 5 * 60 * 1000;
        break;
      case '24h':
        points = 96;
        intervalMs = 15 * 60 * 1000;
        break;
      case '7d':
        points = 168;
        intervalMs = 60 * 60 * 1000;
        break;
      default:
        points = 96;
        intervalMs = 15 * 60 * 1000;
    }

    let baseValue = 100 + Math.random() * 50;
    
    for (let i = points - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * intervalMs);
      baseValue += (Math.random() - 0.5) * 10;
      baseValue = Math.max(20, Math.min(200, baseValue));
      
      data.push({
        timestamp: timestamp.toISOString(),
        value: Math.round(baseValue * 10) / 10,
        formatted_time: format(timestamp, period === '7d' ? 'MMM dd HH:mm' : 'HH:mm'),
      });
    }
    
    return data;
  };

  const handlePeriodChange = async (period: '1h' | '6h' | '24h' | '7d') => {
    setTrendPeriod(period);
    if (selectedTag) {
      await fetchTrendData(selectedTag.id, period);
    }
  };

  const exportToPng = () => {
    const svgElement = document.querySelector('.trend-chart svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `trend_${selectedTag?.tag}_${trendPeriod}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="p-6 space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Telemetry & SCADA</h1>
          <p className="text-muted-foreground">Real-time sensor monitoring with WebSocket updates</p>
        </div>
        <div className="flex items-center gap-2">
          <Zap className={`h-4 w-4 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
          <span className="text-sm text-foreground">{isConnected ? 'Connected' : 'Disconnected'}</span>
          <Button onClick={() => setShowTagForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Sensor
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sensors" className="w-full">
        <TabsList>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="measurements">Live Measurements</TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-4">
          {showTagForm && (
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Add Telemetry Sensor</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowTagForm(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <TelemetryTagForm
                  onSubmit={handleSubmit}
                  isLoading={false}
                  assetOptions={assets?.data || []}
                />
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags?.data?.map((tag: any) => (
              <Card key={tag.id} className="bg-card hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-mono text-foreground">{tag.tag}</CardTitle>
                    <Badge>{tag.ioType}</Badge>
                  </div>
                  <CardDescription>
                    {assets?.data?.find((a: any) => a.id === tag.assetId)?.name || 'Unassigned'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-1 font-medium text-foreground">{tag.ioType}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Unit:</span>
                      <span className="ml-1 font-medium text-foreground">{tag.unit || '-'}</span>
                    </div>
                  </div>
                  
                  {tag.thresholds && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Thresholds: {tag.thresholds.low} - {tag.thresholds.high} {tag.unit}
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => openTrendModal(tag)}
                  >
                    <BarChart2 className="h-4 w-4 mr-2" />
                    View Trend
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="measurements" className="space-y-4">
          {!isConnected && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-700 dark:text-yellow-400">
              WebSocket disconnected - showing last recorded values
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(measurements).map(([tagId, measurement]: [string, any]) => (
              <Card key={tagId} className="border-green-500/30 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    {measurement.tag}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-3xl font-bold text-foreground">
                    {measurement.value} {measurement.unit || ''}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated: {new Date(measurement.timestamp).toLocaleTimeString()}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => {
                      const tag = tags?.data?.find((t: any) => t.id === parseInt(tagId));
                      if (tag) openTrendModal(tag);
                    }}
                  >
                    <BarChart2 className="h-4 w-4 mr-2" />
                    View Trend
                  </Button>
                </CardContent>
              </Card>
            ))}

            {Object.keys(measurements).length === 0 && (
              <Card className="col-span-full bg-card">
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">No live measurements available</p>
                  <p className="text-sm text-muted-foreground">Waiting for sensor data...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={trendModalOpen} onOpenChange={setTrendModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-foreground">
                  Trend: {selectedTag?.tag}
                </DialogTitle>
                <DialogDescription>
                  {selectedTag?.unit ? `Values in ${selectedTag.unit}` : 'Historical trend data'}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={trendPeriod} onValueChange={(v) => handlePeriodChange(v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last 1 Hour</SelectItem>
                    <SelectItem value="6h">Last 6 Hours</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={exportToPng}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PNG
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="h-[400px] mt-4 trend-chart">
            {isLoadingTrend ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="formatted_time" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    label={{ 
                      value: selectedTag?.unit || 'Value', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [
                      `${value} ${selectedTag?.unit || ''}`,
                      'Value'
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={selectedTag?.tag || 'Value'}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  {selectedTag?.thresholds?.high && (
                    <Line
                      type="monotone"
                      dataKey={() => selectedTag.thresholds.high}
                      name="High Threshold"
                      stroke="#ef4444"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  )}
                  {selectedTag?.thresholds?.low && (
                    <Line
                      type="monotone"
                      dataKey={() => selectedTag.thresholds.low}
                      name="Low Threshold"
                      stroke="#f59e0b"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {trendData.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-muted-foreground">Min</Label>
                <div className="text-lg font-bold text-foreground">
                  {Math.min(...trendData.map(d => d.value)).toFixed(1)} {selectedTag?.unit}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Max</Label>
                <div className="text-lg font-bold text-foreground">
                  {Math.max(...trendData.map(d => d.value)).toFixed(1)} {selectedTag?.unit}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Average</Label>
                <div className="text-lg font-bold text-foreground">
                  {(trendData.reduce((sum, d) => sum + d.value, 0) / trendData.length).toFixed(1)} {selectedTag?.unit}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Data Points</Label>
                <div className="text-lg font-bold text-foreground">
                  {trendData.length}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
