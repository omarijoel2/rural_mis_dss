import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export function WaterTrucking() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Water Trucking</h1>
        <p className="text-muted-foreground mt-1">Bowser management and trip tracking</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Trip Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Truck scheduling, route tracking, and delivery verification coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
