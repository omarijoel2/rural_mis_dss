import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

export function Connections() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Connection Applications</h1>
        <p className="text-muted-foreground mt-1">New service requests and approval workflow</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Application Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Connection application processing, KYC, and installation tracking coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
