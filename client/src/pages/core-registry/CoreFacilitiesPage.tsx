import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { coreFacilityService } from '../../services/coreFacilities.service';
import CoreFacilityForm from '../../components/forms/CoreFacilityForm';
import { toast } from 'sonner';

export default function CoreFacilitiesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<null | any>(null);
  const [deleting, setDeleting] = useState<null | any>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const { data, isLoading } = useQuery({ queryKey: ['core-facilities'], queryFn: () => coreFacilityService.getAll({ per_page: 50 }) });

  const createMutation = useMutation({
    mutationFn: (d: any) => coreFacilityService.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core-facilities'] });
      setDialogOpen(false);
      toast.success('Record created successfully');
    },
    onError: (err: any) => {
      if (err?.payload?.errors) setServerErrors(err.payload.errors);
      toast.error(err.message || 'Failed to create facility');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => coreFacilityService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core-facilities'] });
      setEditDialogOpen(false);
      setEditing(null);
      setServerErrors({});
      toast.success('Record updated successfully');
    },
    onError: (err: any) => {
      if (err?.payload?.errors) setServerErrors(err.payload.errors);
      toast.error(err.message || 'Failed to update facility');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => coreFacilityService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core-facilities'] });
      setDeleteDialogOpen(false);
      setDeleting(null);
      toast.success('Record deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete facility');
    },
  });

  const startEdit = (f: any) => {
    setEditing(f);
    setServerErrors({});
    setEditDialogOpen(true);
  };

  const confirmDelete = (f: any) => {
    setDeleting(f);
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
          <h1 className="text-2xl font-bold">Core Facilities</h1>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Facility</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Facility</DialogTitle>
              </DialogHeader>
              <CoreFacilityForm
                onSubmit={(data) => createMutation.mutate(data)}
                onCancel={() => setDialogOpen(false)}
                serverErrors={serverErrors}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div>
        {isLoading ? <p>Loading...</p> : (
          <ul className="space-y-2">
            {data?.data?.map((f: any) => (
              <li key={f.id} className="p-2 border rounded flex justify-between items-center">
                <div>{f.name || f.code}</div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(f)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => confirmDelete(f)} className="text-rose-600">Delete</Button>
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
            <DialogTitle>Edit Facility</DialogTitle>
          </DialogHeader>
          <CoreFacilityForm
            initial={editing || undefined}
            onSubmit={handleEditSubmit}
            onCancel={() => { setEditDialogOpen(false); setEditing(null); }}
            serverErrors={serverErrors}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Facility</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete {deleting?.name || deleting?.code}? This action cannot be undone.</p>
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
