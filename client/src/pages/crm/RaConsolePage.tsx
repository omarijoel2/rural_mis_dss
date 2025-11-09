import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { AlertTriangle } from 'lucide-react';

export function RaConsolePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Revenue Assurance Console</h1>
        <p className="text-muted-foreground">Monitor and manage revenue assurance cases</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Under Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Revenue Assurance Console is currently under development. This page will include:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• Detection rules configuration</li>
            <li>• Active cases dashboard</li>
            <li>• Triage board for case management</li>
            <li>• Statistical anomaly detection</li>
            <li>• Tamper detection alerts</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
