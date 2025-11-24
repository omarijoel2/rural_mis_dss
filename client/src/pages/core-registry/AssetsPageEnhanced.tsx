import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { assetsAPI } from '@/lib/api';
import { PredictionsConnector } from '@/components/core-ops/PredictionsConnector';

export function AssetsPageEnhanced() {
  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const laravel = await assetsAPI.list();
      if (laravel) return laravel;
      // Fallback to mock
      return {
        data: [
          { id: 1, code: 'PUMP_001', name: 'Main Pump', type: 'pump', status: 'operational', condition: 'good' },
          { id: 2, code: 'PIPE_001', name: 'Primary Pipeline', type: 'pipe', status: 'operational', condition: 'fair' },
          { id: 3, code: 'RES_001', name: 'Main Reservoir', type: 'reservoir', status: 'operational', condition: 'good' },
        ],
      };
    },
  });

  const conditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      good: 'bg-green-500',
      fair: 'bg-yellow-500',
      poor: 'bg-orange-500',
      critical: 'bg-red-500',
    };
    return colors[condition] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Water Infrastructure Assets</h1>
        <p className="text-muted-foreground">View and manage water supply assets with predictive insights</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Predictive Maintenance Alerts</h2>
        <PredictionsConnector />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Asset Inventory</h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading assets...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets?.data?.map((asset: any) => (
              <Card key={asset.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{asset.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm"><span className="font-semibold">Code:</span> {asset.code}</div>
                  <div className="text-sm"><span className="font-semibold">Type:</span> {asset.type}</div>
                  <div className="text-sm">
                    <span className="font-semibold">Status:</span>{' '}
                    <Badge className={asset.status === 'operational' ? 'bg-green-500' : 'bg-gray-500'}>
                      {asset.status}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Condition:</span>{' '}
                    <Badge className={conditionColor(asset.condition)}>
                      {asset.condition}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
