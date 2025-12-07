import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'ack' | 'in_progress' | 'resolved' | 'closed';
  description?: string;
  detected_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  facility?: { name: string };
  source: string;
}

export function EventsPage() {
  const queryClient = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'ack' | 'resolved'>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', severityFilter, statusFilter],
    queryFn: () => coreOpsService.events.list({
      severity: severityFilter === 'all' ? undefined : severityFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
      per_page: 50,
    }),
  });

  const acknowledgeEventMutation = useMutation({
    mutationFn: (eventId: string) => coreOpsService.events.acknowledge(eventId, { note: 'Acknowledged' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const resolveEventMutation = useMutation({
    mutationFn: (eventId: string) => coreOpsService.events.resolve(eventId, { resolution: 'Resolved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Zap className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-800';
      case 'ack':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'outline';
    }
  };

  const events = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Events & Alarms</h1>
        <p className="text-muted-foreground mt-1">Monitor, acknowledge, and resolve system events</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <span className="text-sm font-medium text-muted-foreground py-2">Severity:</span>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((s) => (
            <Button
              key={s}
              variant={severityFilter === s ? 'default' : 'outline'}
              onClick={() => setSeverityFilter(s)}
              size="sm"
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="text-sm font-medium text-muted-foreground py-2">Status:</span>
          {(['all', 'new', 'ack', 'resolved'] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => setStatusFilter(s)}
              size="sm"
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Loading events...
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading events: {(error as Error).message}
          </AlertDescription>
        </Alert>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No events found
          </CardContent>
        </Card>
      ) : (
        /* Events Table */
        <div className="space-y-3">
          {events.map((event: Event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(event.severity) && (
                        <>{getSeverityIcon(event.severity)}</>
                      )}
                      <h3 className="font-semibold">{event.category}</h3>
                      <Badge className={getSeverityColor(event.severity) as any}>
                        {event.severity}
                      </Badge>
                      <Badge className={getStatusColor(event.status) as any}>
                        {event.status}
                      </Badge>
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.detected_at ? format(new Date(event.detected_at), 'Pp') : 'N/A'}
                      </div>
                      {event.facility && (
                        <div>{event.facility.name}</div>
                      )}
                      <div className="text-gray-500">{event.source}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {event.status === 'new' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeEventMutation.mutate(event.id)}
                        disabled={acknowledgeEventMutation.isPending}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {event.status !== 'resolved' && event.status !== 'closed' && (
                      <Button
                        size="sm"
                        onClick={() => resolveEventMutation.mutate(event.id)}
                        disabled={resolveEventMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
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
