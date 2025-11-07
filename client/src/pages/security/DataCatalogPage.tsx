import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Settings, Database } from 'lucide-react';

interface DataCatalogEntry {
  id: string;
  table_name: string;
  column_name: string;
  data_class: string;
  is_pii: boolean;
  encryption_required: boolean;
  retention_period_days: number | null;
}

export function DataCatalogPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['data-catalog'],
    queryFn: () => apiClient.get<{ catalog: DataCatalogEntry[] }>('/data-catalog'),
  });

  const catalog = data?.catalog || [];
  const piiCount = catalog.filter(e => e.is_pii).length;
  const encryptedCount = catalog.filter(e => e.encryption_required).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Data Catalog
          </h2>
          <p className="text-muted-foreground mt-1">
            Data classification and compliance inventory
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{catalog.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">PII Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{piiCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Encrypted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{encryptedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(catalog.map(e => e.table_name)).size}
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
              Error loading data catalog: {error?.message || 'Unknown error'}
            </div>
          ) : catalog.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No data catalog entries</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead>Column</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>PII</TableHead>
                  <TableHead>Encryption</TableHead>
                  <TableHead>Retention</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-sm">
                      <Database className="h-4 w-4 inline mr-1" />
                      {entry.table_name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{entry.column_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.data_class}</Badge>
                    </TableCell>
                    <TableCell>
                      {entry.is_pii ? (
                        <Badge variant="destructive">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.encryption_required ? (
                        <Badge variant="default">Required</Badge>
                      ) : (
                        <Badge variant="outline">Optional</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.retention_period_days ? `${entry.retention_period_days}d` : '-'}
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
