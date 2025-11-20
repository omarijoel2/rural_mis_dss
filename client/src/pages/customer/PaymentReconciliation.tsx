import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export function PaymentReconciliation() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Reconciliation</h1>
        <p className="text-muted-foreground mt-1">Match payments to invoices across all channels</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Reconciliation Console
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Payment matching and reconciliation workflows coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
