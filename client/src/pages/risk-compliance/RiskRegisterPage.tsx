import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export function RiskRegisterPage() {
  const [showForm, setShowForm] = useState(false);

  const risks = [
    { id: 1, title: 'Water Quality Contamination', category: 'Operational', owner: 'John Smith', likelihood: 'Medium', impact: 'High', residualScore: 12, status: 'Active' },
    { id: 2, title: 'Pump Failure', category: 'Operational', owner: 'Jane Doe', likelihood: 'Low', impact: 'High', residualScore: 6, status: 'Active' },
    { id: 3, title: 'Data Breach', category: 'IT/Privacy', owner: 'Mike Johnson', likelihood: 'Low', impact: 'Critical', residualScore: 8, status: 'Monitoring' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Risk Register</h1>
          <p className="text-muted-foreground">Enterprise, scheme, and process-level risks</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Register Risk
        </Button>
      </div>

      <div className="space-y-4">
        {risks.map((risk) => (
          <Card key={risk.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-1" />
                  <div>
                    <CardTitle className="text-lg">{risk.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{risk.category}</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-600 text-xs font-medium">
                  {risk.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Owner</span>
                  <p className="font-semibold text-sm">{risk.owner}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Likelihood</span>
                  <p className="font-semibold text-sm">{risk.likelihood}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Impact</span>
                  <p className="font-semibold text-sm">{risk.impact}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
