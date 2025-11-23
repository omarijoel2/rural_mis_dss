import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Plus, AlertTriangle, Zap, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface DroughtEvent {
  id: number;
  name: string;
  status: string;
  severity: string;
  startDate: string;
  affectedPopulation: number;
  activatedBoreholes: number;
  waterRationing: boolean;
}

export function DroughtResponsePage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDrought, setNewDrought] = useState({ name: '', severity: 'high' });
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const { data, isLoading } = useQuery({
    queryKey: ['drought-events', page],
    queryFn: () => apiClient.get('/core-ops/droughts'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/core-ops/droughts', data),
    onSuccess: () => {
      toast.success('Drought event declared');
      queryClient.invalidateQueries({ queryKey: ['drought-events'] });
      setIsCreateOpen(false);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/core-ops/droughts/${id}/activate`, {}),
    onSuccess: () => {
      toast.success('Emergency response activated');
      queryClient.invalidateQueries({ queryKey: ['drought-events'] });
    },
  });

  const events = (data as any)?.data || [];
  const activeEvent = events.find((e: DroughtEvent) => e.status === 'active');

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return 'bg-red-100 text-red-800 border-red-300';
    if (severity === 'high') return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const stats = {
    declared: events.filter((e: DroughtEvent) => e.status === 'declared').length,
    active: events.filter((e: DroughtEvent) => e.status === 'active').length,
    resolved: events.filter((e: DroughtEvent) => e.status === 'resolved').length,
    totalPopulation: events.reduce((sum: number, e: DroughtEvent) => sum + (e.affectedPopulation || 0), 0),
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">Drought Response Center</h1>
          <p className="text-muted-foreground">
            Rapidly mobilize emergency boreholes and water sources during drought. Coordinate strategic borehole activation, track affected populations, and manage water rationing.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Declare Drought
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Declare Drought Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Event Name</label>
                <Input
                  placeholder="e.g., 2025 ASAL Drought - Jan-Mar"
                  value={newDrought.name}
                  onChange={(e) => setNewDrought({ ...newDrought, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Severity Level</label>
                <select
                  className="w-full rounded border p-2"
                  value={newDrought.severity}
                  onChange={(e) => setNewDrought({ ...newDrought, severity: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <Button
                onClick={() =>
                  createMutation.mutate({
                    name: newDrought.name,
                    severity: newDrought.severity,
                  })
                }
                disabled={createMutation.isPending}
                className="w-full"
              >
                Declare Drought
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activeEvent && (
        <Alert className={`border-2 ${getSeverityColor(activeEvent.severity)}`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Active Drought Event:</strong> {activeEvent.name} ({activeEvent.severity.toUpperCase()})
            - {activeEvent.affectedPopulation?.toLocaleString()} people affected.{' '}
            <strong>{activeEvent.activatedBoreholes}</strong> emergency boreholes activated.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Drought Events Declared</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.declared}</div>
            <p className="text-xs text-muted-foreground mt-1">On record</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-600" /> Active Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Ongoing responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Affected Population</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(stats.totalPopulation / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground mt-1">Across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Drought Events & Response Status</CardTitle>
            <span className="text-sm text-muted-foreground">
              {events.length} events
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[550px] pr-4">
            <div className="space-y-4">
              {isLoading ? (
                <p>Loading drought events...</p>
              ) : (
                events.slice((page - 1) * pageSize, page * pageSize).map((event: DroughtEvent) => (
                <div
                  key={event.id}
                  className={`p-4 border-2 rounded-lg ${getSeverityColor(event.severity)}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-lg">{event.name}</p>
                      <p className="text-sm">
                        Started: {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge>{event.status.toUpperCase()}</Badge>
                      {event.waterRationing && (
                        <Badge variant="destructive">RATIONING</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Affected Population</p>
                      <p className="text-2xl font-bold">
                        {(event.affectedPopulation / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Emergency Boreholes</p>
                      <p className="text-2xl font-bold">{event.activatedBoreholes}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Response Status</p>
                      <p className="text-sm font-semibold">
                        {event.status === 'declared' ? 'Preparing' : 'Active'}
                      </p>
                    </div>
                  </div>

                  {event.status === 'declared' && (
                    <Button
                      size="sm"
                      onClick={() => activateMutation.mutate(event.id)}
                      disabled={activateMutation.isPending}
                      className="w-full"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Activate Emergency Response
                    </Button>
                  )}
                </div>
              ))
              )}
            </div>
          </ScrollArea>

          {events.length > pageSize && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(events.length / pageSize)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(Math.ceil(events.length / pageSize), page + 1))}
                  disabled={page >= Math.ceil(events.length / pageSize)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
