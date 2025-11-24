import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export function BCPPage() {
  const [showForm, setShowForm] = useState(false);

  const plans = [
    { id: 1, code: 'BCP_001', process: 'Water Treatment', rto: '4 hours', rpo: '1 hour', status: 'Active' },
    { id: 2, code: 'BCP_002', process: 'Distribution Network', rto: '8 hours', rpo: '2 hours', status: 'Active' },
    { id: 3, code: 'BCP_003', process: 'Customer Billing', rto: '24 hours', rpo: '4 hours', status: 'Draft' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Continuity Plans</h1>
          <p className="text-muted-foreground">Continuity and emergency response planning</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Plan
        </Button>
      </div>

      <div className="space-y-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{plan.process}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{plan.code}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${plan.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                  {plan.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground">RTO</span>
                <p className="font-semibold">{plan.rto}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">RPO</span>
                <p className="font-semibold">{plan.rpo}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
