import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Clock, MapPin, Users, AlertTriangle, Plus, Loader2, Trash2, Play } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Shift {
  id: string;
  name: string;
  facility_id?: string;
  facility?: { name: string };
  starts_at: string;
  ends_at: string;
  supervisor_id?: string;
  supervisor?: { name: string };
  status: 'planned' | 'active' | 'closed';
  entries_count?: number;
}

export function ShiftsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planned' | 'active' | 'closed'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftStart, setNewShiftStart] = useState('');
  const [newShiftEnd, setNewShiftEnd] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['shifts', statusFilter],
    queryFn: () => coreOpsService.shifts.list({
      status: statusFilter === 'all' ? undefined : statusFilter,
      per_page: 50,
    }),
  });

  const createShiftMutation = useMutation({
    mutationFn: (data: any) => coreOpsService.shifts.create(data),
    onSuccess: () => {
      toast.success('Shift created successfully');
      setIsCreateOpen(false);
      setNewShiftName('');
      setNewShiftStart('');
      setNewShiftEnd('');
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
    onError: () => {
      toast.error('Failed to create shift');
    },
  });

  const closeShiftMutation = useMutation({
    mutationFn: (shiftId: string) => coreOpsService.shifts.close(shiftId, {}),
    onSuccess: () => {
      toast.success('Shift closed');
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
    onError: () => {
      toast.error('Failed to close shift');
    },
  });

  const activateShiftMutation = useMutation({
    mutationFn: (shiftId: string) => coreOpsService.shifts.activate(shiftId),
    onSuccess: () => {
      toast.success('Shift activated');
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
    onError: () => {
      toast.error('Failed to activate shift');
    },
  });

  const deleteShiftMutation = useMutation({
    mutationFn: (shiftId: string) => coreOpsService.shifts.delete(shiftId),
    onSuccess: () => {
      toast.success('Shift deleted');
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
    onError: () => {
      toast.error('Failed to delete shift');
    },
  });

  const handleCreateShift = () => {
    if (!newShiftName || !newShiftStart) {
      toast.error('Please fill in required fields');
      return;
    }
    createShiftMutation.mutate({
      name: newShiftName,
      starts_at: newShiftStart,
      ends_at: newShiftEnd || undefined,
      status: 'planned',
    });
  };

  const filteredShifts = data?.data?.filter((shift: Shift) =>
    shift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.facility?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Shifts Management</h1>
          <p className="text-muted-foreground mt-1">24/7 shift scheduling and logbook</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Shift</DialogTitle>
              <DialogDescription>Schedule a new shift for operators</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="shift-name">Shift Name *</Label>
                <Input
                  id="shift-name"
                  placeholder="e.g., Morning Shift - Dec 9"
                  value={newShiftName}
                  onChange={(e) => setNewShiftName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-start">Start Time *</Label>
                <Input
                  id="shift-start"
                  type="datetime-local"
                  value={newShiftStart}
                  onChange={(e) => setNewShiftStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-end">End Time</Label>
                <Input
                  id="shift-end"
                  type="datetime-local"
                  value={newShiftEnd}
                  onChange={(e) => setNewShiftEnd(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateShift} disabled={createShiftMutation.isPending}>
                {createShiftMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Shift
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by shift name or facility..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {(['all', 'planned', 'active', 'closed'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              size="sm"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Loading shifts...
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading shifts: {(error as Error).message}
          </AlertDescription>
        </Alert>
      ) : filteredShifts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No shifts found
          </CardContent>
        </Card>
      ) : (
        /* Shifts Grid */
        <div className="grid gap-4">
          {filteredShifts.map((shift: Shift) => (
            <Card key={shift.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{shift.name}</h3>
                      <Badge className={getStatusColor(shift.status)}>
                        {shift.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {shift.facility && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {shift.facility.name}
                        </div>
                      )}
                      {shift.supervisor && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {shift.supervisor.name}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {format(new Date(shift.starts_at), 'HH:mm')} - {format(new Date(shift.ends_at), 'HH:mm')}
                      </div>
                      {shift.entries_count !== undefined && (
                        <div className="text-muted-foreground">
                          {shift.entries_count} entries
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {shift.status === 'planned' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => activateShiftMutation.mutate(shift.id)}
                        disabled={activateShiftMutation.isPending || deleteShiftMutation.isPending}
                      >
                        {activateShiftMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-1" />
                        )}
                        Activate
                      </Button>
                    )}
                    {shift.status === 'active' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => closeShiftMutation.mutate(shift.id)}
                        disabled={closeShiftMutation.isPending}
                      >
                        {closeShiftMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                        Close Shift
                      </Button>
                    )}
                    {shift.status !== 'active' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Delete this shift?')) {
                            deleteShiftMutation.mutate(shift.id);
                          }
                        }}
                        disabled={deleteShiftMutation.isPending || activateShiftMutation.isPending}
                      >
                        {deleteShiftMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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
