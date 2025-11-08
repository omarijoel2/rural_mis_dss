import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { assetService } from '../../services/asset.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
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
import { Plus, Search, Settings, MapPin } from 'lucide-react';
import type { AssetFilters } from '../../types/cmms';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'retired', label: 'Retired' },
  { value: 'under_maintenance', label: 'Under Maintenance' },
];

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  retired: 'bg-red-100 text-red-800',
  under_maintenance: 'bg-yellow-100 text-yellow-800',
};

export function AssetsPage() {
  const [filters, setFilters] = useState<AssetFilters>({
    per_page: 15,
    page: 1,
  });

  const { data: classes } = useQuery({
    queryKey: ['asset-classes'],
    queryFn: () => assetService.getClasses(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['assets', filters],
    queryFn: () => assetService.getAssets(filters),
  });

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search, page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ 
      ...filters, 
      status: status ? (status as 'active' | 'inactive' | 'retired' | 'under_maintenance') : undefined, 
      page: 1 
    });
  };

  const handleClassFilter = (classId: string) => {
    setFilters({ ...filters, class_id: classId ? Number(classId) : undefined, page: 1 });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg">Loading assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-red-600">Error loading assets: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-muted-foreground">Manage infrastructure assets and equipment</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>

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
              value={filters.class_id?.toString() || ''} 
              onValueChange={handleClassFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
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
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Install Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((asset) => (
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
                      <Badge className={STATUS_COLORS[asset.status]}>
                        {asset.status.replace('_', ' ')}
                      </Badge>
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
                      <Link to={`/cmms/assets/${asset.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data?.data.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">No assets found</p>
              <Button>
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
    </div>
  );
}
