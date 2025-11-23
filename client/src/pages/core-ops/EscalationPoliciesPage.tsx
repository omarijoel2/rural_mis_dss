import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Plus, AlertTriangle, Trash2, Edit2 } from 'lucide-react';
import { EscalationPolicyForm } from '../../components/core-ops/EscalationPolicyForm';

interface EscalationRule {
  severity: 'critical' | 'high' | 'medium' | 'low';
  escalate_after_minutes: number;
  notification_channels: string[];
  recipients: Array<{
    type: 'user' | 'role' | 'email' | 'phone';
    target: string;
  }>;
  repeat_every_minutes?: number;
}

interface EscalationPolicy {
  id: number;
  name: string;
  rules: EscalationRule[];
  created_at: string;
  updated_at: string;
}

export function EscalationPoliciesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<EscalationPolicy | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['escalation-policies', searchTerm],
    queryFn: () => coreOpsService.escalationPolicies.list({
      search: searchTerm || undefined,
      per_page: 50,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (policyId: number) => coreOpsService.escalationPolicies.delete(policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-policies'] });
    },
  });

  const policies = data?.data || [];

  const getSeverityColor = (severity: string) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Escalation Policies</h1>
          <p className="text-muted-foreground mt-1">Define SLA escalation rules and notification recipients</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Escalation Policy</DialogTitle>
              <DialogDescription>
                Define notification rules for event escalation by severity
              </DialogDescription>
            </DialogHeader>
            <EscalationPolicyForm
              onSuccess={() => {
                setIsCreateOpen(false);
                queryClient.invalidateQueries({ queryKey: ['escalation-policies'] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Input
        placeholder="Search policies..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      {/* Loading & Error States */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Loading policies...
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading policies: {(error as Error).message}
          </AlertDescription>
        </Alert>
      ) : policies.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No escalation policies found. Create one to get started!
          </CardContent>
        </Card>
      ) : (
        /* Policies Grid */
        <div className="grid gap-4">
          {policies.map((policy: EscalationPolicy) => (
            <Card key={policy.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <h3 className="font-semibold text-lg">{policy.name}</h3>

                    {/* Rules Summary */}
                    <div className="space-y-3">
                      {policy.rules?.map((rule, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-muted">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className={getSeverityColor(rule.severity) as any}>
                                  {rule.severity}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Escalate after {rule.escalate_after_minutes} min
                                </span>
                                {rule.repeat_every_minutes && (
                                  <span className="text-xs text-muted-foreground">
                                    (Repeat every {rule.repeat_every_minutes} min)
                                  </span>
                                )}
                              </div>

                              <div className="text-sm">
                                <div className="text-muted-foreground mb-1">Channels:</div>
                                <div className="flex flex-wrap gap-1">
                                  {rule.notification_channels?.map((ch) => (
                                    <Badge key={ch} variant="outline" className="text-xs">
                                      {ch}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="text-sm">
                                <div className="text-muted-foreground mb-1">Recipients:</div>
                                <div className="flex flex-wrap gap-2">
                                  {rule.recipients?.map((r, ridx) => (
                                    <div key={ridx} className="text-xs bg-background rounded px-2 py-1 border">
                                      {r.type}: {r.target}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Escalation Policy</DialogTitle>
                        </DialogHeader>
                        <EscalationPolicyForm
                          initialPolicy={policy}
                          onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ['escalation-policies'] });
                          }}
                        />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(policy.id)}
                      disabled={deleteMutation.isPending}
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
