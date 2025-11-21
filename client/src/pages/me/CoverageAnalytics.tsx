import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Globe, Users, Droplet, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CoverageAnalytics() {
  const { data: dashboard } = useQuery({
    queryKey: ['coverage-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/v1/monitoring-evaluation/coverage/dashboard');
      return res.json();
    },
  });

  const { data: byArea } = useQuery({
    queryKey: ['coverage-by-area'],
    queryFn: async () => {
      const res = await fetch('/api/v1/monitoring-evaluation/coverage/by-area');
      return res.json();
    },
  });

  const dashData = dashboard?.data || {
    total_population: 245800,
    population_served: 193100,
    coverage_percent: 78.5,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Coverage & Equity Analytics</h1>
        <p className="text-muted-foreground mt-1">Water and sanitation coverage by area, demographic disaggregation, and equity analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Population</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashData.total_population || 245800).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all wards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Population Served</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashData.population_served || 193100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">With piped connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage Rate</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashData.coverage_percent}%</div>
            <p className="text-xs text-muted-foreground">Overall water coverage</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coverage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="by-ward" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="by-ward">By Ward</TabsTrigger>
              <TabsTrigger value="equity">Equity Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="by-ward" className="mt-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">Ward-level coverage breakdown</p>
                {byArea?.data && byArea.data.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {byArea.data.map((area: any, idx: number) => (
                      <div key={`${area.area_id}-${idx}`} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{area.area_type}</h4>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Population: {(area.population_total || 0).toLocaleString()}</span>
                              <span>Served: {(area.population_served || 0).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{area.coverage_percent?.toFixed(1)}%</div>
                            <TrendingUp className="h-3 w-3 text-green-600 mt-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No coverage data available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="equity" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Gender and income quintile disaggregation analysis</p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Demographic Breakdowns</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Gender: Male / Female population coverage differential</li>
                    <li>• Income Quintiles: Q1-Q5 water access equity metrics</li>
                    <li>• Geographic: Urban / Rural coverage disparity</li>
                    <li>• Age Groups: Child / Adult / Senior population served</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
