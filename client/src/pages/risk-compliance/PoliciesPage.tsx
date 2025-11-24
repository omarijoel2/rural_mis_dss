import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';

export function PoliciesPage() {
  const policies = [
    { id: 1, code: 'POL_001', title: 'Information Security Policy', status: 'published', version: 3, audience: 'All Staff', effectiveDate: '2025-01-01' },
    { id: 2, code: 'POL_002', title: 'Health & Safety Policy', status: 'published', version: 2, audience: 'All Staff', effectiveDate: '2024-06-01' },
    { id: 3, code: 'POL_003', title: 'Data Privacy & Consent Policy', status: 'review', version: 1, audience: 'Data Handlers', effectiveDate: null },
  ];

  const statusColors = { published: 'bg-green-500', review: 'bg-yellow-500', archived: 'bg-gray-500' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Policies & SOPs</h1>
          <p className="text-muted-foreground">Policy lifecycle, attestations, and evidence</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Policy
        </Button>
      </div>

      <div className="space-y-3">
        {policies.map((policy) => (
          <Card key={policy.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{policy.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{policy.code} • v{policy.version}</p>
                  </div>
                </div>
                <Badge className={statusColors[policy.status as keyof typeof statusColors]}>
                  {policy.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Audience: {policy.audience}</span>
                {policy.effectiveDate && <span className="text-muted-foreground">Since: {policy.effectiveDate}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
