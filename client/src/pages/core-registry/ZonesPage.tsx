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
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Zone } from '../../types/core-registry';

export function ZonesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'billing',
  });
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
      toast.success('Zone created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create zone');
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
              <CardTitle>{zone.name}</CardTitle>
              <CardDescription>Code: {zone.code}</CardDescription>
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
        </>
      )}
    </div>
  );
}
