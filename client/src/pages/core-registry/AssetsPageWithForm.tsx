import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { assetService } from '../../services/asset.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Plus, Search, Settings, MapPin, Edit, Wrench, Droplet, Home, Trash2 } from 'lucide-react';
import type { Asset, AssetFilters } from '../../types/cmms';
import { AssetFormDialog } from '../../components/cmms/AssetFormDialog';
import { PredictionsConnector } from '../../components/core-ops/PredictionsConnector';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 'none', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'retired', label: 'Retired' },
  { value: 'under_maintenance', label: 'Under Maintenance' },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  retired: 'bg-red-100 text-red-800',
  under_maintenance: 'bg-yellow-100 text-yellow-800',
};

export function AssetsPageWithForm() {
  const [filters, setFilters] = useState<AssetFilters>({
    per_page: 15,
    page: 1,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>();
  const [deleteAsset, setDeleteAsset] = useState<Asset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: classes } = useQuery({
    queryKey: ['asset-classes'],
    queryFn: () => assetService.getClasses(),
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['assets', filters],
    queryFn: () => assetService.getAssets(filters),
  });

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search, page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ 
      ...filters, 
      status: (status && status !== 'none') ? (status as 'active' | 'inactive' | 'retired' | 'under_maintenance') : undefined, 
      page: 1 
    });
  };

  const handleClassFilter = (classId: string) => {
    setFilters({ ...filters, class_id: (classId && classId !== 'none') ? Number(classId) : undefined, page: 1 });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAsset) return;
    
    setIsDeleting(true);
    try {
      await assetService.deleteAsset(deleteAsset.id);
      toast.success(`${deleteAsset.name} has been deleted.`);
      setDeleteAsset(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Could not delete asset');
    } finally {
      setIsDeleting(false);
    }
  };

  const getLinkedEntityIcon = (asset: Asset) => {
    if (asset.source_id) return <Droplet className="h-4 w-4 text-blue-500" />;
    if (asset.kiosk_id) return <Home className="h-4 w-4 text-green-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Infrastructure Assets</h1>
          <p className="text-muted-foreground">Manage water supply assets, equipment, and infrastructure</p>
        </div>
        <Button onClick={() => {
          setEditingAsset(undefined);
          setDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList>
          <TabsTrigger value="inventory">Asset Registry</TabsTrigger>
          <TabsTrigger value="predictions">Predictive Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {isLoading && !data ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-lg text-muted-foreground">Loading assets...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-lg text-destructive">Error loading assets: {(error as Error).message}</p>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by code, name, or serial..."
                        className="pl-9"
                        value={filters.search || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Select value={filters.status || ''} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.class_id?.toString() || 'none'} 
                    onValueChange={handleClassFilter}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">All Classes</SelectItem>
                      {classes?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Linked To</TableHead>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead>Install Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.data?.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.code}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {asset.geom && <MapPin className="h-4 w-4 text-muted-foreground" />}
                              {asset.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Settings className="h-4 w-4 text-muted-foreground" />
                              {asset.asset_class?.name || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[asset.status] || 'bg-gray-100'}>
                              {asset.status?.replace('_', ' ') || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getLinkedEntityIcon(asset)}
                              {asset.source?.name && (
                                <span className="text-sm text-muted-foreground">
                                  {asset.source.code || asset.source.name}
                                </span>
                              )}
                              {asset.kiosk?.kiosk_code && (
                                <span className="text-sm text-muted-foreground">
                                  {asset.kiosk.kiosk_code}
                                </span>
                              )}
                              {!asset.source_id && !asset.kiosk_id && (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {asset.manufacturer || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {asset.install_date 
                              ? new Date(asset.install_date).toLocaleDateString()
                              : '-'
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Link to={`/core/assets/${asset.id}`}>
                                <Button variant="ghost" size="sm" title="View Details">
                                  View
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                title="Edit Asset"
                                onClick={() => {
                                  setEditingAsset(asset);
                                  setDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Link to={`/cmms/work-orders?asset_id=${asset.id}`}>
                                <Button variant="ghost" size="sm" title="View Work Orders">
                                  <Wrench className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                title="Delete Asset"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteAsset(asset)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {data?.data?.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-12">
                    <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground mb-4">No assets found</p>
                    <Button onClick={() => {
                      setEditingAsset(undefined);
                      setDialogOpen(true);
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Asset
                    </Button>
                  </div>
                )}

                {data && data.total > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {data.from} to {data.to} of {data.total} assets
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={data.current_page === 1}
                        onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={data.current_page === data.last_page}
                        onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions">
          <PredictionsConnector />
        </TabsContent>
      </Tabs>

      <AssetFormDialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingAsset(undefined);
        }}
        asset={editingAsset}
      />

      <AlertDialog open={!!deleteAsset} onOpenChange={(open) => !open && setDeleteAsset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteAsset?.name}"? This action cannot be undone.
              Any linked work orders or maintenance records may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
