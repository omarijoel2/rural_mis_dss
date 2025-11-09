import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, CheckCircle, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { PlanFormDialog } from '@/components/water-quality/PlanFormDialog';
import { toast } from 'sonner';

export function PlansPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(undefined);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['water-quality-plans', page],
    queryFn: async () => {
      return apiClient.get<any>('/v1/water-quality/plans', { page, per_page: 20 });
    }
  });

  const activateMutation = useMutation({
    mutationFn: (planId: number) => apiClient.post(`/v1/water-quality/plans/${planId}/activate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-quality-plans'] });
      toast.success('Plan activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to activate plan');
    },
  });

  const generateSamplesMutation = useMutation({
    mutationFn: (planId: number) => apiClient.post(`/v1/water-quality/plans/${planId}/generate-samples`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['water-quality-samples'] });
      toast.success(`Generated ${data.generated || 0} samples successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate samples');
    },
  });

  const handleActivate = (planId: number) => {
    activateMutation.mutate(planId);
  };

  const handleGenerateSamples = (planId: number) => {
    generateSamplesMutation.mutate(planId);
  };

  const handleAddNew = () => {
    setEditingPlan(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sampling Plans</h2>
          <p className="text-muted-foreground">
            Manage quarterly and annual water quality monitoring plans
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <PlanFormDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plan={editingPlan}
      />

      {isLoading ? (
        <div className="text-center py-12">Loading plans...</div>
      ) : (
        <div className="grid gap-4">
          {data?.data?.map((plan: any) => (
            <Card key={plan.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{plan.frequency || 'quarterly'}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!plan.is_active && (
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleActivate(plan.id)}
                        disabled={activateMutation.isPending}
                      >
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateSamples(plan.id)}
                      disabled={generateSamplesMutation.isPending}
                    >
                      Generate Samples
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Start Date:</span>
                    <p className="font-medium">
                      {plan.start_date ? format(new Date(plan.start_date), 'PP') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End Date:</span>
                    <p className="font-medium">
                      {plan.end_date ? format(new Date(plan.end_date), 'PP') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rules:</span>
                    <p className="font-medium">{plan.rules_count || 0} defined</p>
                  </div>
                </div>
                
                {plan.description && (
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data?.meta && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {data.meta.from} to {data.meta.to} of {data.meta.total} plans
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.meta.last_page}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
