import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Download, Upload, Edit, Trash2 } from 'lucide-react';
import { commercialService, type MeterRoute } from '@/services/commercial.service';
import { toast } from 'sonner';

export function MeterRoutes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<MeterRoute | null>(null);
  const queryClient = useQueryClient();

  const { data: routesData, isLoading } = useQuery({
    queryKey: ['meter-routes'],
    queryFn: () => commercialService.getMeterRoutes({ per_page: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: commercialService.createMeterRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-routes'] });
      setDialogOpen(false);
      setEditingRoute(null);
      toast.success('Route created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create route');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MeterRoute> }) =>
      commercialService.updateMeterRoute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-routes'] });
      setDialogOpen(false);
      setEditingRoute(null);
      toast.success('Route updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update route');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: commercialService.deleteMeterRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-routes'] });
      toast.success('Route deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete route');
    },
  });

  const downloadMutation = useMutation({
    mutationFn: commercialService.downloadOfflinePackage,
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `route-${data.route_id}-offline.json`;
      a.click();
      toast.success('Offline package downloaded');
    },
    onError: () => {
      toast.error('Failed to download offline package');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      route_code: formData.get('route_code') as string,
      area: formData.get('area') as string,
      assigned_to: formData.get('assigned_to') as string || null,
      meters_count: parseInt(formData.get('meters_count') as string),
    };

    if (editingRoute) {
      updateMutation.mutate({ id: editingRoute.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDownload = (id: number) => {
    downloadMutation.mutate(id);
  };

  const handleEdit = (route: MeterRoute) => {
    setEditingRoute(route);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this route?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-600',
      unassigned: 'bg-yellow-600',
      inactive: 'bg-gray-600',
    };
    return <Badge className={variants[status] || 'bg-gray-600'}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Meter Reading Routes</h1>
          <p className="text-muted-foreground mt-1">Route planning and reading cycle management</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRoute(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRoute ? 'Edit Route' : 'Create New Route'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="route_code">Route Code</Label>
                <Input id="route_code" name="route_code" defaultValue={editingRoute?.route_code} required />
              </div>
              <div>
                <Label htmlFor="area">Area/Zone</Label>
                <Input id="area" name="area" defaultValue={editingRoute?.area} required />
              </div>
              <div>
                <Label htmlFor="assigned_to">Assigned To (Optional)</Label>
                <Input id="assigned_to" name="assigned_to" defaultValue={editingRoute?.assigned_to || ''} />
              </div>
              <div>
                <Label htmlFor="meters_count">Number of Meters</Label>
                <Input id="meters_count" name="meters_count" type="number" defaultValue={editingRoute?.meters_count} required />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingRoute ? 'Update' : 'Create'} Route
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading routes...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route Code</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Meters</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Read</TableHead>
                  <TableHead className="text-right">Completion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routesData?.data?.map((route: MeterRoute) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.route_code}</TableCell>
                    <TableCell>{route.area}</TableCell>
                    <TableCell>{route.assigned_to || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                    <TableCell className="text-right">{route.meters_count}</TableCell>
                    <TableCell>{getStatusBadge(route.status)}</TableCell>
                    <TableCell>
                      {route.last_read_date ? new Date(route.last_read_date).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">{route.completion_rate.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Download offline package"
                          onClick={() => handleDownload(route.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(route)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(route.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {routesData?.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No routes found. Create your first route to organize meter reading.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
