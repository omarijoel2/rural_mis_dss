import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { assetService } from '../../services/asset.service';

export function AssetsPage() {
  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetService.getAssets({ per_page: 12 }),
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Water Infrastructure Assets</h1>
        <p className="text-muted-foreground">View and manage water supply assets</p>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets?.data?.map((asset: any) => (
            <Card key={asset.id}>
              <CardHeader>
                <CardTitle className="text-lg">{asset.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><span className="font-semibold">Code:</span> {asset.code}</div>
                <div><span className="font-semibold">Type:</span> {asset.type}</div>
                <div><span className="font-semibold">Status:</span> <Badge>{asset.status}</Badge></div>
                <div><span className="font-semibold">Condition:</span> <Badge variant="secondary">{asset.condition}</Badge></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
