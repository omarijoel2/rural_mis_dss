import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Phone } from 'lucide-react';

export function Tickets() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CRM Tickets</h1>
        <p className="text-muted-foreground mt-1">Customer support ticket management and SLA tracking</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Ticket Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Ticket creation, assignment, and resolution tracking coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
