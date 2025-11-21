import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, TrendingUp, Download, Save, Play, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { toast } from "sonner";

interface ForecastJob {
  id: string;
  entity_type: string;
  entity_id: string;
  metric: string;
  horizon_days: number;
  model_family: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scores?: {
    mae: number;
    rmse: number;
    mape: number;
  };
  params?: Record<string, any>;
  created_at: string;
  completed_at?: string;
}

interface ForecastResult {
  historical: Array<{ date: string; actual: number }>;
  forecast: Array<{ date: string; predicted: number; lower_80: number; upper_80: number; lower_95: number; upper_95: number }>;
  model_card: {
    name: string;
    version: string;
    hyperparameters: Record<string, any>;
    training_window: string;
    features_used: string[];
  };
}

export default function ForecastStudioPage() {
  const [formData, setFormData] = useState({
    entity_type: 'scheme',
    entity_id: '',
    metric: 'production',
    horizon_days: 30,
    model_family: 'auto',
    seasonality: true,
    holdout_pct: 20,
    exogenous_drivers: [] as string[],
  });

  const [driverInput, setDriverInput] = useState('');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  // Fetch schemes for entity selection
  const { data: schemes } = useQuery({
    queryKey: ['schemes'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/schemes');
      return (res as any).data.data;
    },
  });

  // Fetch forecast jobs
  const { data: jobs, refetch: refetchJobs } = useQuery({
    queryKey: ['forecast-jobs'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/dsa/forecast');
      return (res as any).data.data as ForecastJob[];
    },
  });

  // Fetch specific job result
  const { data: jobResult, isLoading: isLoadingJobResult, error: jobResultError } = useQuery({
    queryKey: ['forecast-job', selectedJob],
    queryFn: async () => {
      if (!selectedJob) return null;
      const res = await apiClient.get(`/api/v1/dsa/forecast/${selectedJob}`);
      return (res as any).data as ForecastResult;
    },
    enabled: !!selectedJob,
  });

  // Create forecast job
  const createJobMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiClient.post('/api/v1/dsa/forecast', data);
      return (res as any).data;
    },
    onSuccess: (data) => {
      toast.success('Forecast job started successfully');
      setSelectedJob(data.id);
      refetchJobs();
    },
    onError: () => {
      toast.error('Failed to start forecast job');
    },
  });

  const handleAddDriver = () => {
    if (driverInput.trim() && !formData.exogenous_drivers.includes(driverInput.trim())) {
      setFormData({
        ...formData,
        exogenous_drivers: [...formData.exogenous_drivers, driverInput.trim()],
      });
      setDriverInput('');
    }
  };

  const handleRemoveDriver = (driver: string) => {
    setFormData({
      ...formData,
      exogenous_drivers: formData.exogenous_drivers.filter(d => d !== driver),
    });
  };

  const handleSubmit = () => {
    createJobMutation.mutate(formData);
  };

  const exportCSV = () => {
    if (!jobResult) return;
    
    const csv = [
      ['Date', 'Type', 'Value', 'Lower_80', 'Upper_80', 'Lower_95', 'Upper_95'],
      ...jobResult.historical.map(row => [row.date, 'Historical', row.actual, '', '', '', '']),
      ...jobResult.forecast.map(row => [row.date, 'Forecast', row.predicted, row.lower_80, row.upper_80, row.lower_95, row.upper_95])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forecast_${selectedJob}.csv`;
    a.click();
    toast.success('Forecast exported to CSV');
  };

  const selectedJobData = jobs?.find(j => j.id === selectedJob);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Forecast Studio</h1>
        <p className="text-muted-foreground">Time-series forecasting with ML models and confidence intervals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Forecast Configuration</CardTitle>
            <CardDescription>Define parameters for time-series forecasting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Entity Type</Label>
              <Select value={formData.entity_type} onValueChange={(v) => setFormData({ ...formData, entity_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheme">Scheme</SelectItem>
                  <SelectItem value="dma">DMA</SelectItem>
                  <SelectItem value="meter_class">Meter Class</SelectItem>
                  <SelectItem value="customer_segment">Customer Segment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Entity Selection</Label>
              <Select value={formData.entity_id} onValueChange={(v) => setFormData({ ...formData, entity_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity..." />
                </SelectTrigger>
                <SelectContent>
                  {schemes?.map((scheme: any) => (
                    <SelectItem key={scheme.id} value={scheme.id}>{scheme.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Metric</Label>
              <Select value={formData.metric} onValueChange={(v) => setFormData({ ...formData, metric: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production Volume</SelectItem>
                  <SelectItem value="demand">Demand</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="chemicals">Chemicals Usage</SelectItem>
                  <SelectItem value="energy_cost">Energy Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Forecast Horizon (days): {formData.horizon_days}</Label>
              <Slider
                value={[formData.horizon_days]}
                onValueChange={([v]) => setFormData({ ...formData, horizon_days: v })}
                min={7}
                max={365}
                step={1}
              />
            </div>

            <div>
              <Label>Model Family</Label>
              <Select value={formData.model_family} onValueChange={(v) => setFormData({ ...formData, model_family: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Best Model)</SelectItem>
                  <SelectItem value="arima">ARIMA</SelectItem>
                  <SelectItem value="ets">ETS (Exponential Smoothing)</SelectItem>
                  <SelectItem value="prophet">Prophet</SelectItem>
                  <SelectItem value="lstm">LSTM Neural Network</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Seasonality Detection</Label>
              <Switch
                checked={formData.seasonality}
                onCheckedChange={(v) => setFormData({ ...formData, seasonality: v })}
              />
            </div>

            <div>
              <Label>Holdout Set (%): {formData.holdout_pct}%</Label>
              <Slider
                value={[formData.holdout_pct]}
                onValueChange={([v]) => setFormData({ ...formData, holdout_pct: v })}
                min={10}
                max={30}
                step={5}
              />
            </div>

            <div>
              <Label>Exogenous Drivers</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g., rainfall, temperature, holidays"
                  value={driverInput}
                  onChange={(e) => setDriverInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDriver()}
                />
                <Button size="sm" onClick={handleAddDriver}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.exogenous_drivers.map(driver => (
                  <Badge key={driver} variant="secondary" className="flex items-center gap-1">
                    {driver}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveDriver(driver)} />
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={!formData.entity_id || createJobMutation.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              {createJobMutation.isPending ? 'Starting...' : 'Run Forecast'}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Forecast Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Horizon</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>MAPE</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs?.slice(0, 10).map((job) => (
                    <TableRow 
                      key={job.id}
                      className={selectedJob === job.id ? 'bg-muted' : ''}
                    >
                      <TableCell className="font-medium">{job.metric}</TableCell>
                      <TableCell>{job.model_family.toUpperCase()}</TableCell>
                      <TableCell>{job.horizon_days}d</TableCell>
                      <TableCell>
                        <Badge variant={
                          job.status === 'completed' ? 'default' :
                          job.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{job.scores?.mape?.toFixed(2)}%</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setSelectedJob(job.id)}
                          disabled={job.status !== 'completed'}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Forecast Visualization */}
          {selectedJob && isLoadingJobResult && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Loading forecast results...</p>
              </CardContent>
            </Card>
          )}
          
          {selectedJob && jobResultError && (
            <Card>
              <CardContent className="py-12 text-center text-destructive">
                <p>Error loading forecast: {(jobResultError as Error).message}</p>
              </CardContent>
            </Card>
          )}
          
          {selectedJobData && jobResult && jobResult.historical && jobResult.forecast && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Forecast Results</CardTitle>
                      <CardDescription>
                        {selectedJobData.metric} forecast for {selectedJobData.horizon_days} days
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={exportCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                      <Button size="sm" variant="outline">
                        <Save className="h-4 w-4 mr-2" />
                        Save Baseline
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="chart">
                    <TabsList>
                      <TabsTrigger value="chart">Forecast Chart</TabsTrigger>
                      <TabsTrigger value="errors">Error Metrics</TabsTrigger>
                      <TabsTrigger value="model">Model Card</TabsTrigger>
                    </TabsList>

                    <TabsContent value="chart" className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[...jobResult.historical, ...jobResult.forecast]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="upper_95" 
                            stackId="1"
                            stroke="transparent"
                            fill="#e0e7ff" 
                            fillOpacity={0.3}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="upper_80" 
                            stackId="2"
                            stroke="transparent"
                            fill="#c7d2fe" 
                            fillOpacity={0.4}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="actual" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="predicted" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="errors">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Metric</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Interpretation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">MAE (Mean Absolute Error)</TableCell>
                            <TableCell>{selectedJobData.scores?.mae.toFixed(2)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Average absolute deviation</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">RMSE (Root Mean Squared Error)</TableCell>
                            <TableCell>{selectedJobData.scores?.rmse.toFixed(2)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Penalizes larger errors</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">MAPE (Mean Absolute % Error)</TableCell>
                            <TableCell>{selectedJobData.scores?.mape.toFixed(2)}%</TableCell>
                            <TableCell>
                              <Badge variant={
                                selectedJobData.scores!.mape < 10 ? 'default' :
                                selectedJobData.scores!.mape < 20 ? 'secondary' : 'destructive'
                              }>
                                {selectedJobData.scores!.mape < 10 ? 'Excellent' :
                                 selectedJobData.scores!.mape < 20 ? 'Good' : 'Needs Improvement'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="model" className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Model Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Model Name</p>
                            <p className="font-medium">{jobResult.model_card.name}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Version</p>
                            <p className="font-medium">{jobResult.model_card.version}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Training Window</p>
                            <p className="font-medium">{jobResult.model_card.training_window}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Features Used</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {jobResult.model_card.features_used.map(f => (
                                <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Hyperparameters</h3>
                        <div className="bg-muted p-3 rounded-md">
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(jobResult.model_card.hyperparameters, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {selectedJobData.scores && selectedJobData.scores.mape > 20 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Model Accuracy Alert:</strong> MAPE is {selectedJobData.scores.mape.toFixed(1)}%. 
                    Consider adding more exogenous drivers or trying a different model family.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
