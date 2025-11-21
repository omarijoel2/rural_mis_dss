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
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Play, Trash2, Copy, FileText } from "lucide-react";
import { toast } from "sonner";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface Scenario {
  id: string;
  name: string;
  type: 'drought' | 'demand_spike' | 'contamination' | 'power_shock' | 'asset_failure' | 'custom';
  status: 'draft' | 'running' | 'completed';
  period_start: string;
  period_end: string;
  params: Record<string, any>;
  results?: {
    deficit_m3d: number;
    continuity_hrs: number;
    cost_impact: number;
    service_deficit_pct: number;
  };
  created_at: string;
}

export default function ScenarioWorkbenchPage() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'drought' as const,
    scheme_id: '',
    period_start: new Date(),
    period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    severity: 50,
    monte_carlo_runs: 100,
    params: {} as Record<string, any>,
  });

  const [playbook, setPlaybook] = useState<Array<{
    action: string;
    owner: string;
    trigger: string;
    lead_time: number;
    impact: string;
  }>>([]);

  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const { data: schemes, isLoading: isSchemesLoading, error: schemesError } = useQuery({
    queryKey: ['schemes'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/schemes');
      return (res as any).data.data;
    },
  });

  const { data: scenarios, isLoading: isScenariosLoading, error: scenariosError, refetch: refetchScenarios } = useQuery({
    queryKey: ['scenarios'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/dsa/scenarios');
      return (res as any).data.data as Scenario[];
    },
  });

  const runScenarioMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/api/v1/dsa/scenarios/${id}/run`);
      return (res as any).data;
    },
    onSuccess: () => {
      toast.success('Scenario simulation started');
      refetchScenarios();
    },
    onError: () => {
      toast.error('Failed to run scenario');
    },
  });

  const createScenarioMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiClient.post('/api/v1/dsa/scenarios', {
        ...data,
        playbook: playbook,
      });
      return (res as any).data;
    },
    onSuccess: () => {
      toast.success('Scenario created successfully');
      refetchScenarios();
      // Reset form
      setFormData({
        name: '',
        type: 'drought',
        scheme_id: '',
        period_start: new Date(),
        period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        severity: 50,
        monte_carlo_runs: 100,
        params: {},
      });
      setPlaybook([]);
    },
    onError: () => {
      toast.error('Failed to create scenario');
    },
  });

  const addPlaybookStep = () => {
    setPlaybook([
      ...playbook,
      {
        action: '',
        owner: '',
        trigger: '',
        lead_time: 24,
        impact: '',
      },
    ]);
  };

  const removePlaybookStep = (index: number) => {
    setPlaybook(playbook.filter((_, i) => i !== index));
  };

  const updatePlaybookStep = (index: number, field: string, value: any) => {
    const updated = [...playbook];
    updated[index] = { ...updated[index], [field]: value };
    setPlaybook(updated);
  };

  const selectedScenarioData = scenarios?.find(s => s.id === selectedScenario);

  // DEMO DATA - Replace with API integration once backend endpoints are ready
  const comparisonData = selectedScenarioData?.results ? [
    { metric: 'Deficit', baseline: 0, scenario: selectedScenarioData.results.deficit_m3d },
    { metric: 'Continuity', baseline: 24, scenario: selectedScenarioData.results.continuity_hrs },
    { metric: 'Cost Impact', baseline: 100, scenario: 100 + selectedScenarioData.results.cost_impact },
    { metric: 'Service Level', baseline: 100, scenario: 100 - selectedScenarioData.results.service_deficit_pct },
  ] : [];

  // DEMO DATA - Multi-KPI radar visualization  
  const radarData = [
    { kpi: 'Supply', value: 85, fullMark: 100 },
    { kpi: 'Pressure', value: 70, fullMark: 100 },
    { kpi: 'Quality', value: 90, fullMark: 100 },
    { kpi: 'Cost', value: 60, fullMark: 100 },
    { kpi: 'Reliability', value: 75, fullMark: 100 },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scenario Workbench</h1>
        <p className="text-muted-foreground">Design and simulate stress tests for resilience planning</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Builder */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Scenario Builder</CardTitle>
            <CardDescription>Define parameters for stress testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Scenario Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Severe Drought 2025"
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drought">Drought</SelectItem>
                  <SelectItem value="demand_spike">Demand Spike</SelectItem>
                  <SelectItem value="contamination">Contamination</SelectItem>
                  <SelectItem value="power_shock">Power Price Shock</SelectItem>
                  <SelectItem value="asset_failure">Asset Failure</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Scheme</Label>
              <Select value={formData.scheme_id} onValueChange={(v) => setFormData({ ...formData, scheme_id: v })}>
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
              <Label>Severity: {formData.severity}%</Label>
              <Slider
                value={[formData.severity]}
                onValueChange={([v]) => setFormData({ ...formData, severity: v })}
                min={0}
                max={100}
                step={5}
              />
            </div>

            <div>
              <Label>Monte Carlo Runs: {formData.monte_carlo_runs}</Label>
              <Slider
                value={[formData.monte_carlo_runs]}
                onValueChange={([v]) => setFormData({ ...formData, monte_carlo_runs: v })}
                min={10}
                max={1000}
                step={10}
              />
            </div>

            <div>
              <Label>Playbook Steps</Label>
              <div className="space-y-2 mt-2">
                {playbook.map((step, index) => (
                  <div key={index} className="p-3 border rounded-md space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Step {index + 1}</span>
                      <Button size="sm" variant="ghost" onClick={() => removePlaybookStep(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Action"
                      value={step.action}
                      onChange={(e) => updatePlaybookStep(index, 'action', e.target.value)}
                    />
                    <Input
                      placeholder="Owner"
                      value={step.owner}
                      onChange={(e) => updatePlaybookStep(index, 'owner', e.target.value)}
                    />
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={addPlaybookStep} className="w-full">
                  Add Playbook Step
                </Button>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => createScenarioMutation.mutate(formData)}
              disabled={!formData.name || !formData.scheme_id || createScenarioMutation.isPending}
            >
              Create Scenario
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scenario List */}
          <Card>
            <CardHeader>
              <CardTitle>Scenario Library</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deficit (m³/d)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenarios?.map((scenario) => (
                    <TableRow
                      key={scenario.id}
                      className={selectedScenario === scenario.id ? 'bg-muted' : ''}
                      onClick={() => setSelectedScenario(scenario.id)}
                    >
                      <TableCell className="font-medium">{scenario.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{scenario.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          scenario.status === 'completed' ? 'default' :
                          scenario.status === 'running' ? 'secondary' : 'outline'
                        }>
                          {scenario.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{scenario.results?.deficit_m3d?.toFixed(1) || '-'}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            runScenarioMutation.mutate(scenario.id);
                          }}
                          disabled={scenario.status === 'running'}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Results Visualization */}
          {selectedScenarioData && selectedScenarioData.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle>Scenario Results: {selectedScenarioData.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="kpis">
                  <TabsList>
                    <TabsTrigger value="kpis">KPIs</TabsTrigger>
                    <TabsTrigger value="comparison">Comparison</TabsTrigger>
                    <TabsTrigger value="radar">Multi-KPI Radar</TabsTrigger>
                  </TabsList>

                  <TabsContent value="kpis" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 border rounded-md">
                        <p className="text-sm text-muted-foreground">Supply Deficit</p>
                        <p className="text-2xl font-bold">{selectedScenarioData.results.deficit_m3d.toFixed(0)} m³/d</p>
                      </div>
                      <div className="p-4 border rounded-md">
                        <p className="text-sm text-muted-foreground">Continuity</p>
                        <p className="text-2xl font-bold">{selectedScenarioData.results.continuity_hrs.toFixed(1)} hrs/day</p>
                      </div>
                      <div className="p-4 border rounded-md">
                        <p className="text-sm text-muted-foreground">Cost Impact</p>
                        <p className="text-2xl font-bold">{selectedScenarioData.results.cost_impact > 0 ? '+' : ''}{selectedScenarioData.results.cost_impact.toFixed(0)}%</p>
                      </div>
                      <div className="p-4 border rounded-md">
                        <p className="text-sm text-muted-foreground">Service Deficit</p>
                        <p className="text-2xl font-bold">{selectedScenarioData.results.service_deficit_pct.toFixed(1)}%</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="comparison" className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metric" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="baseline" fill="#10b981" name="Baseline" />
                        <Bar dataKey="scenario" fill="#ef4444" name="Scenario" />
                      </BarChart>
                    </ResponsiveContainer>
                  </TabsContent>

                  <TabsContent value="radar" className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="kpi" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
