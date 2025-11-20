import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pmService } from '../../services/cmms.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
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
import { Plus, Calendar, TrendingUp, Play } from 'lucide-react';
import type { PmTemplate } from '../../types/cmms';
import { toast } from 'sonner';

export function PmPage() {
  const [filters, setFilters] = useState({ page: 1, per_page: 15 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PmTemplate | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['pm-templates', filters],
    queryFn: () => pmService.getTemplates(filters),
  });

  const { data: complianceData } = useQuery({
    queryKey: ['pm-compliance'],
    queryFn: () => pmService.getCompliance({}),
  });

  const createMutation = useMutation({
    mutationFn: pmService.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-templates'] });
      setDialogOpen(false);
      toast.success('PM template created successfully');
    },
  });

  const generateMutation = useMutation({
    mutationFn: pmService.generateWorkOrders,
    onSuccess: (result) => {
      toast.success(`Generated ${result.generated} work orders`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      trigger_type: formData.get('trigger_type') as 'time_based' | 'usage_based' | 'combined',
      frequency_days: parseInt(formData.get('frequency_days') as string),
      tolerance_days: parseInt(formData.get('tolerance_days') as string),
      is_active: true,
    };

    createMutation.mutate(data);
  };

  const latestCompliance = complianceData?.[0];
  const compliancePct = latestCompliance?.compliance_pct || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Preventive Maintenance</h1>
          <p className="text-muted-foreground">Schedule and track preventive maintenance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => generateMutation.mutate({})}
            disabled={generateMutation.isPending}
          >
            <Play className="mr-2 h-4 w-4" />
            Generate Work Orders
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTemplate(null)}>
                <Plus className="mr-2 h-4 w-4" />
                New PM Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create PM Template</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trigger_type">Trigger Type</Label>
                    <Select name="trigger_type" defaultValue="time_based">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time_based">Time Based</SelectItem>
                        <SelectItem value="usage_based">Usage Based</SelectItem>
                        <SelectItem value="combined">Combined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="frequency_days">Frequency (days)</Label>
                    <Input
                      id="frequency_days"
                      name="frequency_days"
                      type="number"
                      defaultValue="30"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tolerance_days">Tolerance (days)</Label>
                  <Input
                    id="tolerance_days"
                    name="tolerance_days"
                    type="number"
                    defaultValue="7"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    Create Template
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">PM Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{compliancePct.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">On-time completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestCompliance?.pm_scheduled || 0}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(latestCompliance?.pm_completed_on_time || 0) + (latestCompliance?.pm_completed_late || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">PM/CM Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestCompliance?.pm_breakdown_ratio?.toFixed(2) || '—'}
            </div>
            <p className="text-xs text-muted-foreground">Target: &gt; 4.0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PM Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger Type</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Gen</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.trigger_type}</Badge>
                    </TableCell>
                    <TableCell>{template.frequency_days} days</TableCell>
                    <TableCell>
                      {template.next_gen_date
                        ? new Date(template.next_gen_date).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
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
