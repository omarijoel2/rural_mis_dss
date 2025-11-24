import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Zap, TrendingUp } from 'lucide-react';
import { telemetryAPI, assetsAPI } from '@/lib/api';
import { TelemetryTagForm } from '@/components/forms/TelemetryTagForm';
import { useTelemetryWebSocket } from '@/hooks/useTelemetryWebSocket';

export function TelemetryPageWithForms() {
  const [showTagForm, setShowTagForm] = useState(false);
  const [subscribedTags, setSubscribedTags] = useState<number[]>([]);

  const { data: tags, refetch: refetchTags } = useQuery({
    queryKey: ['telemetry-tags'],
    queryFn: async () => {
      const laravel = await telemetryAPI.tags();
      if (laravel) return laravel;
      return {
        data: [
          { id: 1, tag: 'PUMP_001_FLOW', ioType: 'AI', unit: 'lpm', assetId: 1 },
          { id: 2, tag: 'RES_001_LEVEL', ioType: 'AI', unit: 'm3', assetId: 3 },
          { id: 3, tag: 'PUMP_001_STATUS', ioType: 'DI', unit: 'on/off', assetId: 1 },
        ],
      };
    },
  });

  const { data: assets } = useQuery({
    queryKey: ['assets-for-telemetry'],
    queryFn: async () => {
      const laravel = await assetsAPI.list();
      if (laravel) return laravel;
      return {
        data: [
          { id: 1, code: 'PUMP_001', name: 'Main Pump' },
          { id: 3, code: 'RES_001', name: 'Main Reservoir' },
        ],
      };
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Telemetry & SCADA</h1>
          <p className="text-muted-foreground">Real-time sensor monitoring with WebSocket updates</p>
        </div>
        <div className="flex items-center gap-2">
          <Zap className={`h-4 w-4 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
          <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
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
            <Card>
              <CardHeader>
                <CardTitle>Add Telemetry Sensor</CardTitle>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tags?.data?.map((tag: any) => (
              <Card key={tag.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-mono">{tag.tag}</CardTitle>
                    <Badge>{tag.ioType}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm"><span className="font-semibold">Type:</span> {tag.ioType}</div>
                  <div className="text-sm"><span className="font-semibold">Unit:</span> {tag.unit || '-'}</div>
                  {tag.scale && <div className="text-xs text-muted-foreground">Has scaling configured</div>}
                  {tag.thresholds && <div className="text-xs text-muted-foreground">Alarms enabled</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="measurements" className="space-y-4">
          {!isConnected && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-700">
              WebSocket disconnected - showing last recorded values
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(measurements).map(([tagId, measurement]: [string, any]) => (
              <Card key={tagId} className="border-green-500/30 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    {measurement.tag}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold">{measurement.value} {measurement.unit || ''}</div>
                  <div className="text-xs text-muted-foreground">
                    Updated: {new Date(measurement.timestamp).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
