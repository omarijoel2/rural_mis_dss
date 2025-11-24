import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export function IncidentsPage() {
  const [showForm, setShowForm] = useState(false);

  const incidents = [
    { id: 1, title: 'Water Quality Issue - High Turbidity', type: 'operational', severity: 'high', status: 'investigating', date: '2025-11-24' },
    { id: 2, title: 'Staff Safety - Minor Cut', type: 'HSE', severity: 'low', status: 'closed', date: '2025-11-23' },
    { id: 3, title: 'System Access Anomaly', type: 'security', severity: 'medium', status: 'triaged', date: '2025-11-24' },
  ];

  const statusColors = { new: 'bg-gray-500', triaged: 'bg-blue-500', investigating: 'bg-orange-500', actioning: 'bg-yellow-500', verified: 'bg-green-500', closed: 'bg-gray-600' };
  const severityColors = { low: 'bg-green-500', medium: 'bg-yellow-500', high: 'bg-orange-500', critical: 'bg-red-500' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Incidents & Issues</h1>
          <p className="text-muted-foreground">Operational, HSE, privacy and compliance incidents</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Report Incident
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {incidents.map((incident) => (
          <Card key={incident.id}>
            <CardHeader>
              <CardTitle className="text-base">{incident.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Badge className={severityColors[incident.severity as keyof typeof severityColors]}>
                  {incident.severity}
                </Badge>
                <Badge className={statusColors[incident.status as keyof typeof statusColors]}>
                  {incident.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{incident.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
