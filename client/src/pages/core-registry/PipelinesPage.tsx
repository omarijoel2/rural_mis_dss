import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelineService } from '../../services/pipeline.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { RequirePerm } from '../../components/RequirePerm';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export function PipelinesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    material: 'PVC',
    diameter_mm: '50',
    status: 'active',
  });
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => pipelineService.getAll({ per_page: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => pipelineService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      setDialogOpen(false);
      setFormData({ code: '', material: 'PVC', diameter_mm: '50', status: 'active' });
      toast.success('Pipeline created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create pipeline');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.material || !formData.diameter_mm) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      ...formData,
      diameter_mm: parseInt(formData.diameter_mm),
    });
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
                  </div>
                  <div>
                    <Label htmlFor="material">Material*</Label>
                    <Select value={formData.material} onValueChange={(v) => setFormData({ ...formData, material: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PVC">PVC</SelectItem>
                        <SelectItem value="HDPE">HDPE</SelectItem>
                        <SelectItem value="Steel">Steel</SelectItem>
                        <SelectItem value="Asbestos">Asbestos</SelectItem>
                      </SelectContent>
                    </Select>
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
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="leak">Leak</SelectItem>
                        <SelectItem value="rehab">Rehab</SelectItem>
                      </SelectContent>
                    </Select>
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
              <CardTitle>{pipeline.code}</CardTitle>
              <CardDescription>{pipeline.material}</CardDescription>
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
        </>
      )}
    </div>
  );
}
