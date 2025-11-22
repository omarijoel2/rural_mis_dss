import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { partService } from '../../services/part.service';
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
import { Plus, Search, Package, AlertTriangle, Edit } from 'lucide-react';
import type { Part, PartFilters } from '../../types/cmms';
import { PartFormDialog } from '../../components/cmms/PartFormDialog';

export function PartsPage() {
  const [filters, setFilters] = useState<PartFilters>({
    per_page: 15,
    page: 1,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | undefined>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['parts', filters],
    queryFn: () => partService.getParts(filters),
  });

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search, page: 1 });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Parts Inventory</h1>
          <p className="text-muted-foreground">Manage spare parts and supplies</p>
        </div>
        <Button onClick={() => {
          setEditingPart(undefined);
          setDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Part
        </Button>
      </div>

      {isLoading && !data ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Loading parts...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-lg text-destructive">Error loading parts: {(error as Error).message}</p>
        </div>
      ) : (
        <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by code, name, or category..."
                  className="pl-9"
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((part) => {
                  const stockLevel = part.stock_balance || 0;
                  const reorderLevel = part.reorder_level || 0;
                  const needsReorder = stockLevel <= reorderLevel;

                  return (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">{part.code}</TableCell>
                      <TableCell>{part.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {part.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{part.unit}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {part.unit_cost 
                          ? `$${part.unit_cost.toFixed(2)}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {needsReorder && stockLevel > 0 && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                          <span className={needsReorder ? 'text-orange-500 font-medium' : ''}>
                            {stockLevel}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {reorderLevel || '-'}
                      </TableCell>
                      <TableCell>
                        {stockLevel === 0 ? (
                          <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                        ) : needsReorder ? (
                          <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingPart(part);
                              setDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {data?.data.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">No parts found</p>
              <Button onClick={() => {
                setEditingPart(undefined);
                setDialogOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Part
              </Button>
            </div>
          )}

          {data && data.total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {data.from} to {data.to} of {data.total} parts
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

      <PartFormDialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingPart(undefined);
        }}
        part={editingPart}
      />
        </>
      )}
    </div>
  );
}
