import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Droplet, TrendingDown, AlertCircle, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useState } from "react";

interface HydroKpi {
  id: string;
  aquifer_name: string;
  as_of: string;
  recharge_mm: number;
  abstraction_m3d: number;
  storage_index: number;
  risk_score: number;
}

export default function AquiferDashboardPage() {
  const [selectedScheme, setSelectedScheme] = useState('');
  const [selectedAquifer, setSelectedAquifer] = useState('');

  const { data: schemes, isLoading: isSchemesLoading, error: schemesError } = useQuery({
    queryKey: ['schemes'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/schemes');
      return (res as any).data.data;
    },
  });

  const { data: kpis, isLoading: isKpisLoading, error: kpisError } = useQuery({
    queryKey: ['hydro-kpis', selectedScheme],
    queryFn: async () => {
      const params = selectedScheme ? `?scheme_id=${selectedScheme}` : '';
      const res = await apiClient.get(`/api/v1/dsa/hydro/aquifers${params}`);
      return (res as any).data.data as HydroKpi[];
    },
  });

  const { data: wellfield, isLoading: isWellfieldLoading } = useQuery({
    queryKey: ['wellfield', selectedScheme, selectedAquifer],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedScheme) params.append('scheme_id', selectedScheme);
      if (selectedAquifer) params.append('aquifer', selectedAquifer);
      const res = await apiClient.get(`/api/v1/dsa/hydro/wellfield?${params}`);
      return (res as any).data.data;
    },
    enabled: !!selectedScheme,
  });

  // DEMO DATA - Replace with real aquifer recharge/abstraction trends from API
  const trendData = [
    { month: 'Jan', recharge: 45, abstraction: 3200, storage: 75 },
    { month: 'Feb', recharge: 52, abstraction: 3150, storage: 78 },
    { month: 'Mar', recharge: 38, abstraction: 3300, storage: 72 },
    { month: 'Apr', recharge: 25, abstraction: 3450, storage: 65 },
    { month: 'May', recharge: 15, abstraction: 3600, storage: 58 },
    { month: 'Jun', recharge: 8, abstraction: 3700, storage: 52 },
  ];

  const latestKpi = kpis?.[0];

  const getRiskBadge = (score: number) => {
    if (score < 0.3) return <Badge variant="default">Low Risk</Badge>;
    if (score < 0.6) return <Badge variant="secondary">Medium Risk</Badge>;
    return <Badge variant="destructive">High Risk</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Aquifer Dashboard</h1>
        <p className="text-muted-foreground">Hydrogeological analytics and groundwater monitoring</p>
      </div>

      <div className="flex gap-4">
        <Select value={selectedScheme} onValueChange={setSelectedScheme}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select scheme..." />
          </SelectTrigger>
          <SelectContent>
            {schemes?.map((scheme: any) => (
              <SelectItem key={scheme.id} value={scheme.id}>{scheme.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedAquifer} onValueChange={setSelectedAquifer}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select aquifer..." />
          </SelectTrigger>
          <SelectContent>
            {kpis?.map((kpi) => (
              <SelectItem key={kpi.aquifer_name} value={kpi.aquifer_name}>
                {kpi.aquifer_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Droplet className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Recharge</p>
                <p className="text-2xl font-bold">{latestKpi?.recharge_mm?.toFixed(0) || 0} mm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Abstraction</p>
                <p className="text-2xl font-bold">{latestKpi?.abstraction_m3d?.toFixed(0) || 0} m³/d</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Storage Index</p>
                <p className="text-2xl font-bold">{((latestKpi?.storage_index || 0) * 100).toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{((latestKpi?.risk_score || 0) * 100).toFixed(0)}%</p>
                  {latestKpi && getRiskBadge(latestKpi.risk_score)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Aquifer Balance Trends</CardTitle>
          <CardDescription>Recharge vs Abstraction over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="recharge" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Recharge (mm)" />
                <Line yAxisId="right" type="monotone" dataKey="abstraction" stroke="#ef4444" strokeWidth={2} name="Abstraction (m³/d)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Wellfield View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Wellfield Map</CardTitle>
            <CardDescription>Borehole locations and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] bg-muted rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Map visualization placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cross-Section Profile</CardTitle>
            <CardDescription>Groundwater levels across wellfield</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { well: 'BH-1', wl: 45, surface: 100 },
                  { well: 'BH-2', wl: 38, surface: 95 },
                  { well: 'BH-3', wl: 42, surface: 98 },
                  { well: 'BH-4', wl: 35, surface: 92 },
                  { well: 'BH-5', wl: 40, surface: 97 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="well" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="surface" stroke="#94a3b8" strokeWidth={2} name="Ground Surface" />
                  <Line type="monotone" dataKey="wl" stroke="#3b82f6" strokeWidth={2} name="Water Level" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
