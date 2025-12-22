import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { coreDmaService } from '../../services/coreDmas.service';
import CoreDmaForm from '../../components/forms/CoreDmaForm';
import { toast } from 'sonner';

export default function CoreDmasPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['core-dmas'], queryFn: () => coreDmaService.getAll({ per_page: 50 }) });

  const createMutation = useMutation({
    mutationFn: (d: any) => coreDmaService.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core-dmas'] });
      setDialogOpen(false);
      toast.success('Record created successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed'),
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Core DMAs</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create DMA</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create DMA</DialogTitle>
            </DialogHeader>
            <CoreDmaForm onSubmit={(data) => createMutation.mutate(data)} onCancel={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div>
        {isLoading ? <p>Loading...</p> : (
          <ul className="space-y-2">
            {data?.data?.map((d: any) => (
              <li key={d.id} className="p-2 border rounded">{d.name || d.code}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
