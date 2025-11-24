import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle } from 'lucide-react';

export function HSEPage() {
  const kpis = [
    { label: 'LTIFR', value: '1.2', unit: 'per 200k hours', trend: 'down' },
    { label: 'TRIR', value: '2.5', unit: 'per 200k hours', trend: 'up' },
    { label: 'Open CAPAs', value: '5', unit: 'actions', trend: 'down' },
    { label: 'Near Misses', value: '12', unit: 'this quarter', trend: 'up' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Health, Safety & Environment</h1>
          <p className="text-muted-foreground">HSE incidents, inspections, grievances and social safeguards</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Report Incident
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.unit}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-semibold">Minor Cut - Warehouse</p>
                <p className="text-sm text-muted-foreground">2025-11-23 • Verified</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-semibold">Near Miss - Slippery Floor</p>
                <p className="text-sm text-muted-foreground">2025-11-22 • Closed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
