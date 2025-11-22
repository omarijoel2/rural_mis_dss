import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '../../services/address.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { RequirePerm } from '../../components/RequirePerm';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export function AddressesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    premise_code: '',
    street: '',
    village: '',
    ward: '',
    city: '',
    country: 'KE',
  });
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
      toast.success('Address created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create address');
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
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="premise_code">Premise Code*</Label>
                    <Input
                      id="premise_code"
                      placeholder="e.g. PREM-001"
                      value={formData.premise_code}
                      onChange={(e) => setFormData({ ...formData, premise_code: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="KE"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    placeholder="Street address"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="village">Village</Label>
                    <Input
                      id="village"
                      placeholder="Village"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ward">Ward</Label>
                    <Input
                      id="ward"
                      placeholder="Ward"
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Address'}
                  </Button>
                </div>
              </form>
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
              <CardTitle>{address.premise_code}</CardTitle>
              <CardDescription>
                {[address.street, address.village].filter(Boolean).join(', ') || 'No address details'}
              </CardDescription>
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
        </>
      )}
    </div>
  );
}
