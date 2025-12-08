import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { FileText, Search, Download } from 'lucide-react';

interface AuditEvent {
  id: string;
  tenant_id: string;
  actor_id: string;
  actor_type: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  ip: string;
  ua: string;
  diff: Record<string, any> | null;
  occurred_at: string;
}

export function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['audit', 'recent'],
    queryFn: () => apiClient.get<{ audit_events: AuditEvent[] }>('/security/audit'),
  });

  const auditEvents = data?.audit_events || [];

  const filteredEvents = auditEvents.filter(event =>
    event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.diff?.email && event.diff.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    event.entity_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('failed')) return 'destructive';
    if (action.includes('create') || action.includes('success')) return 'default';
    if (action.includes('update') || action.includes('edit')) return 'secondary';
    return 'outline';
  };

  const formatAction = (action: string) => {
    return action.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' > ');
  };

  const getEntityDisplay = (event: AuditEvent) => {
    if (!event.entity_type) return '-';
    const typeName = event.entity_type.split('\\').pop() || event.entity_type;
    return typeName;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Audit Logs
          </h2>
          <p className="text-muted-foreground mt-1">
            View and search system audit trail
          </p>
        </div>
        
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by action or entity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              Error loading audit events: {error?.message || 'Unknown error'}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No audit events found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(event.occurred_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionColor(event.action) as any}>
                        {formatAction(event.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {getEntityDisplay(event)}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {event.diff?.email && (
                        <span className="text-muted-foreground">{event.diff.email}</span>
                      )}
                      {event.diff?.selected_tenant && (
                        <span className="text-muted-foreground ml-2">({event.diff.selected_tenant})</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{event.ip}</TableCell>
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
