import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

interface Consent {
  id: string;
  purpose: string;
  given_at: string;
  revoked_at: string | null;
  expires_at: string | null;
  metadata: any;
}

export function ConsentsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['consents', 'active'],
    queryFn: () => apiClient.get<{ consents: Consent[] }>('/consents/active'),
  });

  const consents = data?.consents || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Consent Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Track and manage user consent for data processing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Consents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {consents.filter(c => !c.revoked_at).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revoked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {consents.filter(c => c.revoked_at).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              Error loading consents: {error?.message || 'Unknown error'}
            </div>
          ) : consents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No consents found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Given At</TableHead>
                  <TableHead>Expires At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consents.map((consent) => (
                  <TableRow key={consent.id}>
                    <TableCell className="font-medium">{consent.purpose}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {new Date(consent.given_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {consent.expires_at ? new Date(consent.expires_at).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      {consent.revoked_at ? (
                        <Badge variant="outline">
                          <XCircle className="h-3 w-3 mr-1" />
                          Revoked
                        </Badge>
                      ) : (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
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
