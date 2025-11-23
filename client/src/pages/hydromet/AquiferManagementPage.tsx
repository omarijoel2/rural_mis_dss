import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Plus, TrendingDown, AlertTriangle } from 'lucide-react';
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
}

export function AquiferManagementPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAquifer, setNewAquifer] = useState({ name: '', safeYield: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['aquifers'],
    queryFn: () => apiClient.get('/hydromet/aquifers'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/hydromet/aquifers', data),
    onSuccess: () => {
      toast.success('Aquifer registered');
      queryClient.invalidateQueries({ queryKey: ['aquifers'] });
      setIsCreateOpen(false);
    },
  });

  const aquifers = (data as any)?.data || [];

  const getRiskColor = (risk: string) => {
    if (risk === 'critical') return 'bg-red-100 text-red-800';
    if (risk === 'high') return 'bg-orange-100 text-orange-800';
    if (risk === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const stats = {
    totalAquifers: aquifers.length,
    atRisk: aquifers.filter((a: Aquifer) => a.riskLevel === 'high' || a.riskLevel === 'critical').length,
    totalSafeYield: aquifers.reduce((sum: number, a: Aquifer) => sum + (a.safeYieldMcm || 0), 0),
    totalCurrent: aquifers.reduce((sum: number, a: Aquifer) => sum + (a.currentYieldMcm || 0), 0),
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
            Monitor groundwater resources, track sustainable yield, recharge rates, and aquifer health. Manage 7 priority aquifers across ASAL counties.
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
              <DialogTitle>Register Aquifer</DialogTitle>
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
                  })
                }
                disabled={createMutation.isPending}
                className="w-full"
              >
                Register
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Priority Aquifers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAquifers}</div>
            <p className="text-xs text-muted-foreground mt-1">Under management</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Safe Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSafeYield}</div>
            <p className="text-xs text-muted-foreground mt-1">MCM/year total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current Abstraction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCurrent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {utilizationRate}% of safe yield
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" /> At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.atRisk}</div>
            <p className="text-xs text-muted-foreground mt-1">High/Critical stress</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aquifer Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {isLoading ? (
              <p>Loading aquifers...</p>
            ) : (
              aquifers.map((aquifer: Aquifer) => {
                const utilization = aquifer.safeYieldMcm > 0
                  ? (aquifer.currentYieldMcm / aquifer.safeYieldMcm) * 100
                  : 0;
                return (
                  <div key={aquifer.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-lg">{aquifer.name}</p>
                        <p className="text-sm text-muted-foreground">{aquifer.areaKm2} km²</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getRiskColor(aquifer.riskLevel)}>
                          {aquifer.riskLevel?.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{aquifer.waterQualityStatus}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
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
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span>Utilization Rate</span>
                        <span className="font-semibold">{Math.round(utilization)}%</span>
                      </div>
                      <Progress value={Math.min(utilization, 100)} />
                      {utilization > 80 && (
                        <p className="text-xs text-red-600 mt-2">⚠️ Exceeding safe yield threshold</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
