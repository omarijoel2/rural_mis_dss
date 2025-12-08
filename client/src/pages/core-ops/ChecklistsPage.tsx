import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertTriangle, Plus, CheckCircle2, Trash2, PlayCircle, Loader2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ChecklistBuilderForm } from '../../components/core-ops/ChecklistBuilderForm';
import { toast } from 'sonner';

interface Checklist {
  id: string;
  title: string;
  frequency?: string;
  schema: any[];
  _count?: { runs: number };
}

interface ChecklistRun {
  id: string;
  checklist: Checklist;
  started_at: string;
  completed_at?: string;
  score?: number;
  performed_by?: { name: string };
  responses?: Record<string, any>;
}

export function ChecklistsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('checklists');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [startRunOpen, setStartRunOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [viewRunOpen, setViewRunOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<ChecklistRun | null>(null);

  const { data: checklistsData, isLoading: checklistsLoading } = useQuery({
    queryKey: ['checklists'],
    queryFn: () => coreOpsService.checklists.list({ per_page: 50 }),
  });

  const { data: runsData, isLoading: runsLoading } = useQuery({
    queryKey: ['checklist-runs'],
    queryFn: () => coreOpsService.checklists.listRuns({ per_page: 50 }),
  });

  const deleteChecklist = useMutation({
    mutationFn: (checklistId: string) => coreOpsService.checklists.delete(checklistId),
    onSuccess: () => {
      toast.success('Checklist deleted');
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
    onError: () => {
      toast.error('Failed to delete checklist');
    },
  });

  const startRunMutation = useMutation({
    mutationFn: (checklistId: string) => coreOpsService.checklists.startRun(checklistId, {}),
    onSuccess: () => {
      toast.success('Checklist run started');
      setStartRunOpen(false);
      setSelectedChecklist(null);
      setActiveTab('runs');
      queryClient.invalidateQueries({ queryKey: ['checklist-runs'] });
    },
    onError: () => {
      toast.error('Failed to start checklist run');
    },
  });

  const checklists = checklistsData?.data || [];
  const runs = runsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Checklists</h1>
          <p className="text-muted-foreground mt-1">Create and manage facility checklists</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Checklist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Checklist</DialogTitle>
              <DialogDescription>Define questions for your facility checklist</DialogDescription>
            </DialogHeader>
            <ChecklistBuilderForm
              onSuccess={() => {
                setIsCreateOpen(false);
                queryClient.invalidateQueries({ queryKey: ['checklists'] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="checklists">Templates</TabsTrigger>
          <TabsTrigger value="runs">Runs</TabsTrigger>
        </TabsList>

        {/* Checklists Templates Tab */}
        <TabsContent value="checklists" className="space-y-4">
          {checklistsLoading ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading checklists...
              </CardContent>
            </Card>
          ) : checklists.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No checklists found. Create one to get started!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {checklists.map((checklist: Checklist) => (
                <Card key={checklist.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{checklist.title}</h3>
                          {checklist.frequency && (
                            <Badge variant="outline">{checklist.frequency}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {checklist.schema?.length || 0} questions
                          {checklist._count?.runs && ` • ${checklist._count.runs} runs completed`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Checklist</DialogTitle>
                            </DialogHeader>
                            <ChecklistBuilderForm
                              initialChecklist={checklist}
                              onSuccess={() => {
                                queryClient.invalidateQueries({ queryKey: ['checklists'] });
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedChecklist(checklist);
                            setStartRunOpen(true);
                          }}
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Start Run
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('Delete this checklist?')) {
                              deleteChecklist.mutate(checklist.id);
                            }
                          }}
                          disabled={deleteChecklist.isPending || startRunMutation.isPending}
                        >
                          {deleteChecklist.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Checklist Runs Tab */}
        <TabsContent value="runs" className="space-y-4">
          {runsLoading ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading runs...
              </CardContent>
            </Card>
          ) : runs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No checklist runs yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {runs.map((run: ChecklistRun) => (
                <Card key={run.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          {run.completed_at ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-blue-600" />
                          )}
                          <h3 className="font-semibold">{run.checklist.title}</h3>
                          {run.score !== undefined && (
                            <Badge className="bg-green-100 text-green-800">
                              {run.score}%
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div>Started: {format(new Date(run.started_at), 'Pp')}</div>
                          {run.completed_at && (
                            <div>Completed: {format(new Date(run.completed_at), 'Pp')}</div>
                          )}
                          {run.performed_by && (
                            <div>By: {run.performed_by.name}</div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedRun(run);
                          setViewRunOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={startRunOpen} onOpenChange={setStartRunOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start Checklist Run</DialogTitle>
            <DialogDescription>
              Begin a new run of "{selectedChecklist?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This checklist has {selectedChecklist?.schema?.length || 0} questions.
              Once started, you'll need to complete all required questions.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartRunOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedChecklist && startRunMutation.mutate(selectedChecklist.id)}
              disabled={startRunMutation.isPending}
            >
              {startRunMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Start Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewRunOpen} onOpenChange={(open) => {
        setViewRunOpen(open);
        if (!open) setSelectedRun(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checklist Run Details</DialogTitle>
            <DialogDescription>
              {selectedRun?.checklist?.title} - {selectedRun?.started_at && format(new Date(selectedRun.started_at), 'PPP')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>{' '}
                <Badge className={selectedRun?.completed_at ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {selectedRun?.completed_at ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
              {selectedRun?.score !== undefined && (
                <div>
                  <span className="text-muted-foreground">Score:</span>{' '}
                  <span className="font-semibold">{selectedRun.score}%</span>
                </div>
              )}
              {selectedRun?.performed_by && (
                <div>
                  <span className="text-muted-foreground">Performed By:</span>{' '}
                  <span>{selectedRun.performed_by.name}</span>
                </div>
              )}
              {selectedRun?.completed_at && (
                <div>
                  <span className="text-muted-foreground">Completed:</span>{' '}
                  <span>{format(new Date(selectedRun.completed_at), 'Pp')}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Questions & Responses</h4>
              <div className="space-y-3">
                {selectedRun?.checklist?.schema?.map((question: any, idx: number) => {
                  const response = selectedRun?.responses?.[question.question] || selectedRun?.responses?.[idx];
                  return (
                    <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{question.question}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Type: {question.type} {question.required && '• Required'}
                          </p>
                        </div>
                        <div className="text-right">
                          {response !== undefined ? (
                            <span className="text-sm font-medium text-green-700">
                              {typeof response === 'boolean' 
                                ? (response ? 'Yes' : 'No') 
                                : typeof response === 'object' 
                                  ? JSON.stringify(response) 
                                  : String(response)}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No response</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRunOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
