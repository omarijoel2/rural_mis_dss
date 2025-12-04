import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, TrendingDown, AlertTriangle, ChevronLeft, ChevronRight, Droplets, MapPin, Layers, Activity, Eye, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Aquifer {
  id: number;
  name: string;
  safeYieldMcm: number;
  currentYieldMcm: number;
  rechargeRateMcm: number;
  riskLevel: string;
  waterQualityStatus: string;
  areaKm2: number;
  county?: string;
  aquiferType?: string;
  depth_m?: number;
  boreholes?: number;
  lastAssessment?: string;
}

interface MonitoringData {
  date: string;
  waterLevel_m: number;
  abstraction_mcm: number;
  recharge_mcm: number;
  quality_score: number;
}

export function AquiferManagementPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAquifer, setSelectedAquifer] = useState<Aquifer | null>(null);
  const [newAquifer, setNewAquifer] = useState({ name: '', safeYield: '', county: '', aquiferType: 'Alluvial' });
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const pageSize = 5;

  const { data, isLoading } = useQuery({
    queryKey: ['aquifers', page],
    queryFn: () => apiClient.get('/hydromet/aquifers'),
  });

  const { data: monitoringData } = useQuery({
    queryKey: ['aquifer-monitoring', selectedAquifer?.id],
    queryFn: () => apiClient.get(`/hydromet/aquifers/${selectedAquifer?.id}/monitoring`),
    enabled: !!selectedAquifer,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/hydromet/aquifers', data),
    onSuccess: () => {
      toast.success('Aquifer registered successfully');
      queryClient.invalidateQueries({ queryKey: ['aquifers'] });
      setIsCreateOpen(false);
      setNewAquifer({ name: '', safeYield: '', county: '', aquiferType: 'Alluvial' });
    },
    onError: () => {
      toast.error('Failed to register aquifer');
    }
  });

  const aquifers = (data as any)?.data || [];
  const monitoring = (monitoringData as any)?.data || [];

  const filteredAquifers = aquifers.filter((a: Aquifer) => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.county && a.county.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRisk = riskFilter === 'all' || a.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const getRiskColor = (risk: string) => {
    if (risk === 'critical') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (risk === 'high') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    if (risk === 'medium') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  };

  const getQualityColor = (quality: string) => {
    if (quality === 'Excellent') return 'text-green-600 dark:text-green-400';
    if (quality === 'Good') return 'text-blue-600 dark:text-blue-400';
    if (quality === 'Fair') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const stats = {
    totalAquifers: aquifers.length,
    atRisk: aquifers.filter((a: Aquifer) => a.riskLevel === 'high' || a.riskLevel === 'critical').length,
    totalSafeYield: aquifers.reduce((sum: number, a: Aquifer) => sum + (a.safeYieldMcm || 0), 0),
    totalCurrent: aquifers.reduce((sum: number, a: Aquifer) => sum + (a.currentYieldMcm || 0), 0),
    totalBoreholes: aquifers.reduce((sum: number, a: Aquifer) => sum + (a.boreholes || 0), 0),
    totalArea: aquifers.reduce((sum: number, a: Aquifer) => sum + (a.areaKm2 || 0), 0),
  };

  const utilizationRate = stats.totalSafeYield > 0
    ? Math.round((stats.totalCurrent / stats.totalSafeYield) * 100)
    : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">Aquifer Management</h1>
          <p className="text-muted-foreground">
            Monitor groundwater resources, track sustainable yield, recharge rates, and aquifer health across ASAL counties.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Register Aquifer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Aquifer</DialogTitle>
              <DialogDescription>Add a new aquifer to the monitoring system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Aquifer Name</label>
                <Input
                  placeholder="e.g., Elwak Aquifer"
                  value={newAquifer.name}
                  onChange={(e) => setNewAquifer({ ...newAquifer, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">County</label>
                <Input
                  placeholder="e.g., Mandera"
                  value={newAquifer.county}
                  onChange={(e) => setNewAquifer({ ...newAquifer, county: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Aquifer Type</label>
                <Select value={newAquifer.aquiferType} onValueChange={(v) => setNewAquifer({ ...newAquifer, aquiferType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alluvial">Alluvial</SelectItem>
                    <SelectItem value="Basement">Basement</SelectItem>
                    <SelectItem value="Sedimentary">Sedimentary</SelectItem>
                    <SelectItem value="Volcanic">Volcanic</SelectItem>
                    <SelectItem value="Coastal">Coastal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Safe Yield (MCM/year)</label>
                <Input
                  type="number"
                  placeholder="Annual sustainable yield"
                  value={newAquifer.safeYield}
                  onChange={(e) => setNewAquifer({ ...newAquifer, safeYield: e.target.value })}
                />
              </div>
              <Button
                onClick={() =>
                  createMutation.mutate({
                    name: newAquifer.name,
                    safeYieldMcm: parseInt(newAquifer.safeYield),
                    county: newAquifer.county,
                    aquiferType: newAquifer.aquiferType,
                  })
                }
                disabled={createMutation.isPending || !newAquifer.name || !newAquifer.safeYield}
                className="w-full"
              >
                {createMutation.isPending ? 'Registering...' : 'Register Aquifer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              Aquifers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAquifers}</div>
            <p className="text-xs text-muted-foreground">Under management</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-cyan-500" />
              Safe Yield
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSafeYield}</div>
            <p className="text-xs text-muted-foreground">MCM/year total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              Abstraction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCurrent}</div>
            <p className="text-xs text-muted-foreground">{utilizationRate}% utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.atRisk}</div>
            <p className="text-xs text-muted-foreground">High/Critical stress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-500" />
              Boreholes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBoreholes}</div>
            <p className="text-xs text-muted-foreground">Active wells</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-500" />
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalArea / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">km² total area</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or county..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by risk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Aquifer Status Overview</CardTitle>
              <span className="text-sm text-muted-foreground">
                {filteredAquifers.length} of {aquifers.length} aquifers
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Loading aquifers...</p>
                  </div>
                ) : filteredAquifers.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">No aquifers found matching your criteria</p>
                  </div>
                ) : (
                  filteredAquifers.slice((page - 1) * pageSize, page * pageSize).map((aquifer: Aquifer) => {
                    const utilization = aquifer.safeYieldMcm > 0
                      ? (aquifer.currentYieldMcm / aquifer.safeYieldMcm) * 100
                      : 0;
                    const isSelected = selectedAquifer?.id === aquifer.id;
                    return (
                      <div 
                        key={aquifer.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-primary ring-1 ring-primary' : 'hover:border-muted-foreground/50'}`}
                        onClick={() => setSelectedAquifer(aquifer)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-lg">{aquifer.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {aquifer.county || 'Unknown County'}
                              <span className="text-muted-foreground/50">•</span>
                              <span>{aquifer.aquiferType || 'Unknown Type'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getRiskColor(aquifer.riskLevel)}>
                              {aquifer.riskLevel?.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className={getQualityColor(aquifer.waterQualityStatus)}>
                              {aquifer.waterQualityStatus}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Safe Yield</p>
                            <p className="font-semibold">{aquifer.safeYieldMcm} MCM/yr</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Current</p>
                            <p className="font-semibold">{aquifer.currentYieldMcm} MCM/yr</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Recharge</p>
                            <p className="font-semibold">{aquifer.rechargeRateMcm} MCM/yr</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Depth</p>
                            <p className="font-semibold">{aquifer.depth_m || '—'} m</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Utilization Rate</span>
                            <span className={`font-semibold ${utilization > 90 ? 'text-red-600' : utilization > 75 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {Math.round(utilization)}%
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(utilization, 100)} 
                            className={utilization > 90 ? '[&>div]:bg-red-500' : utilization > 75 ? '[&>div]:bg-yellow-500' : ''}
                          />
                          {utilization > 80 && (
                            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Exceeding safe yield threshold
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
            
            {filteredAquifers.length > pageSize && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {Math.ceil(filteredAquifers.length / pageSize)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(Math.ceil(filteredAquifers.length / pageSize), page + 1))}
                    disabled={page >= Math.ceil(filteredAquifers.length / pageSize)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monitoring Data
            </CardTitle>
            <CardDescription>
              {selectedAquifer ? selectedAquifer.name : 'Select an aquifer to view monitoring data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedAquifer ? (
              <Tabs defaultValue="levels">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="levels">Water Levels</TabsTrigger>
                  <TabsTrigger value="balance">Balance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="levels" className="mt-4">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monitoring}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="waterLevel_m" 
                          stroke="#3b82f6" 
                          name="Water Level (m)"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="quality_score" 
                          stroke="#10b981" 
                          name="Quality Score"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="balance" className="mt-4">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monitoring}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="abstraction_mcm" 
                          stackId="1"
                          stroke="#ef4444" 
                          fill="#ef4444"
                          fillOpacity={0.6}
                          name="Abstraction (MCM)"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="recharge_mcm" 
                          stackId="2"
                          stroke="#22c55e" 
                          fill="#22c55e"
                          fillOpacity={0.6}
                          name="Recharge (MCM)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <Eye className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Click on an aquifer card to view its monitoring data</p>
              </div>
            )}

            {selectedAquifer && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <h4 className="font-medium text-sm">Aquifer Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Area</p>
                    <p className="font-medium">{selectedAquifer.areaKm2?.toLocaleString()} km²</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Boreholes</p>
                    <p className="font-medium">{selectedAquifer.boreholes || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Aquifer Type</p>
                    <p className="font-medium">{selectedAquifer.aquiferType || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Assessment</p>
                    <p className="font-medium">{selectedAquifer.lastAssessment || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
