import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zoneService, type ZoneFilters } from '../../services/zone.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { RequirePerm } from '../../components/RequirePerm';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../../components/ui/alert-dialog';
//import { useState } from 'react';
import type { Zone } from '../../types/core-registry';

export function ZonesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'billing',
  });
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [editingZone, setEditingZone] = useState<null | any>(null);
  const [deletingZone, setDeletingZone] = useState<null | any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['zones'],
    queryFn: () => zoneService.getAll({ per_page: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Zone>) => zoneService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      setDialogOpen(false);
      setFormData({ code: '', name: '', type: 'billing' });
      setServerErrors({});
      toast.success('Record created successfully');
    },
    onError: (error: any) => {
      if (error?.payload?.errors) setServerErrors(error.payload.errors);
      toast.error(error.response?.data?.message || error.message || 'Failed to create zone');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Zone> }) => zoneService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      setEditDialogOpen(false);
      setEditingZone(null);
      setServerErrors({});
      toast.success('Record updated successfully');
    },
    onError: (error: any) => {
      if (error?.payload?.errors) setServerErrors(error.payload.errors);
      toast.error(error.response?.data?.message || error.message || 'Failed to update zone');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => zoneService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      setDeleteDialogOpen(false);
      setDeletingZone(null);
      toast.success('Record deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete zone');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate(formData);
  };

  const startEdit = (zone: any) => {
    setEditingZone(zone);
    setFormData({ code: zone.code || '', name: zone.name || '', type: zone.type || 'billing' });
    setServerErrors({});
    setEditDialogOpen(true);
  };

  const confirmDelete = (zone: any) => {
    setDeletingZone(zone);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;
    updateMutation.mutate({ id: String(editingZone.id), data: { code: formData.code, name: formData.name, type: formData.type } });
  };

  const handleDelete = () => {
    if (!deletingZone) return;
    deleteMutation.mutate(String(deletingZone.id));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Zones</h1>
          <p className="text-muted-foreground">Manage geographical zones</p>
        </div>
        <RequirePerm permission="create zones">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Zone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Zone</DialogTitle>
                <DialogDescription>Add a new geographical zone</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Code*</Label>
                    <Input
                      id="code"
                      placeholder="e.g. Z-001"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                    {serverErrors.code && <p className="text-rose-600 text-sm">{serverErrors.code.join(' ')}</p>}
                  </div>
                  <div>
                    <Label htmlFor="type">Type*</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="operational">Operational</SelectItem>
                      </SelectContent>
                    </Select>
                    {serverErrors.type && <p className="text-rose-600 text-sm">{serverErrors.type.join(' ')}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Name*</Label>
                  <Input
                    id="name"
                    placeholder="Zone name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  {serverErrors.name && <p className="text-rose-600 text-sm">{serverErrors.name.join(' ')}</p>}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Zone'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </RequirePerm>
      </div>

      {isLoading && !data ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-muted-foreground">Loading zones...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-2">Error loading zones</p>
            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          </div>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data.map((zone) => (
          <Card key={zone.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{zone.name}</CardTitle>
                  <CardDescription>Code: {zone.code}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(zone)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => confirmDelete(zone)}>
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{zone.type}</span>
                </div>
                {zone.scheme && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheme:</span>
                    <span className="font-medium text-xs">{zone.scheme.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <p className="text-lg text-muted-foreground mb-4">No zones found</p>
            <RequirePerm permission="create zones">
              <Button>Create Your First Zone</Button>
            </RequirePerm>
          </CardContent>
        </Card>
      )}

      {/* Edit Zone Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Zone</DialogTitle>
            <DialogDescription>Update zone details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Code*</Label>
              <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
              {serverErrors.code && <p className="text-rose-600 text-sm">{serverErrors.code.join(' ')}</p>}
            </div>
            <div>
              <Label htmlFor="type">Type*</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                </SelectContent>
              </Select>
              {serverErrors.type && <p className="text-rose-600 text-sm">{serverErrors.type.join(' ')}</p>}
            </div>
            <div>
              <Label htmlFor="name">Name*</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              {serverErrors.name && <p className="text-rose-600 text-sm">{serverErrors.name.join(' ')}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Zone</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete {deletingZone?.name}? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

        </>
      )}
    </div>
  );
}
