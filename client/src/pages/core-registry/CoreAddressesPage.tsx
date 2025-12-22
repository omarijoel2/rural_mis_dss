import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { coreAddressService } from '../../services/coreAddresses.service';
import CoreAddressForm from '../../components/forms/CoreAddressForm';
import { toast } from 'sonner';

export default function CoreAddressesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['core-addresses'], queryFn: () => coreAddressService.getAll({ per_page: 50 }) });

  const createMutation = useMutation({
    mutationFn: (d: any) => coreAddressService.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core-addresses'] });
      setDialogOpen(false);
      toast.success('Record created successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed'),
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Core Addresses</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Address</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Address</DialogTitle>
            </DialogHeader>
            <CoreAddressForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div>
        {isLoading ? <p>Loading...</p> : (
          <ul className="space-y-2">
            {data?.data?.map((a: any) => (
              <li key={a.id} className="p-2 border rounded">{a.premise_code || a.id}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
