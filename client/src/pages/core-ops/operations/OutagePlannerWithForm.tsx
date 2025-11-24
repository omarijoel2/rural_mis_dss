import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle } from 'lucide-react';
import { outagesAPI, schemesAPI } from '@/lib/api';
import { OutageForm } from '@/components/forms/OutageForm';

const stateColors: Record<string, string> = {
  draft: 'bg-gray-500',
  approved: 'bg-blue-500',
  live: 'bg-red-500',
  restored: 'bg-green-500',
  closed: 'bg-gray-600',
};

export function OutagePlannerWithForm() {
  const [showForm, setShowForm] = useState(false);

  const { data: outages, refetch: refetchOutages } = useQuery({
    queryKey: ['outages'],
    queryFn: async () => {
      const laravel = await outagesAPI.list();
      if (laravel) return laravel;
      return {
        data: [
          { id: 1, schemeId: 1, cause: 'planned', state: 'draft', reason: 'Pump maintenance', estimatedAffectedPopulation: 8900 },
          { id: 2, schemeId: 1, cause: 'fault', state: 'live', reason: 'Power outage', estimatedAffectedPopulation: 4500 },
        ],
      };
    },
  });

  const { data: schemes } = useQuery({
    queryKey: ['schemes-for-outages'],
    queryFn: async () => {
      const laravel = await schemesAPI.list();
      if (laravel) return laravel;
      return {
        data: [
          { id: 1, name: 'Kisii Urban Scheme' },
          { id: 2, name: 'Kericho Town Scheme' },
        ],
      };
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      await outagesAPI.create(data);
      setShowForm(false);
      refetchOutages();
    } catch (error) {
      console.error('Error planning outage:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Outage Planner</h1>
          <p className="text-muted-foreground">Plan and manage service interruptions</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Plan Outage
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Service Outage</CardTitle>
          </CardHeader>
          <CardContent>
            <OutageForm
              onSubmit={handleSubmit}
              isLoading={false}
              schemeOptions={schemes?.data || []}
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {outages?.data?.map((outage: any) => (
          <Card key={outage.id} className="border-l-4" style={{ borderLeftColor: stateColors[outage.state]?.split('-')[1] ? '#' + stateColors[outage.state] : '#gray' }}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    {outage.reason}
                  </CardTitle>
                </div>
                <Badge className={stateColors[outage.state] || 'bg-gray-500'}>
                  {outage.state}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Cause</span>
                  <div className="font-semibold text-sm">{outage.cause?.replace(/_/g, ' ')}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Affected Population</span>
                  <div className="font-semibold text-sm">{outage.estimatedAffectedPopulation?.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Scheduled Start</span>
                  <div className="font-semibold text-sm">{outage.scheduledStart ? new Date(outage.scheduledStart).toLocaleDateString() : '-'}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Scheduled End</span>
                  <div className="font-semibold text-sm">{outage.scheduledEnd ? new Date(outage.scheduledEnd).toLocaleDateString() : '-'}</div>
                </div>
              </div>
              {outage.notes && (
                <div className="text-sm text-muted-foreground border-t pt-3">
                  {outage.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
