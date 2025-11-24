import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

export function RegulatoryReportingPage() {
  const returns = [
    { id: 1, name: 'WARIS Annual Report', dueDate: '2025-12-31', status: 'in-draft', version: 2 },
    { id: 2, name: 'Asset Management Return', dueDate: '2025-11-30', status: 'validation-errors', version: 1 },
    { id: 3, name: 'Financial Performance Report', dueDate: '2026-01-15', status: 'submitted', version: 1 },
  ];

  const statusColors = { 'in-draft': 'bg-yellow-500', 'validation-errors': 'bg-red-500', submitted: 'bg-green-500' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Regulatory Reporting</h1>
          <p className="text-muted-foreground">WARIS and other regulatory returns</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Return
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {returns.map((ret) => (
          <Card key={ret.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {ret.name}
                </CardTitle>
                <Badge className={statusColors[ret.status as keyof typeof statusColors]}>
                  {ret.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Due: {ret.dueDate}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">v{ret.version}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
