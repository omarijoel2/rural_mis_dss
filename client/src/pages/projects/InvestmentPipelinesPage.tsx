import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
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
import { Plus, TrendingUp, DollarSign, Target, ArrowRight, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { projectsService, type InvestmentPipeline } from '../../services/projects.service';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  converted: 'bg-purple-100 text-purple-800',
};

export function InvestmentPipelinesPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<InvestmentPipeline | null>(null);
  const [newPipeline, setNewPipeline] = useState({
    title: '',
    description: '',
    estimated_cost: '',
    connections_added: '',
    nrw_reduction: '',
  });

  const { data: pipelinesData, isLoading } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => projectsService.getPipelines(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => projectsService.createPipeline(data),
    onSuccess: () => {
      toast.success('Investment pipeline created');
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      setIsCreateOpen(false);
      setNewPipeline({ title: '', description: '', estimated_cost: '', connections_added: '', nrw_reduction: '' });
    },
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => projectsService.convertToProject(id),
    onSuccess: () => {
      toast.success('Pipeline converted to project');
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSelectedPipeline(null);
    },
  });

  const pipelines = (pipelinesData as any) || [];

  const stats = {
    total: pipelines.length,
    totalCost: pipelines.reduce((sum: number, p: InvestmentPipeline) => sum + p.estimated_cost, 0),
    approved: pipelines.filter((p: InvestmentPipeline) => p.status === 'approved').length,
    avgBcr: pipelines.filter((p: InvestmentPipeline) => p.bcr).reduce((sum: number, p: InvestmentPipeline) => sum + (p.bcr || 0), 0) / pipelines.filter((p: InvestmentPipeline) => p.bcr).length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Investment Pipelines</h1>
          <p className="text-muted-foreground">Prioritize and appraise capital investments</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Pipeline
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Investment Pipeline</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Investment Title *</label>
                <Input
                  placeholder="e.g., Smart Meter Rollout Phase 3"
                  value={newPipeline.title}
                  onChange={(e) => setNewPipeline({ ...newPipeline, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Brief description of the investment"
                  value={newPipeline.description}
                  onChange={(e) => setNewPipeline({ ...newPipeline, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estimated Cost (KES) *</label>
                <Input
                  type="number"
                  placeholder="50000000"
                  value={newPipeline.estimated_cost}
                  onChange={(e) => setNewPipeline({ ...newPipeline, estimated_cost: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Connections Added</label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={newPipeline.connections_added}
                    onChange={(e) => setNewPipeline({ ...newPipeline, connections_added: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">NRW Reduction %</label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={newPipeline.nrw_reduction}
                    onChange={(e) => setNewPipeline({ ...newPipeline, nrw_reduction: e.target.value })}
                  />
                </div>
              </div>
              <Button
                onClick={() => createMutation.mutate({
                  title: newPipeline.title,
                  description: newPipeline.description,
                  estimated_cost: parseInt(newPipeline.estimated_cost),
                })}
                disabled={!newPipeline.title || !newPipeline.estimated_cost || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Pipeline'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" /> Total Pipelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Total Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KES {(stats.totalCost / 1000000).toFixed(0)}M</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" /> Avg BCR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgBcr.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investment Pipeline Registry</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading pipelines...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Est. Cost</TableHead>
                  <TableHead>BCR</TableHead>
                  <TableHead>NPV</TableHead>
                  <TableHead>IRR</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pipelines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No pipelines found
                    </TableCell>
                  </TableRow>
                ) : (
                  pipelines.map((pipeline: InvestmentPipeline) => (
                    <TableRow key={pipeline.id}>
                      <TableCell className="font-mono text-sm">{pipeline.code}</TableCell>
                      <TableCell className="font-medium max-w-xs truncate">{pipeline.title}</TableCell>
                      <TableCell>KES {(pipeline.estimated_cost / 1000000).toFixed(0)}M</TableCell>
                      <TableCell>
                        <span className={pipeline.bcr && pipeline.bcr >= 1.5 ? 'text-green-600 font-semibold' : ''}>
                          {pipeline.bcr?.toFixed(2) || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {pipeline.npv ? `KES ${(pipeline.npv / 1000000).toFixed(0)}M` : '-'}
                      </TableCell>
                      <TableCell>{pipeline.irr ? `${pipeline.irr}%` : '-'}</TableCell>
                      <TableCell>
                        {pipeline.priority_score ? (
                          <div className="flex items-center gap-2">
                            <Progress value={pipeline.priority_score} className="w-12 h-2" />
                            <span className="text-sm">{pipeline.priority_score}</span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[pipeline.status]}>
                          {pipeline.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {pipeline.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => convertMutation.mutate(pipeline.id)}
                            disabled={convertMutation.isPending}
                          >
                            <ArrowRight className="h-3 w-3" />
                            Convert
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
