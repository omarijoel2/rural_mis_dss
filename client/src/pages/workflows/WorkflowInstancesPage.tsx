import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface WorkflowInstance {
  id: number;
  entity_type: string;
  entity_id: string;
  state: string;
  started_at: string;
  closed_at?: string;
}

export function WorkflowInstancesPage() {
  const queryClient = useQueryClient();
  const [stateFilter, setStateFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['workflow-instances', stateFilter, entityTypeFilter],
    queryFn: () =>
      apiClient.get('/workflows/instances', {
        state: stateFilter || undefined,
        entity_type: entityTypeFilter || undefined,
      }),
  });

  const triggerMutation = useMutation({
    mutationFn: (params: { id: number; trigger: string }) =>
      apiClient.post(`/workflows/instances/${params.id}/trigger`, {
        trigger: params.trigger,
      }),
    onSuccess: () => {
      toast.success('Triggered successfully');
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] });
    },
  });

  const instances = (data as any)?.data || [];

  const getStateBadgeColor = (state: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      assigned: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-purple-100 text-purple-800',
      done: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[state] || 'outline';
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Workflow Instances</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Monitor running workflow instances in real-time. Track the progress of Work Orders, Incidents, Complaints, Procurement requests, and other business entities as they move through defined workflow states. Manually trigger transitions, check SLA compliance, and view the complete audit trail of all state changes.
        </p>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Filter by state..."
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="max-w-sm"
        />
        <Input
          placeholder="Filter by entity type..."
          value={entityTypeFilter}
          onChange={(e) => setEntityTypeFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : instances.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No instances found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {instances.map((instance: WorkflowInstance) => (
            <Card key={instance.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        {instance.entity_type} #{instance.entity_id}
                      </h3>
                      <Badge className={getStateBadgeColor(instance.state)}>
                        {instance.state}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Started: {format(new Date(instance.started_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        triggerMutation.mutate({
                          id: instance.id,
                          trigger: 'proceed',
                        })
                      }
                      disabled={triggerMutation.isPending}
                    >
                      Proceed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        (window.location.href = `/workflows/instances/${instance.id}`)
                      }
                    >
                      Details
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
