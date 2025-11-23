import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Clock, MapPin, Users, AlertTriangle, Plus } from 'lucide-react';
import { format } from 'date-fns';

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['shifts', statusFilter],
    queryFn: () => coreOpsService.shifts.list({
      status: statusFilter === 'all' ? undefined : statusFilter,
      per_page: 50,
    }),
  });

  const closeShiftMutation = useMutation({
    mutationFn: (shiftId: string) => coreOpsService.shifts.close(shiftId, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Shift
        </Button>
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
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    {shift.status === 'active' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => closeShiftMutation.mutate(shift.id)}
                        disabled={closeShiftMutation.isPending}
                      >
                        Close
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
