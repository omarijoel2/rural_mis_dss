import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export function ConnectorGallery() {
  const connectorTypes = [
    { name: 'SCADA', description: 'OPC-UA / MQTT telemetry', status: 'available' },
    { name: 'AMI', description: 'DLMS / CSV / S3 meter data', status: 'available' },
    { name: 'ERP', description: 'GL journal integration', status: 'available' },
    { name: 'WARIS', description: 'Regulator reporting', status: 'available' },
    { name: 'NDMA', description: 'Early warning feeds', status: 'available' },
    { name: 'Payments', description: 'M-Pesa / Airtel Money', status: 'available' },
    { name: 'Messaging', description: 'SMS / WhatsApp / Email', status: 'available' },
    { name: 'Custom', description: 'Build your own', status: 'available' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connector Gallery</h1>
        <p className="text-muted-foreground">
          Pre-built adapters for SCADA, AMI, ERP, and external systems
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {connectorTypes.map((connector) => (
          <Card key={connector.name} className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{connector.name}</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription className="text-xs">{connector.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" className="w-full">
                Setup Connector
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
