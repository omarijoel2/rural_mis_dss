import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Lock, Plus, RefreshCw } from 'lucide-react';

interface KmsKey {
  id: string;
  key_id: string;
  key_type: string;
  algorithm: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  rotated_at: string | null;
}

export function KmsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['kms', 'keys'],
    queryFn: () => apiClient.get<{ keys: KmsKey[] }>('/kms/keys'),
  });

  const keys = data?.keys || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'rotating': return 'secondary';
      case 'retired': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Lock className="h-8 w-8" />
            Encryption Key Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage encryption keys and rotation policies
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate Key
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{keys.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {keys.filter(k => k.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Rotating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {keys.filter(k => k.status === 'rotating').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Retired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {keys.filter(k => k.status === 'retired').length}
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
              Error loading encryption keys: {error?.message || 'Unknown error'}
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No encryption keys found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Algorithm</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Rotated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-mono text-sm">{key.key_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{key.key_type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{key.algorithm}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(key.status) as any}>
                        {key.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {new Date(key.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {key.rotated_at ? new Date(key.rotated_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Rotate
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
