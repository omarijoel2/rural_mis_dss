import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { coreMeterService } from '../../services/coreMeters.service';
import CoreMeterForm from '../../components/forms/CoreMeterForm';
import { toast } from 'sonner';

export default function CoreMetersPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<null | any>(null);
  const [deleting, setDeleting] = useState<null | any>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const { data, isLoading } = useQuery({ queryKey: ['core-meters'], queryFn: () => coreMeterService.getAll({ per_page: 50 }) });

  const createMutation = useMutation({
    mutationFn: (d: any) => coreMeterService.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core-meters'] });
      setDialogOpen(false);
      toast.success('Record created successfully');
    },
    onError: (err: any) => {
      if (err?.payload?.errors) setServerErrors(err.payload.errors);
      toast.error(err.message || 'Failed to create meter');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => coreMeterService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core-meters'] });
      setEditDialogOpen(false);
      setEditing(null);
      setServerErrors({});
      toast.success('Record updated successfully');
    },
    onError: (err: any) => {
      if (err?.payload?.errors) setServerErrors(err.payload.errors);
      toast.error(err.message || 'Failed to update meter');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => coreMeterService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core-meters'] });
      setDeleteDialogOpen(false);
      setDeleting(null);
      toast.success('Record deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete meter');
    },
  });

  const startEdit = (m: any) => {
    setEditing(m);
    setServerErrors({});
    setEditDialogOpen(true);
  };

  const confirmDelete = (m: any) => {
    setDeleting(m);
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
          <h1 className="text-2xl font-bold">Core Meters</h1>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Meter</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Meter</DialogTitle>
              </DialogHeader>
              <CoreMeterForm onSubmit={(data) => createMutation.mutate(data)} onCancel={() => setDialogOpen(false)} serverErrors={serverErrors} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div>
        {isLoading ? <p>Loading...</p> : (
          <ul className="space-y-2">
            {data?.data?.map((m: any) => (
              <li key={m.id} className="p-2 border rounded flex justify-between items-center">
                <div>{m.serial || m.id}</div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(m)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => confirmDelete(m)} className="text-rose-600">Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Meter</DialogTitle>
          </DialogHeader>
          <CoreMeterForm initial={editing || undefined} onSubmit={handleEditSubmit} onCancel={() => { setEditDialogOpen(false); setEditing(null); }} serverErrors={serverErrors} />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Meter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete {deleting?.serial || deleting?.id}? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button className="bg-rose-600" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
