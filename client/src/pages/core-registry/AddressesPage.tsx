import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '../../services/address.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { RequirePerm } from '../../components/RequirePerm';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CoreAddressForm from '../../components/forms/CoreAddressForm';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../../components/ui/alert-dialog';

export function AddressesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    premise_code: '',
    street: '',
    village: '',
    ward: '',
    city: '',
    country: 'KE',
  });
  const [editing, setEditing] = useState<null | any>(null);
  const [deleting, setDeleting] = useState<null | any>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.getAll({ per_page: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => addressService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setDialogOpen(false);
      setFormData({ premise_code: '', street: '', village: '', ward: '', city: '', country: 'KE' });
      setServerErrors({});
      toast.success('Record created successfully');
    },
    onError: (error: any) => {
      if (error?.payload?.errors) setServerErrors(error.payload.errors);
      toast.error(error.response?.data?.message || 'Failed to create address');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) => addressService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setEditDialogOpen(false);
      setEditing(null);
      setServerErrors({});
      toast.success('Record updated successfully');
    },
    onError: (error: any) => {
      if (error?.payload?.errors) setServerErrors(error.payload.errors);
      toast.error(error.response?.data?.message || 'Failed to update address');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setDeleteDialogOpen(false);
      setDeleting(null);
      toast.success('Record deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.premise_code) {
      toast.error('Please fill in the premise code');
      return;
    }
    createMutation.mutate(formData);
  };

  const startEdit = (addr: any) => {
    setEditing(addr);
    setFormData({ premise_code: addr.premise_code || '', street: addr.street || '', village: addr.village || '', ward: addr.ward || '', city: addr.city || '', country: addr.country || 'KE' });
    setServerErrors({});
    setEditDialogOpen(true);
  };

  const confirmDelete = (addr: any) => {
    setDeleting(addr);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = (data: any) => {
    if (!editing) return;
    updateMutation.mutate({ id: String(editing.id), data });
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(String(deleting.id));
  };
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Addresses</h1>
          <p className="text-muted-foreground">Manage customer premises addresses</p>
        </div>
        <RequirePerm permission="create addresses">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Address</DialogTitle>
                <DialogDescription>Add a new customer premise address</DialogDescription>
              </DialogHeader>
              <CoreAddressForm
                onSubmit={(data) => createMutation.mutate(data)}
                onCancel={() => setDialogOpen(false)}
                serverErrors={serverErrors}
              />
            </DialogContent>
          </Dialog>
        </RequirePerm>
      </div>

      {isLoading && !data ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-muted-foreground">Loading addresses...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-2">Error loading addresses</p>
            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          </div>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data.map((address) => (
          <Card key={address.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{address.premise_code}</CardTitle>
                  <CardDescription>
                    {[address.street, address.village].filter(Boolean).join(', ') || 'No address details'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(address)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => confirmDelete(address)}>
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {address.ward && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ward:</span>
                    <span className="font-medium">{address.ward}</span>
                  </div>
                )}
                {address.subcounty && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subcounty:</span>
                    <span className="font-medium">{address.subcounty}</span>
                  </div>
                )}
                {address.city && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City:</span>
                    <span className="font-medium">{address.city}</span>
                  </div>
                )}
                {address.what3words && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">What3Words:</span>
                    <span className="font-medium text-xs">{address.what3words}</span>
                  </div>
                )}
                {address.scheme && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheme:</span>
                    <span className="font-medium text-xs">{address.scheme.name}</span>
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
            <p className="text-lg text-muted-foreground mb-4">No addresses found</p>
            <RequirePerm permission="create addresses">
              <Button>Create Your First Address</Button>
            </RequirePerm>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          <CoreAddressForm initial={editing || undefined} onSubmit={handleEditSubmit} onCancel={() => { setEditDialogOpen(false); setEditing(null); }} serverErrors={serverErrors} />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete {deleting?.premise_code || deleting?.id}? This action cannot be undone.</AlertDialogDescription>
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
