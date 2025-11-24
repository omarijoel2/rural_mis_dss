import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { assetsAPI, schemesAPI } from '@/lib/api';
import { AssetForm } from '@/components/forms/AssetForm';
import { PredictionsConnector } from '@/components/core-ops/PredictionsConnector';

export function AssetsPageWithForm() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: assets, refetch: refetchAssets } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const laravel = await assetsAPI.list();
      if (laravel) return laravel;
      return {
        data: [
          { id: 1, code: 'PUMP_001', name: 'Main Pump', type: 'pump', status: 'operational', condition: 'good' },
          { id: 2, code: 'PIPE_001', name: 'Primary Pipeline', type: 'pipe', status: 'operational', condition: 'fair' },
          { id: 3, code: 'RES_001', name: 'Main Reservoir', type: 'reservoir', status: 'operational', condition: 'good' },
        ],
      };
    },
  });

  const { data: schemes } = useQuery({
    queryKey: ['schemes-for-assets'],
    queryFn: async () => {
      const laravel = await schemesAPI.list();
      if (laravel) return laravel;
      return {
        data: [
          { id: 1, name: 'Lodwar Water Supply Scheme' },
        ],
      };
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      if (editingId) {
        await assetsAPI.update(editingId, data);
      } else {
        await assetsAPI.create(data);
      }
      setShowForm(false);
      setEditingId(null);
      refetchAssets();
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Infrastructure Assets</h1>
          <p className="text-muted-foreground">Manage water supply assets with predictive maintenance</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Asset
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="predictions">Predictive Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create Asset</CardTitle>
              </CardHeader>
              <CardContent>
                <AssetForm
                  onSubmit={handleSubmit}
                  isLoading={false}
                  schemeOptions={schemes?.data || []}
                />
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets?.data?.map((asset: any) => (
              <Card key={asset.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    <Badge className="text-xs">{asset.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm"><span className="font-semibold">Code:</span> {asset.code}</div>
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
        </TabsContent>

        <TabsContent value="predictions">
          <PredictionsConnector />
        </TabsContent>
      </Tabs>
    </div>
  );
}
