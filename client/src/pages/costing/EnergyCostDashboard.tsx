import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Zap, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function EnergyCostDashboard() {
  const { data: dashboard } = useQuery({
    queryKey: ['energy-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/v1/costing/energy/dashboard');
      return res.json();
    },
  });

  const { data: trendData } = useQuery({
    queryKey: ['energy-trend'],
    queryFn: async () => {
      const res = await fetch('/api/v1/costing/energy/specific-energy-trend?months=12');
      return res.json();
    },
  });

  const dashData = dashboard?.data || {
    current_tariff: null,
    avg_blended_rate: 12.15,
    total_consumption_kwh: 125400,
    total_cost: 1893600,
    specific_energy_kwh_m3: 0.42,
    cost_per_m3: 6.35,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Energy Cost Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Energy consumption analytics, specific energy trends, and cost optimization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashData.total_consumption_kwh.toLocaleString()} kWh</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {dashData.total_cost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Energy expenditure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specific Energy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashData.specific_energy_kwh_m3} kWh/m³</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Improving efficiency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost per m³</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {dashData.cost_per_m3}</div>
            <p className="text-xs text-muted-foreground">Energy cost allocation</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="specific-energy" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="specific-energy">Specific Energy Trend</TabsTrigger>
          <TabsTrigger value="cost-breakdown">Cost Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="specific-energy">
          <Card>
            <CardHeader>
              <CardTitle>Specific Energy (kWh/m³) - 12 Month Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={trendData?.data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="kwh_per_m3" stroke="#8884d8" name="kWh/m³" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost-breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Energy Cost per m³ - 12 Month Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={trendData?.data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cost_per_m3" fill="#82ca9d" name="Cost per m³ (KES)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {dashData.current_tariff && (
        <Card>
          <CardHeader>
            <CardTitle>Current Tariff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tariff Name</p>
                <p className="font-medium">{dashData.current_tariff.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peak Rate</p>
                <p className="font-medium">{dashData.current_tariff.currency} {dashData.current_tariff.peak_rate}/kWh</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Off-Peak Rate</p>
                <p className="font-medium">{dashData.current_tariff.currency} {dashData.current_tariff.offpeak_rate}/kWh</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
