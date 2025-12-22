import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { coreZoneService } from '../../services/coreZones.service';
import CoreZoneForm from '../../components/forms/CoreZoneForm';
import { toast } from 'sonner';

export default function CoreZonesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['core-zones'], queryFn: () => coreZoneService.getAll({ per_page: 50 }) });

  const createMutation = useMutation({
    mutationFn: (d: any) => coreZoneService.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core-zones'] });
      setDialogOpen(false);
      toast.success('Record created successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed'),
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Core Zones</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Zone</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Zone</DialogTitle>
            </DialogHeader>
            <CoreZoneForm onSubmit={(data) => createMutation.mutate(data)} onCancel={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div>
        {isLoading ? <p>Loading...</p> : (
          <ul className="space-y-2">
            {data?.data?.map((z: any) => (
              <li key={z.id} className="p-2 border rounded">{z.name || z.id}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
