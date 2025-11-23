import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Plus, Trophy, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Assessment {
  id: number;
  operatorId: string;
  operatorName: string;
  topic: string;
  score: number;
  maxScore: number;
  status: string;
  certificationValid: boolean;
  validUntil?: string;
}

export function CapacityAssessmentPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    operatorId: '',
    topic: 'operation',
    score: '',
  });
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const { data, isLoading } = useQuery({
    queryKey: ['capacity-assessments', page],
    queryFn: () => apiClient.get('/training/assessments'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/training/assessments', data),
    onSuccess: () => {
      toast.success('Assessment recorded');
      queryClient.invalidateQueries({ queryKey: ['capacity-assessments'] });
      setIsCreateOpen(false);
    },
  });

  const assessments = (data as any)?.data || [];

  const getStatusColor = (status: string, valid: boolean) => {
    if (status === 'pending') return 'bg-gray-100 text-gray-800';
    if (!valid) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const stats = {
    totalOperators: 245,
    certified: 189,
    pendingReview: 32,
    needsTraining: 24,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">Operator Capacity Assessment</h1>
          <p className="text-muted-foreground">
            Evaluate and certify water system operators. Track competency assessments, certification validity, and training needs.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Assessment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Assessment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Operator ID</label>
                <Input
                  placeholder="ID or phone number"
                  value={newAssessment.operatorId}
                  onChange={(e) => setNewAssessment({ ...newAssessment, operatorId: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Assessment Topic</label>
                <select
                  className="w-full rounded border p-2"
                  value={newAssessment.topic}
                  onChange={(e) => setNewAssessment({ ...newAssessment, topic: e.target.value })}
                >
                  <option value="operation">System Operation</option>
                  <option value="maintenance">Preventive Maintenance</option>
                  <option value="safety">Safety & HSE</option>
                  <option value="billing">Tariff & Billing</option>
                  <option value="customer">Customer Service</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Score (0-100)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newAssessment.score}
                  onChange={(e) => setNewAssessment({ ...newAssessment, score: e.target.value })}
                />
              </div>
              <Button
                onClick={() =>
                  createMutation.mutate({
                    operatorId: newAssessment.operatorId,
                    topic: newAssessment.topic,
                    score: parseInt(newAssessment.score),
                  })
                }
                disabled={createMutation.isPending}
                className="w-full"
              >
                Record Assessment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Operators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOperators}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all schemes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" /> Certified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.certified}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((stats.certified / stats.totalOperators) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" /> Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pendingReview}</div>
            <p className="text-xs text-muted-foreground mt-1">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" /> Training Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.needsTraining}</div>
            <p className="text-xs text-muted-foreground mt-1">Not yet certified</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Assessments</CardTitle>
            <span className="text-sm text-muted-foreground">
              {assessments.length} assessments
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {isLoading ? (
                <p>Loading assessments...</p>
              ) : (
                assessments.slice((page - 1) * pageSize, page * pageSize).map((assessment: Assessment) => (
                <div key={assessment.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">{assessment.operatorName}</p>
                      <p className="text-sm text-muted-foreground">{assessment.topic}</p>
                    </div>
                    <Badge className={getStatusColor(assessment.status, assessment.certificationValid)}>
                      {assessment.certificationValid ? 'CERTIFIED' : 'PENDING'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score: {assessment.score}/{assessment.maxScore}</span>
                      <span className="font-semibold">
                        {Math.round((assessment.score / assessment.maxScore) * 100)}%
                      </span>
                    </div>
                    <Progress value={(assessment.score / assessment.maxScore) * 100} />
                  </div>
                  {assessment.validUntil && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Cert valid until: {assessment.validUntil}
                    </p>
                  )}
                </div>
              ))
              )}
            </div>
          </ScrollArea>

          {assessments.length > pageSize && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(assessments.length / pageSize)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(Math.ceil(assessments.length / pageSize), page + 1))}
                  disabled={page >= Math.ceil(assessments.length / pageSize)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
