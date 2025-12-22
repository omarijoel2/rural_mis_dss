import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelineService, type PipelineFilters } from '../../services/pipeline.service';
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
import type { Pipeline } from '../../types/core-registry';

export function PipelinesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{ code: string; material: Pipeline['material']; diameter_mm: string; status: Pipeline['status'] }>({
    code: '',
    material: 'uPVC',
    diameter_mm: '50',
    status: 'active',
  });
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [editingPipeline, setEditingPipeline] = useState<null | any>(null);
  const [deletingPipeline, setDeletingPipeline] = useState<null | any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => pipelineService.getAll({ per_page: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Pipeline>) => pipelineService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      setDialogOpen(false);
      setFormData({ code: '', material: 'uPVC', diameter_mm: '50', status: 'active' });
      setServerErrors({});
      toast.success('Record created successfully');
    },
    onError: (error: any) => {
      if (error?.payload?.errors) setServerErrors(error.payload.errors);
      toast.error(error.response?.data?.message || error.message || 'Failed to create pipeline');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pipeline> }) => pipelineService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      setEditDialogOpen(false);
      setEditingPipeline(null);
      setServerErrors({});
      toast.success('Record updated successfully');
    },
    onError: (error: any) => {
      if (error?.payload?.errors) setServerErrors(error.payload.errors);
      toast.error(error.response?.data?.message || error.message || 'Failed to update pipeline');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pipelineService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      setDeleteDialogOpen(false);
      setDeletingPipeline(null);
      toast.success('Record deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete pipeline');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.material || !formData.diameter_mm) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      code: formData.code,
      material: formData.material as 'uPVC' | 'HDPE' | 'DI' | 'AC' | 'GI' | 'Steel' | 'Other',
      diameter_mm: parseInt(formData.diameter_mm),
      status: formData.status as 'active' | 'leak' | 'rehab' | 'abandoned',
    });
  };

  const startEdit = (pipeline: any) => {
    setEditingPipeline(pipeline);
    setFormData({ code: pipeline.code || '', material: pipeline.material || 'uPVC', diameter_mm: String(pipeline.diameter_mm || 50), status: pipeline.status || 'active' });
    setServerErrors({});
    setEditDialogOpen(true);
  };

  const confirmDelete = (pipeline: any) => {
    setDeletingPipeline(pipeline);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPipeline) return;
    updateMutation.mutate({ id: String(editingPipeline.id), data: { code: formData.code, material: formData.material, diameter_mm: parseInt(formData.diameter_mm), status: formData.status } });
  };

  const handleDelete = () => {
    if (!deletingPipeline) return;
    deleteMutation.mutate(String(deletingPipeline.id));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pipelines</h1>
          <p className="text-muted-foreground">Manage water distribution pipelines</p>
        </div>
        <RequirePerm permission="create pipelines">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Pipeline
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Pipeline</DialogTitle>
                <DialogDescription>Add a new water distribution pipeline</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Code*</Label>
                    <Input
                      id="code"
                      placeholder="e.g. PIPE-001"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                    {serverErrors.code && <p className="text-rose-600 text-sm">{serverErrors.code.join(' ')}</p>}
                  </div>
                  <div>
                    <Label htmlFor="material">Material*</Label>
                    <Select value={formData.material} onValueChange={(v: Pipeline['material']) => setFormData({ ...formData, material: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uPVC">uPVC</SelectItem>
                        <SelectItem value="HDPE">HDPE</SelectItem>
                        <SelectItem value="Steel">Steel</SelectItem>
                        <SelectItem value="DI">DI</SelectItem>
                        <SelectItem value="AC">AC</SelectItem>
                        <SelectItem value="GI">GI</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {serverErrors.material && <p className="text-rose-600 text-sm">{serverErrors.material.join(' ')}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="diameter_mm">Diameter (mm)*</Label>
                    <Input
                      id="diameter_mm"
                      type="number"
                      placeholder="50"
                      value={formData.diameter_mm}
                      onChange={(e) => setFormData({ ...formData, diameter_mm: e.target.value })}
                      required
                    />
                    {serverErrors.diameter_mm && <p className="text-rose-600 text-sm">{serverErrors.diameter_mm.join(' ')}</p>}
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(v: Pipeline['status']) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="leak">Leak</SelectItem>
                        <SelectItem value="rehab">Rehab</SelectItem>
                      </SelectContent>
                    </Select>
                    {serverErrors.status && <p className="text-rose-600 text-sm">{serverErrors.status.join(' ')}</p>}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Pipeline'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </RequirePerm>
      </div>

      {isLoading && !data ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-muted-foreground">Loading pipelines...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-2">Error loading pipelines</p>
            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          </div>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data.map((pipeline) => (
          <Card key={pipeline.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{pipeline.code}</CardTitle>
                  <CardDescription>{pipeline.material}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(pipeline)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => confirmDelete(pipeline)}>
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diameter:</span>
                  <span className="font-medium">{pipeline.diameter_mm} mm</span>
                </div>
                {pipeline.install_year && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Installed:</span>
                    <span className="font-medium">{pipeline.install_year}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium capitalize ${
                    pipeline.status === 'active' ? 'text-green-600' : 
                    pipeline.status === 'leak' ? 'text-red-600' : 
                    pipeline.status === 'rehab' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {pipeline.status}
                  </span>
                </div>
                {pipeline.scheme && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheme:</span>
                    <span className="font-medium text-xs">{pipeline.scheme.name}</span>
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
            <p className="text-lg text-muted-foreground mb-4">No pipelines found</p>
            <RequirePerm permission="create pipelines">
              <Button>Create Your First Pipeline</Button>
            </RequirePerm>
          </CardContent>
        </Card>
      )}

      {/* Edit Pipeline Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pipeline</DialogTitle>
            <DialogDescription>Update pipeline details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Code*</Label>
              <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
              {serverErrors.code && <p className="text-rose-600 text-sm">{serverErrors.code.join(' ')}</p>}
            </div>
            <div>
              <Label htmlFor="material">Material*</Label>
              <Select value={formData.material} onValueChange={(v: Pipeline['material']) => setFormData({ ...formData, material: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uPVC">uPVC</SelectItem>
                  <SelectItem value="HDPE">HDPE</SelectItem>
                  <SelectItem value="Steel">Steel</SelectItem>
                  <SelectItem value="DI">DI</SelectItem>
                  <SelectItem value="AC">AC</SelectItem>
                  <SelectItem value="GI">GI</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {serverErrors.material && <p className="text-rose-600 text-sm">{serverErrors.material.join(' ')}</p>}
            </div>
            <div>
              <Label htmlFor="diameter_mm">Diameter (mm)*</Label>
              <Input id="diameter_mm" value={formData.diameter_mm} onChange={(e) => setFormData({ ...formData, diameter_mm: e.target.value })} required />
              {serverErrors.diameter_mm && <p className="text-rose-600 text-sm">{serverErrors.diameter_mm.join(' ')}</p>}
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
            <AlertDialogTitle>Delete Pipeline</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete {deletingPipeline?.code || deletingPipeline?.id}? This action cannot be undone.</AlertDialogDescription>
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
