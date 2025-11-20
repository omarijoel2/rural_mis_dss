import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Droplets, TrendingDown, TrendingUp, Wrench, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export function NRWDashboard() {
  const [activeTab, setActiveTab] = useState<'snapshots' | 'interventions'>('snapshots');

  const { data: snapshots, isLoading: snapshotsLoading } = useQuery({
    queryKey: ['nrw-snapshots'],
    queryFn: () => coreOpsService.nrw.getSnapshots({ per_page: 50 }),
    enabled: activeTab === 'snapshots',
  });

  const { data: interventions, isLoading: interventionsLoading } = useQuery({
    queryKey: ['nrw-interventions'],
    queryFn: () => coreOpsService.nrw.getInterventions({ per_page: 50 }),
    enabled: activeTab === 'interventions',
  });

  const getNRWColor = (nrwPct: number) => {
    if (nrwPct < 15) return 'text-green-600';
    if (nrwPct < 25) return 'text-yellow-600';
    if (nrwPct < 35) return 'text-orange-600';
    return 'text-red-600';
  };

  const getInterventionIcon = (type: string) => {
    switch (type) {
      case 'leak_repair':
        return <Wrench className="h-4 w-4" />;
      case 'meter_replacement':
        return <Droplets className="h-4 w-4" />;
      default:
        return <TrendingDown className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">NRW & Water Balance</h1>
          <p className="text-muted-foreground">Non-Revenue Water monitoring and intervention tracking</p>
        </div>
        <Button>
          <Droplets className="mr-2 h-4 w-4" />
          Record Snapshot
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-muted">
          <TabsTrigger value="snapshots">NRW Snapshots</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
        </TabsList>

        <TabsContent value="snapshots" className="mt-6">
          {snapshotsLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-lg text-muted-foreground">Loading NRW snapshots...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {snapshots?.data.map((snapshot) => (
                  <Card key={snapshot.id} className="bg-card text-card-foreground hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base text-foreground">
                            {snapshot.dma?.name || 'Unknown DMA'}
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(snapshot.as_of), 'PPP')}
                          </CardDescription>
                        </div>
                        <div className={`text-2xl font-bold ${getNRWColor(snapshot.nrw_pct)}`}>
                          {snapshot.nrw_pct.toFixed(1)}%
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">System Input</div>
                          <div className="font-medium text-foreground">
                            {snapshot.system_input_volume_m3.toLocaleString()} m³
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">NRW Volume</div>
                          <div className="font-medium text-foreground">
                            {snapshot.nrw_m3.toLocaleString()} m³
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Billed Authorized:</span>
                          <span className="font-medium text-foreground">
                            {snapshot.billed_authorized_m3.toLocaleString()} m³
                          </span>
                        </div>
                        {snapshot.unbilled_authorized_m3 && snapshot.unbilled_authorized_m3 > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Unbilled Authorized:</span>
                            <span className="font-medium text-foreground">
                              {snapshot.unbilled_authorized_m3.toLocaleString()} m³
                            </span>
                          </div>
                        )}
                        {snapshot.apparent_losses_m3 && snapshot.apparent_losses_m3 > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Apparent Losses:</span>
                            <span className="font-medium text-foreground">
                              {snapshot.apparent_losses_m3.toLocaleString()} m³
                            </span>
                          </div>
                        )}
                        {snapshot.real_losses_m3 && snapshot.real_losses_m3 > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Real Losses:</span>
                            <span className="font-medium text-foreground">
                              {snapshot.real_losses_m3.toLocaleString()} m³
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {snapshots?.data.length === 0 && (
                <Card className="bg-card text-card-foreground">
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <Droplets className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground mb-4">No NRW snapshots recorded</p>
                    <Button>Record First Snapshot</Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="interventions" className="mt-6">
          {interventionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-lg text-muted-foreground">Loading interventions...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {interventions?.data.map((intervention) => (
                  <Card key={intervention.id} className="bg-card text-card-foreground hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getInterventionIcon(intervention.type)}
                          <div>
                            <CardTitle className="text-base text-foreground capitalize">
                              {intervention.type.replace('_', ' ')}
                            </CardTitle>
                            <CardDescription>
                              {intervention.dma?.name || intervention.asset?.name || 'General'}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {format(new Date(intervention.date), 'PP')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {intervention.estimated_savings_m3d && (
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="text-xs text-muted-foreground">Est. Savings</div>
                              <div className="font-medium text-foreground">
                                {intervention.estimated_savings_m3d.toLocaleString()} m³/day
                              </div>
                            </div>
                          </div>
                        )}
                        {intervention.cost && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs text-muted-foreground">Cost</div>
                              <div className="font-medium text-foreground">
                                ${intervention.cost.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        )}
                        {intervention.responsible && (
                          <div>
                            <div className="text-xs text-muted-foreground">Responsible</div>
                            <div className="font-medium text-foreground">{intervention.responsible}</div>
                          </div>
                        )}
                      </div>
                      {intervention.notes && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-xs text-muted-foreground">{intervention.notes}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {interventions?.data.length === 0 && (
                <Card className="bg-card text-card-foreground">
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground mb-4">No interventions recorded</p>
                    <Button>Record First Intervention</Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
