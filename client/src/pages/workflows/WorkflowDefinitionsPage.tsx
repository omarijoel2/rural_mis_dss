import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowDef {
  id: number;
  key: string;
  name: string;
  version: number;
  active: boolean;
  created_at: string;
}

export function WorkflowDefinitionsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDef, setNewDef] = useState({ key: '', name: '', spec: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['workflow-definitions'],
    queryFn: () => apiClient.get('/workflows/definitions'),
  });

  const createMutation = useMutation({
    mutationFn: (def: any) => apiClient.post('/workflows/definitions', def),
    onSuccess: () => {
      toast.success('Workflow created');
      queryClient.invalidateQueries({ queryKey: ['workflow-definitions'] });
      setIsCreateOpen(false);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/workflows/definitions/${id}/activate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-definitions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/workflows/definitions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-definitions'] });
    },
  });

  const definitions = (data as any)?.data || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workflow Definitions</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workflow Definition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Key</label>
                <Input
                  placeholder="work_order.v1"
                  value={newDef.key}
                  onChange={(e) => setNewDef({ ...newDef, key: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="Work Order Workflow"
                  value={newDef.name}
                  onChange={(e) => setNewDef({ ...newDef, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Spec (JSON)</label>
                <textarea
                  className="w-full rounded border p-2 font-mono text-sm"
                  rows={6}
                  placeholder='{"key":"work_order.v1","states":[{"name":"new"}]}'
                  value={newDef.spec}
                  onChange={(e) => setNewDef({ ...newDef, spec: e.target.value })}
                />
              </div>
              <Button
                onClick={() =>
                  createMutation.mutate({
                    ...newDef,
                    spec: JSON.parse(newDef.spec),
                  })
                }
                disabled={createMutation.isPending}
                className="w-full"
              >
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Search workflows..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4">
          {definitions.map((def) => (
            <Card key={def.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{def.name}</h3>
                      {def.active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                      <Badge variant="secondary">v{def.version}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{def.key}</p>
                  </div>
                  <div className="flex gap-2">
                    {!def.active && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => activateMutation.mutate(def.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => (window.location.href = `/workflows/definitions/${def.id}`)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(def.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
