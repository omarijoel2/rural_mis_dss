import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService, type RaCase } from '../../services/crm.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const STATUS_COLORS = {
  new: 'bg-purple-100 text-purple-800',
  triage: 'bg-blue-100 text-blue-800',
  field: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed_valid: 'bg-gray-100 text-gray-800',
  closed_false_positive: 'bg-gray-100 text-gray-800',
};

export function RaConsolePage() {
  const [selectedCase, setSelectedCase] = useState<RaCase | null>(null);
  const [triageNotes, setTriageNotes] = useState('');
  const [triageDecision, setTriageDecision] = useState<'field' | 'false_positive' | null>(null);
  const queryClient = useQueryClient();

  const { data: highPriorityCases, isLoading: loadingHighPriority } = useQuery({
    queryKey: ['ra-high-priority'],
    queryFn: () => crmService.getHighPriorityCases(10),
  });

  const { data: allCases, isLoading: loadingAll } = useQuery({
    queryKey: ['ra-cases'],
    queryFn: () => crmService.getRaCases(),
  });

  const triageMutation = useMutation({
    mutationFn: ({ caseId, decision, notes }: { caseId: number; decision: string; notes: string }) =>
      crmService.triageCase(caseId, { decision, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ra-cases'] });
      queryClient.invalidateQueries({ queryKey: ['ra-high-priority'] });
      toast.success('Case triaged successfully');
      setSelectedCase(null);
      setTriageNotes('');
      setTriageDecision(null);
    },
    onError: (error: Error) => {
      toast.error(`Triage failed: ${error.message}`);
    },
  });

  const handleTriageSubmit = () => {
    if (!selectedCase || !triageDecision) return;

    triageMutation.mutate({
      caseId: selectedCase.id,
      decision: triageDecision,
      notes: triageNotes,
    });
  };

  const openTriageDialog = (raCase: RaCase) => {
    setSelectedCase(raCase);
    setTriageNotes('');
    setTriageDecision(null);
  };

  if (loadingAll) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg">Loading RA cases...</p>
      </div>
    );
  }

  const cases = allCases?.data || [];
  const newCases = cases.filter((c) => c.status === 'new');
  const triageCases = cases.filter((c) => c.status === 'triage');
  const fieldCases = cases.filter((c) => c.status === 'field');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Revenue Assurance Console</h1>
        <p className="text-muted-foreground">Monitor and triage revenue leakage cases</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newCases.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting triage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Triage</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{triageCases.length}</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Field Investigation</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fieldCases.length}</div>
            <p className="text-xs text-muted-foreground">Active investigations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases.length}</div>
            <p className="text-xs text-muted-foreground">All cases</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>High Priority Cases</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHighPriority ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highPriorityCases?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No high-priority cases
                    </TableCell>
                  </TableRow>
                ) : (
                  highPriorityCases?.data.map((raCase: RaCase) => (
                    <TableRow key={raCase.id}>
                      <TableCell className="font-medium">{raCase.account_no}</TableCell>
                      <TableCell>
                        <Badge className={PRIORITY_COLORS[raCase.priority]}>{raCase.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[raCase.status]}>{raCase.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(raCase.detected_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {raCase.status === 'new' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTriageDialog(raCase)}
                            disabled={triageMutation.isPending}
                          >
                            {triageMutation.isPending ? 'Processing...' : 'Triage'}
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

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Cases ({cases.length})</TabsTrigger>
          <TabsTrigger value="new">New ({newCases.length})</TabsTrigger>
          <TabsTrigger value="triage">Triage ({triageCases.length})</TabsTrigger>
          <TabsTrigger value="field">Field ({fieldCases.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="pt-6">
              {loadingAll ? (
                <p className="text-muted-foreground">Loading cases...</p>
              ) : (
                <CasesTable cases={cases} onTriage={openTriageDialog} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardContent className="pt-6">
              <CasesTable cases={newCases} onTriage={openTriageDialog} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triage">
          <Card>
            <CardContent className="pt-6">
              <CasesTable cases={triageCases} onTriage={openTriageDialog} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="field">
          <Card>
            <CardContent className="pt-6">
              <CasesTable cases={fieldCases} onTriage={openTriageDialog} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Triage Case #{selectedCase?.id}</DialogTitle>
            <DialogDescription>Account: {selectedCase?.account_no}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Evidence</Label>
              <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(selectedCase?.evidence, null, 2)}
              </pre>
            </div>

            <div>
              <Label>Decision</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={triageDecision === 'field' ? 'default' : 'outline'}
                  onClick={() => setTriageDecision('field')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Send to Field
                </Button>
                <Button
                  variant={triageDecision === 'false_positive' ? 'default' : 'outline'}
                  onClick={() => setTriageDecision('false_positive')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  False Positive
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={triageNotes}
                onChange={(e) => setTriageNotes(e.target.value)}
                placeholder="Add notes about this decision..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCase(null)}>
              Cancel
            </Button>
            <Button onClick={handleTriageSubmit} disabled={!triageDecision || triageMutation.isPending}>
              {triageMutation.isPending ? 'Submitting...' : 'Submit Triage'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CasesTable({
  cases,
  onTriage,
}: {
  cases: RaCase[];
  onTriage: (raCase: RaCase) => void;
}) {
  if (cases.length === 0) {
    return <p className="text-center text-muted-foreground">No cases found</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Detected</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cases.map((raCase) => (
          <TableRow key={raCase.id}>
            <TableCell className="font-mono text-sm">{raCase.id}</TableCell>
            <TableCell className="font-medium">{raCase.account_no}</TableCell>
            <TableCell>
              <Badge className={PRIORITY_COLORS[raCase.priority]}>{raCase.priority}</Badge>
            </TableCell>
            <TableCell>
              <Badge className={STATUS_COLORS[raCase.status]}>{raCase.status}</Badge>
            </TableCell>
            <TableCell>{new Date(raCase.detected_at).toLocaleDateString()}</TableCell>
            <TableCell>
              {raCase.status === 'new' && (
                <Button variant="outline" size="sm" onClick={() => onTriage(raCase)}>
                  Triage
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
