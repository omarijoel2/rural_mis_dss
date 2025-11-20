import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export function MeterRoutes() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meter Reading Routes</h1>
        <p className="text-muted-foreground mt-1">Route planning and reading cycle management</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Route creation, assignment, and reading cycle tracking coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
