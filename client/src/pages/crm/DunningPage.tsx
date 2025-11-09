import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Receipt } from 'lucide-react';

export function DunningPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dunning & Collections</h1>
        <p className="text-muted-foreground">Manage overdue accounts and collection workflows</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Under Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Dunning & Collections Dashboard is currently under development. This page will include:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• Aging report with account breakdown</li>
            <li>• Automated dunning notice generation</li>
            <li>• Disconnection lists by aging bucket</li>
            <li>• Payment plan tracking</li>
            <li>• Collection workflow management</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
