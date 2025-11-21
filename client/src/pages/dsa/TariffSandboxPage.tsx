import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Play, Download } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface TariffScenario {
  id: string;
  name: string;
  status: 'draft' | 'simulated' | 'approved';
  results?: {
    projected_revenue: number;
    avg_bill_by_quintile: number[];
    affordability_pct: number[];
    sufficiency_pct: number;
  };
}

export default function TariffSandboxPage() {
  const [formData, setFormData] = useState({
    name: '',
    scheme_id: '',
    lifeline_enabled: true,
    fixed_charge: 200,
    blocks: [
      { min: 0, max: 10, rate: 25 },
      { min: 10, max: 30, rate: 50 },
      { min: 30, max: 999, rate: 75 },
    ],
    elasticity: 0.15,
  });

  const { data: schemes } = useQuery({
    queryKey: ['schemes'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/schemes');
      return (res as any).data.data;
    },
  });

  const { data: scenarios, refetch } = useQuery({
    queryKey: ['tariff-scenarios'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/dsa/tariffs');
      return (res as any).data.data as TariffScenario[];
    },
  });

  const simulateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiClient.post('/api/v1/dsa/tariffs', data);
      return (res as any).data;
    },
    onSuccess: () => {
      toast.success('Tariff simulation completed');
      refetch();
    },
    onError: () => {
      toast.error('Failed to run simulation');
    },
  });

  const updateBlock = (index: number, field: string, value: number) => {
    const blocks = [...formData.blocks];
    blocks[index] = { ...blocks[index], [field]: value };
    setFormData({ ...formData, blocks });
  };

  const addBlock = () => {
    setFormData({
      ...formData,
      blocks: [...formData.blocks, { min: 0, max: 100, rate: 50 }],
    });
  };

  // Sample results data
  const affordabilityData = [
    { quintile: 'Q1 (Poorest)', current: 8, proposed: 6 },
    { quintile: 'Q2', current: 5, proposed: 4 },
    { quintile: 'Q3', current: 3, proposed: 3 },
    { quintile: 'Q4', current: 2, proposed: 2 },
    { quintile: 'Q5 (Richest)', current: 1, proposed: 1.5 },
  ];

  const revenueData = [
    { category: 'Residential', current: 450000, proposed: 520000 },
    { category: 'Commercial', current: 280000, proposed: 295000 },
    { category: 'Industrial', current: 180000, proposed: 175000 },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tariff Sandbox</h1>
        <p className="text-muted-foreground">Design and simulate tariff structures for equity analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tariff Builder */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tariff Design</CardTitle>
            <CardDescription>Configure tariff structure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Scenario Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Pro-Poor Tariff 2025"
              />
            </div>

            <div>
              <Label>Fixed Charge (KES)</Label>
              <Input
                type="number"
                value={formData.fixed_charge}
                onChange={(e) => setFormData({ ...formData, fixed_charge: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Lifeline Tariff</Label>
              <Switch
                checked={formData.lifeline_enabled}
                onCheckedChange={(v) => setFormData({ ...formData, lifeline_enabled: v })}
              />
            </div>

            <div>
              <Label>Block Tariff Structure</Label>
              <div className="space-y-3 mt-2">
                {formData.blocks.map((block, index) => (
                  <div key={index} className="p-3 border rounded-md space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Block {index + 1}</span>
                      {index > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setFormData({ ...formData, blocks: formData.blocks.filter((_, i) => i !== index) })}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Min (m³)</Label>
                        <Input
                          type="number"
                          value={block.min}
                          onChange={(e) => updateBlock(index, 'min', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Max (m³)</Label>
                        <Input
                          type="number"
                          value={block.max}
                          onChange={(e) => updateBlock(index, 'max', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Rate (KES)</Label>
                        <Input
                          type="number"
                          value={block.rate}
                          onChange={(e) => updateBlock(index, 'rate', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={addBlock} className="w-full">
                  Add Block
                </Button>
              </div>
            </div>

            <div>
              <Label>Demand Elasticity: {formData.elasticity}</Label>
              <Slider
                value={[formData.elasticity]}
                onValueChange={([v]) => setFormData({ ...formData, elasticity: v })}
                min={0}
                max={0.5}
                step={0.05}
              />
            </div>

            <Button
              className="w-full"
              onClick={() => simulateMutation.mutate(formData)}
              disabled={!formData.name || simulateMutation.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              Run Simulation
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scenario List */}
          <Card>
            <CardHeader>
              <CardTitle>Tariff Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Revenue Sufficiency</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenarios?.map((scenario) => (
                    <TableRow key={scenario.id}>
                      <TableCell className="font-medium">{scenario.name}</TableCell>
                      <TableCell>
                        <Badge variant={scenario.status === 'approved' ? 'default' : 'secondary'}>
                          {scenario.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {scenario.results?.sufficiency_pct ? `${scenario.results.sufficiency_pct.toFixed(0)}%` : '-'}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Affordability Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Affordability by Income Quintile</CardTitle>
              <CardDescription>% of household income spent on water</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={affordabilityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quintile" />
                    <YAxis label={{ value: '% of Income', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="current" fill="#94a3b8" name="Current Tariff" />
                    <Bar dataKey="proposed" fill="#3b82f6" name="Proposed Tariff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Projection */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Projection by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="current" fill="#10b981" name="Current (KES)" />
                    <Bar dataKey="proposed" fill="#3b82f6" name="Proposed (KES)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
