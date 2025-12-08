import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { AlertTriangle, CheckCircle, Clock, Zap, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEventCategory, setNewEventCategory] = useState('');
  const [newEventSeverity, setNewEventSeverity] = useState<string>('medium');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventSource, setNewEventSource] = useState('manual');

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', severityFilter, statusFilter],
    queryFn: () => coreOpsService.events.list({
      severity: severityFilter === 'all' ? undefined : severityFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
      per_page: 50,
    }),
  });

  const createEventMutation = useMutation({
    mutationFn: (data: any) => coreOpsService.events.create(data),
    onSuccess: () => {
      toast.success('Event created');
      setIsCreateOpen(false);
      setNewEventCategory('');
      setNewEventSeverity('medium');
      setNewEventDescription('');
      setNewEventSource('manual');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: () => {
      toast.error('Failed to create event');
    },
  });

  const acknowledgeEventMutation = useMutation({
    mutationFn: (eventId: string) => coreOpsService.events.acknowledge(eventId, { note: 'Acknowledged' }),
    onSuccess: () => {
      toast.success('Event acknowledged');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: () => {
      toast.error('Failed to acknowledge event');
    },
  });

  const resolveEventMutation = useMutation({
    mutationFn: (eventId: string) => coreOpsService.events.resolve(eventId, { resolution: 'Resolved' }),
    onSuccess: () => {
      toast.success('Event resolved');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: () => {
      toast.error('Failed to resolve event');
    },
  });

  const handleCreateEvent = () => {
    if (!newEventCategory) {
      toast.error('Please provide a category');
      return;
    }
    createEventMutation.mutate({
      category: newEventCategory,
      severity: newEventSeverity,
      description: newEventDescription || undefined,
      source: newEventSource,
      status: 'new',
      detected_at: new Date().toISOString(),
    });
  };

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Events & Alarms</h1>
          <p className="text-muted-foreground mt-1">Monitor, acknowledge, and resolve system events</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setNewEventCategory('');
            setNewEventSeverity('medium');
            setNewEventDescription('');
            setNewEventSource('manual');
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Report Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Report New Event</DialogTitle>
              <DialogDescription>Manually report an incident or alarm</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="event-category">Category *</Label>
                <Input
                  id="event-category"
                  placeholder="e.g., pressure_drop, contamination, leak"
                  value={newEventCategory}
                  onChange={(e) => setNewEventCategory(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-severity">Severity</Label>
                  <select
                    id="event-severity"
                    value={newEventSeverity}
                    onChange={(e) => setNewEventSeverity(e.target.value)}
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-source">Source</Label>
                  <select
                    id="event-source"
                    value={newEventSource}
                    onChange={(e) => setNewEventSource(e.target.value)}
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="manual">Manual Report</option>
                    <option value="field_staff">Field Staff</option>
                    <option value="customer">Customer Complaint</option>
                    <option value="scada">SCADA Alert</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  placeholder="Describe the event or incident..."
                  rows={3}
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateEvent} disabled={createEventMutation.isPending}>
                {createEventMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Report Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                        disabled={acknowledgeEventMutation.isPending || resolveEventMutation.isPending}
                      >
                        {acknowledgeEventMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                        Acknowledge
                      </Button>
                    )}
                    {event.status !== 'resolved' && event.status !== 'closed' && (
                      <Button
                        size="sm"
                        onClick={() => resolveEventMutation.mutate(event.id)}
                        disabled={resolveEventMutation.isPending || acknowledgeEventMutation.isPending}
                      >
                        {resolveEventMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
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
