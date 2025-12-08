import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { AlertTriangle, Plus, BookOpen, Zap, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PlaybookStep {
  order?: number;
  action?: string;
  title?: string;
  description?: string;
  type?: 'manual' | 'automated' | 'decision';
  duration_minutes?: number;
}

interface Playbook {
  id: string;
  name: string;
  for_category?: string;
  for_severity?: 'critical' | 'high' | 'medium' | 'low';
  steps: PlaybookStep[];
}

export function PlaybooksPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlaybookName, setNewPlaybookName] = useState('');
  const [newPlaybookCategory, setNewPlaybookCategory] = useState('');
  const [newPlaybookSeverity, setNewPlaybookSeverity] = useState<string>('medium');
  const [newPlaybookSteps, setNewPlaybookSteps] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['playbooks'],
    queryFn: () => coreOpsService.playbooks.list({ per_page: 50 }),
  });

  const createPlaybookMutation = useMutation({
    mutationFn: (data: any) => coreOpsService.playbooks.create(data),
    onSuccess: () => {
      toast.success('Playbook created');
      setIsCreateOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
    },
    onError: () => {
      toast.error('Failed to create playbook');
    },
  });

  const deletePlaybookMutation = useMutation({
    mutationFn: (id: string) => coreOpsService.playbooks.delete(id),
    onSuccess: () => {
      toast.success('Playbook deleted');
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
    },
    onError: () => {
      toast.error('Failed to delete playbook');
    },
  });

  const resetForm = () => {
    setNewPlaybookName('');
    setNewPlaybookCategory('');
    setNewPlaybookSeverity('medium');
    setNewPlaybookSteps('');
  };

  const handleCreatePlaybook = () => {
    if (!newPlaybookName) {
      toast.error('Please provide a playbook name');
      return;
    }
    const stepsArray = newPlaybookSteps
      .split('\n')
      .filter(line => line.trim())
      .map((line, idx) => ({ order: idx + 1, action: line.trim() }));

    createPlaybookMutation.mutate({
      name: newPlaybookName,
      for_category: newPlaybookCategory || undefined,
      for_severity: newPlaybookSeverity || undefined,
      steps: stepsArray,
    });
  };

  const playbooks = data?.data || [];

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'outline';
    }
  };

  const getStepTypeIcon = (type?: string) => {
    switch (type) {
      case 'automated':
        return <Zap className="h-4 w-4" />;
      case 'decision':
        return <BookOpen className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Playbooks</h1>
          <p className="text-muted-foreground mt-1">Event response automation and runbooks</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Playbook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Playbook</DialogTitle>
              <DialogDescription>Define response steps for specific event types</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="playbook-name">Playbook Name *</Label>
                <Input
                  id="playbook-name"
                  placeholder="e.g., High Pressure Response"
                  value={newPlaybookName}
                  onChange={(e) => setNewPlaybookName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="playbook-category">For Category</Label>
                  <Input
                    id="playbook-category"
                    placeholder="e.g., pressure, quality"
                    value={newPlaybookCategory}
                    onChange={(e) => setNewPlaybookCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playbook-severity">For Severity</Label>
                  <select
                    id="playbook-severity"
                    value={newPlaybookSeverity}
                    onChange={(e) => setNewPlaybookSeverity(e.target.value)}
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="playbook-steps">Steps (one per line)</Label>
                <Textarea
                  id="playbook-steps"
                  placeholder="Verify alarm source&#10;Check upstream status&#10;Dispatch field team if needed"
                  rows={6}
                  value={newPlaybookSteps}
                  onChange={(e) => setNewPlaybookSteps(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreatePlaybook} disabled={createPlaybookMutation.isPending}>
                {createPlaybookMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Playbook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading & Error States */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Loading playbooks...
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading playbooks: {(error as Error).message}
          </AlertDescription>
        </Alert>
      ) : playbooks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No playbooks found. Create one to automate event responses!
          </CardContent>
        </Card>
      ) : (
        /* Playbooks Grid */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playbooks.map((playbook: Playbook) => (
            <Card key={playbook.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{playbook.name}</CardTitle>
                    {playbook.for_category && (
                      <CardDescription className="text-xs mt-1">
                        For: {playbook.for_category}
                      </CardDescription>
                    )}
                  </div>
                  {playbook.for_severity && (
                    <Badge className={getSeverityColor(playbook.for_severity) as any}>
                      {playbook.for_severity}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 pb-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    {playbook.steps?.length || 0} steps
                  </p>

                  {/* Steps Preview */}
                  <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                    {playbook.steps?.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-1.5 bg-muted/50 rounded">
                        <span className="text-muted-foreground font-semibold min-w-6">
                          {step.order || idx + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{step.action || step.title}</div>
                          {step.type && (
                            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                              {getStepTypeIcon(step.type)}
                              <span>{step.type}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>

              <div className="flex gap-2 border-t pt-3 px-4 pb-4">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete this playbook?')) {
                      deletePlaybookMutation.mutate(playbook.id);
                    }
                  }}
                  disabled={deletePlaybookMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
