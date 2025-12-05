import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assetService } from '../../services/asset.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { ArrowLeft, Settings, MapPin, AlertCircle, Clock, CheckCircle } from 'lucide-react';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  retired: 'bg-red-100 text-red-800',
  under_maintenance: 'bg-yellow-100 text-yellow-800',
};

const WO_STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const assetId = Number(id);
  const backLink = '/core/assets';

  const { data: asset, isLoading, error } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => assetService.getAsset(assetId),
    enabled: !!assetId && !isNaN(assetId),
  });

  const { data: maintenanceHistory } = useQuery({
    queryKey: ['asset-maintenance', assetId],
    queryFn: () => assetService.getAssetMaintenanceHistory(assetId),
    enabled: !!assetId && !isNaN(assetId),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={backLink}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assets
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{asset?.name || 'Asset Details'}</h1>
            <p className="text-muted-foreground">{asset?.code || ''}</p>
          </div>
        </div>
        {asset && (
          <Badge className={STATUS_COLORS[asset.status]}>
            {asset.status.replace('_', ' ')}
          </Badge>
        )}
      </div>

      {isLoading && !asset ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Loading asset details...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-lg text-destructive">Error loading asset: {(error as Error).message}</p>
        </div>
      ) : !asset ? (
        <div className="p-6 bg-yellow-100 border border-yellow-600 rounded-lg">
          <p className="text-lg text-yellow-800">Asset not found</p>
        </div>
      ) : (
        <>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Asset Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Asset Code</p>
                <p className="font-medium">{asset.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Asset Class</p>
                <p className="font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  {asset.asset_class?.name || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Manufacturer</p>
                <p className="font-medium">{asset.manufacturer || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Model</p>
                <p className="font-medium">{asset.model || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Serial Number</p>
                <p className="font-medium">{asset.serial || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Installation Date</p>
                <p className="font-medium">
                  {asset.install_date 
                    ? new Date(asset.install_date).toLocaleDateString()
                    : '-'
                  }
                </p>
              </div>
              {asset.scheme && (
                <div>
                  <p className="text-sm text-muted-foreground">Scheme</p>
                  <p className="font-medium">{asset.scheme.name}</p>
                </div>
              )}
              {asset.dma && (
                <div>
                  <p className="text-sm text-muted-foreground">DMA</p>
                  <p className="font-medium">{asset.dma.name}</p>
                </div>
              )}
              {asset.geom && (
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {asset.geom.coordinates[1].toFixed(6)}, {asset.geom.coordinates[0].toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Open Work Orders</span>
                </div>
                <Badge variant="outline">
                  {asset.work_orders?.filter((wo: any) => wo.status !== 'completed' && wo.status !== 'cancelled').length || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Completed WOs</span>
                </div>
                <Badge variant="outline">
                  {asset.work_orders?.filter((wo: any) => wo.status === 'completed').length || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total WOs</span>
                </div>
                <Badge variant="outline">{asset.work_orders?.length || 0}</Badge>
              </div>
            </CardContent>
          </Card>

          {asset.parent && (
            <Card>
              <CardHeader>
                <CardTitle>Parent Asset</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to={`/cmms/assets/${asset.parent.id}`}>
                  <div className="text-sm">
                    <p className="font-medium">{asset.parent.name}</p>
                    <p className="text-muted-foreground">{asset.parent.code}</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {asset.work_orders && asset.work_orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WO #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asset.work_orders!.map((wo: any) => (
                  <TableRow key={wo.id}>
                    <TableCell className="font-medium">{wo.wo_num}</TableCell>
                    <TableCell>{wo.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase">
                        {wo.kind}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {wo.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={(WO_STATUS_COLORS as any)[wo.status]}>
                        {wo.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {wo.scheduled_for 
                        ? new Date(wo.scheduled_for).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Link to={`/cmms/work-orders/${wo.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No work orders found for this asset
            </p>
          )}
        </CardContent>
      </Card>

        {maintenanceHistory && maintenanceHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceHistory.map((record: any) => (
                  <div key={record.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                    <p className="font-medium">{record.description || record.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.completed_at || record.created_at).toLocaleDateString()}
                    </p>
                    {record.notes && (
                      <p className="text-sm mt-2">{record.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        </>
      )}
    </div>
  );
}
