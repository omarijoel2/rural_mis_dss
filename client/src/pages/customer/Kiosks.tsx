import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Home } from 'lucide-react';

export function Kiosks() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Water Kiosks</h1>
        <p className="text-muted-foreground mt-1">Kiosk registry, vendor management, and sales tracking</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Kiosk Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Kiosk location mapping, vendor tracking, and sales reconciliation coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
