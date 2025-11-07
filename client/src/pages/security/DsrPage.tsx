import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Database, CheckCircle, XCircle } from 'lucide-react';

interface DsrRequest {
  id: string;
  request_type: string;
  status: string;
  requested_at: string;
  processed_at: string | null;
  processed_by: string | null;
  data_payload: any;
}

export function DsrPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dsr', 'pending'],
    queryFn: () => apiClient.get<{ dsr_requests: DsrRequest[] }>('/dsr/pending'),
  });

  const requests = data?.dsr_requests || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Data Subject Requests
          </h2>
          <p className="text-muted-foreground mt-1">
            Process GDPR data subject access, deletion, and rectification requests
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {requests.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2.3d</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              Error loading DSR requests: {error?.message || 'Unknown error'}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No pending DSR requests</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(request.requested_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{request.request_type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(request.status) as any}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {request.processed_at ? new Date(request.processed_at).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
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
