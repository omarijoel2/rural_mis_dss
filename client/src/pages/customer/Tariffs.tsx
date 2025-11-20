import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export function Tariffs() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Tariffs</h1>
        <p className="text-muted-foreground mt-1">Water pricing structures by customer category</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Tariff Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Tariff creation, block rates, and versioning coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
