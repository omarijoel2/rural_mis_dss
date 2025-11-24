import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function InternalAuditPage() {
  const engagements = [
    { id: 1, name: 'Financial Controls Audit', function: 'Finance', status: 'in-progress', rating: null, findings: 3 },
    { id: 2, name: 'Water Quality Testing', function: 'Operations', status: 'completed', rating: 'Effective', findings: 1 },
    { id: 3, name: 'IT Security Assessment', function: 'IT', status: 'planning', rating: null, findings: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Internal Audit</h1>
          <p className="text-muted-foreground">Audit plans, engagements, findings and recommendations</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Engagement
        </Button>
      </div>

      <div className="space-y-3">
        {engagements.map((eng) => (
          <Card key={eng.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{eng.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{eng.function}</p>
                </div>
                <Badge className={eng.status === 'completed' ? 'bg-green-500' : eng.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-500'}>
                  {eng.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              {eng.rating && <span className="font-semibold">{eng.rating}</span>}
              <span className="text-sm text-muted-foreground">{eng.findings} finding{eng.findings !== 1 ? 's' : ''}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
