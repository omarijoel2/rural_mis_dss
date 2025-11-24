import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Lock } from 'lucide-react';

export function DPOPage() {
  const consents = [
    { id: 1, purpose: 'Customer Communication', basis: 'Consent', count: 2458, status: 'Active' },
    { id: 2, purpose: 'Marketing', basis: 'Consent', count: 892, status: 'Active' },
    { id: 3, purpose: 'Service Delivery', basis: 'Contract', count: 3205, status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Privacy & Consent</h1>
          <p className="text-muted-foreground">Consent registry, data retention, DSAR handling, privacy incidents</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Record Consent
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Consents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6,555</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending DSARs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Privacy Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Consent By Purpose
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {consents.map((consent) => (
            <div key={consent.id} className="flex justify-between items-center pb-3 border-b last:border-0 last:pb-0">
              <div>
                <p className="font-semibold">{consent.purpose}</p>
                <p className="text-sm text-muted-foreground">{consent.basis}</p>
              </div>
              <span className="text-lg font-bold">{consent.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
