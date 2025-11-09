import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Upload } from 'lucide-react';

export function ImportCenterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Center</h1>
        <p className="text-muted-foreground">Bulk import billing data and payment transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Under Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Import Center is currently under development. This page will include:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• Billing invoice CSV upload</li>
            <li>• M-Pesa payment transaction import</li>
            <li>• Import history and status tracking</li>
            <li>• Error validation and reporting</li>
            <li>• Duplicate detection</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
