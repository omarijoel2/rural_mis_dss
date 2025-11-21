import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Play, Save, TrendingDown, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

interface OptimRun {
  id: string;
  optim_type: 'pump_scheduling' | 'valve_settings' | 'chlorine_dosing' | 'logistics';
  status: 'pending' | 'running' | 'completed' | 'failed';
  kpis?: {
    savings: number;
    peak_hours_avoided: number;
    efficiency: number;
  };
  outputs?: {
    windows?: Array<{
      start_hour: number;
      duration_hours: number;
      volume_m3: number;
      cost: number;
    }>;
    setpoints?: Array<{
      asset: string;
      value: number;
    }>;
  };
  created_at: string;
}

export default function OptimizationConsolePage() {
  const [activeTab, setActiveTab] = useState<'pumps' | 'valves' | 'dosing' | 'logistics'>('pumps');
  const [pumpFormData, setPumpFormData] = useState({
    scheme_id: '',
    asset_ids: [] as string[],
    target_volume_m3: 5000,
    objective: 'minimize_energy_cost',
  });

  const { data: schemes } = useQuery({
    queryKey: ['schemes'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/schemes');
      return (res as any).data.data;
    },
  });

  const { data: pumps } = useQuery({
    queryKey: ['pumps', pumpFormData.scheme_id],
    queryFn: async () => {
      if (!pumpFormData.scheme_id) return [];
      const res = await apiClient.get(`/api/v1/assets?scheme_id=${pumpFormData.scheme_id}&kind=pump`);
      return (res as any).data.data;
    },
    enabled: !!pumpFormData.scheme_id,
  });

  const { data: optimRuns, refetch: refetchRuns } = useQuery({
    queryKey: ['optim-runs', activeTab],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/dsa/optimize?type=${activeTab}`);
      return (res as any).data.data as OptimRun[];
    },
  });

  const runOptimizationMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = `/api/v1/dsa/optimize/${activeTab}`;
      const res = await apiClient.post(endpoint, data);
      return (res as any).data;
    },
    onSuccess: () => {
      toast.success('Optimization started successfully');
      refetchRuns();
    },
    onError: () => {
      toast.error('Failed to start optimization');
    },
  });

  const publishPlanMutation = useMutation({
    mutationFn: async (runId: string) => {
      const res = await apiClient.post(`/api/v1/dsa/optimize/${runId}/publish`);
      return (res as any).data;
    },
    onSuccess: () => {
      toast.success('Plan published to CoreOps successfully');
      refetchRuns();
    },
    onError: () => {
      toast.error('Failed to publish plan');
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Optimization Console</h1>
        <p className="text-muted-foreground">AI-powered optimization for pumps, valves, dosing, and logistics</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pumps">Pump Scheduling</TabsTrigger>
          <TabsTrigger value="valves">Valve Settings</TabsTrigger>
          <TabsTrigger value="dosing">Chlorine Dosing</TabsTrigger>
          <TabsTrigger value="logistics">Logistics</TabsTrigger>
        </TabsList>

        {/* Pump Scheduling Tab */}
        <TabsContent value="pumps" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Set optimization parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Scheme</Label>
                  <Select value={pumpFormData.scheme_id} onValueChange={(v) => setPumpFormData({ ...pumpFormData, scheme_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scheme..." />
                    </SelectTrigger>
                    <SelectContent>
                      {schemes?.map((scheme: any) => (
                        <SelectItem key={scheme.id} value={scheme.id}>{scheme.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Pumps</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pumps..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pumps?.map((pump: any) => (
                        <SelectItem key={pump.id} value={pump.id}>{pump.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Target Volume (m³)</Label>
                  <Input
                    type="number"
                    value={pumpFormData.target_volume_m3}
                    onChange={(e) => setPumpFormData({ ...pumpFormData, target_volume_m3: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Objective</Label>
                  <Select value={pumpFormData.objective} onValueChange={(v) => setPumpFormData({ ...pumpFormData, objective: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimize_energy_cost">Minimize Energy Cost</SelectItem>
                      <SelectItem value="minimize_peak_demand">Minimize Peak Demand</SelectItem>
                      <SelectItem value="maximize_storage">Maximize Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={() => runOptimizationMutation.mutate(pumpFormData)}
                  disabled={!pumpFormData.scheme_id || runOptimizationMutation.isPending}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Optimization
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Run</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Savings</TableHead>
                        <TableHead>Peak Hours Avoided</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {optimRuns?.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell className="font-medium">#{run.id.slice(0, 8)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              run.status === 'completed' ? 'default' :
                              run.status === 'failed' ? 'destructive' : 'secondary'
                            }>
                              {run.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {run.kpis?.savings ? `${run.kpis.savings.toFixed(0)}%` : '-'}
                          </TableCell>
                          <TableCell>
                            {run.kpis?.peak_hours_avoided || '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => publishPlanMutation.mutate(run.id)}
                              disabled={run.status !== 'completed'}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Publish
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {optimRuns?.[0]?.status === 'completed' && optimRuns[0].outputs?.windows && (
                <Card>
                  <CardHeader>
                    <CardTitle>Optimized Schedule (Gantt)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {optimRuns[0].outputs.windows.map((window, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-20 text-sm">{window.start_hour}:00</div>
                          <div
                            className="h-8 bg-blue-500 rounded flex items-center px-2 text-white text-sm"
                            style={{ width: `${(window.duration_hours / 24) * 100}%` }}
                          >
                            {window.duration_hours}h
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {window.volume_m3.toFixed(0)} m³
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {optimRuns?.[0]?.status === 'completed' && optimRuns[0].kpis && (
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Cost Savings</p>
                          <p className="text-2xl font-bold">{optimRuns[0].kpis.savings.toFixed(0)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Peak Hours Avoided</p>
                          <p className="text-2xl font-bold">{optimRuns[0].kpis.peak_hours_avoided}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Efficiency</p>
                          <p className="text-2xl font-bold">{optimRuns[0].kpis.efficiency.toFixed(0)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Other tabs would follow similar patterns */}
        <TabsContent value="valves">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Valve optimization configuration coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dosing">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Chlorine dosing optimization configuration coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logistics">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Logistics routing optimization configuration coming soon
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
