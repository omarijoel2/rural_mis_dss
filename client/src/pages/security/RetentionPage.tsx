import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Clock, Plus } from 'lucide-react';

interface RetentionPolicy {
  id: string;
  data_type: string;
  retention_period_days: number;
  deletion_method: string;
  is_active: boolean;
  last_applied_at: string | null;
  created_at: string;
}

export function RetentionPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['retention', 'policies'],
    queryFn: () => apiClient.get<{ policies: RetentionPolicy[] }>('/retention/policies'),
  });

  const policies = data?.policies || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="h-8 w-8" />
            Data Retention Policies
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure automated data retention and deletion rules
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Policy
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {policies.filter(p => p.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Data Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{policies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {policies[0]?.last_applied_at 
                ? new Date(policies[0].last_applied_at).toLocaleDateString()
                : 'Never'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              Error loading retention policies: {error?.message || 'Unknown error'}
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No retention policies configured</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Retention Period</TableHead>
                  <TableHead>Deletion Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.data_type}</TableCell>
                    <TableCell>{policy.retention_period_days} days</TableCell>
                    <TableCell>
                      <Badge variant="outline">{policy.deletion_method}</Badge>
                    </TableCell>
                    <TableCell>
                      {policy.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {policy.last_applied_at ? new Date(policy.last_applied_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
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
