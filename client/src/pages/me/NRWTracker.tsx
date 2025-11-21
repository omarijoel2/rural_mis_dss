import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Droplet, TrendingDown, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function NRWTracker() {
  const { data: dashboard } = useQuery({
    queryKey: ['nrw-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/v1/monitoring-evaluation/nrw/dashboard');
      return res.json();
    },
  });

  const { data: initiatives } = useQuery({
    queryKey: ['nrw-initiatives'],
    queryFn: async () => {
      const res = await fetch('/api/v1/monitoring-evaluation/nrw/initiatives');
      return res.json();
    },
  });

  const dashData = dashboard?.data || {
    current_nrw_percent: 32.8,
    active_initiatives: 3,
    water_saved_m3_day: 1850,
    total_investment: 2500000,
    average_roi_percent: 185,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">NRW Program Tracker</h1>
          <p className="text-muted-foreground mt-1">Non-Revenue Water initiatives, savings tracking, and ROI analysis</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Initiative
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current NRW %</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashData.current_nrw_percent}%</div>
            <p className="text-xs text-muted-foreground">Down from 37% baseline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Saved</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashData.water_saved_m3_day.toLocaleString()} m³/day</div>
            <p className="text-xs text-muted-foreground">Cumulative savings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investment ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(dashData.average_roi_percent)}%</div>
            <p className="text-xs text-muted-foreground">Average payback ROI</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Initiative Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="proposed">Proposed</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {initiatives?.data && initiatives.data.length > 0 ? (
                  initiatives.data.map((initiative: any) => (
                    <div key={initiative.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{initiative.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Type: {initiative.type.replace('_', ' ')} | Stage: {initiative.stage}
                          </p>
                          {initiative.roi_percent && (
                            <p className="text-xs text-green-600 mt-1">ROI: {initiative.roi_percent.toFixed(1)}%</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">Cost: ${initiative.cost.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No initiatives yet</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
