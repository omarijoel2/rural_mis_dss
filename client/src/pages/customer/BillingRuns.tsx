import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

export function BillingRuns() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing Runs</h1>
        <p className="text-muted-foreground mt-1">Monthly billing execution and invoice generation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Billing Execution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Billing run management and invoice generation coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
