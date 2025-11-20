import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobPlanService } from '../../services/cmms.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Search, FileText, CheckCircle, Archive, Edit } from 'lucide-react';
import type { JobPlan } from '../../types/cmms';
import { toast } from 'sonner';

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  archived: 'bg-orange-100 text-orange-800',
};

export function JobPlansPage() {
  const [filters, setFilters] = useState({ page: 1, per_page: 15, search: '', status: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<JobPlan | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['job-plans', filters],
    queryFn: () => jobPlanService.getJobPlans(filters),
  });

  const createMutation = useMutation({
    mutationFn: jobPlanService.createJobPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-plans'] });
      setDialogOpen(false);
      toast.success('Job plan created successfully');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<JobPlan> }) =>
      jobPlanService.updateJobPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-plans'] });
      setDialogOpen(false);
      setEditingPlan(null);
      toast.success('Job plan updated successfully');
    },
  });

  const activateMutation = useMutation({
    mutationFn: jobPlanService.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-plans'] });
      toast.success('Job plan activated');
    },
  });

  const createVersionMutation = useMutation({
    mutationFn: jobPlanService.createVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-plans'] });
      toast.success('New version created');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      sop: formData.get('sop') as string,
      estimated_hours: parseFloat(formData.get('estimated_hours') as string),
      status: (formData.get('status') as 'draft' | 'active' | 'archived') || 'draft',
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Plans</h1>
          <p className="text-muted-foreground">Standardized work procedures and checklists</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPlan(null)}>
              <Plus className="mr-2 h-4 w-4" />
              New Job Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Job Plan' : 'Create Job Plan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Job Plan Code</Label>
                  <Input
                    id="code"
                    name="code"
                    defaultValue={editingPlan?.code}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingPlan?.status || 'draft'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingPlan?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingPlan?.description}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="sop">Standard Operating Procedure</Label>
                <Textarea
                  id="sop"
                  name="sop"
                  defaultValue={editingPlan?.sop}
                  rows={5}
                  placeholder="Step-by-step procedure..."
                />
              </div>
              <div>
                <Label htmlFor="estimated_hours">Estimated Hours</Label>
                <Input
                  id="estimated_hours"
                  name="estimated_hours"
                  type="number"
                  step="0.5"
                  defaultValue={editingPlan?.estimated_hours}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingPlan ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search job plans..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Hours</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-mono">{plan.code}</TableCell>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>v{plan.version}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[plan.status]}>{plan.status}</Badge>
                    </TableCell>
                    <TableCell>{plan.estimated_hours || '—'}h</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingPlan(plan);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {plan.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => activateMutation.mutate(plan.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                        {plan.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => createVersionMutation.mutate(plan.id)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            New Version
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
