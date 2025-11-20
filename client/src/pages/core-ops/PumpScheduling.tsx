import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Power, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export function PumpScheduling() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['pump-schedules', statusFilter],
    queryFn: () => coreOpsService.scheduling.getSchedules({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      per_page: 50,
    }),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getSourceBadge = (source?: string) => {
    if (!source) return null;
    return (
      <Badge variant={source === 'optimizer' ? 'default' : 'outline'} className="text-xs">
        {source === 'optimizer' ? 'Optimized' : 'Manual'}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-destructive">Error loading schedules: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pump Scheduling</h1>
          <p className="text-muted-foreground">Optimize and manage pump operations</p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="w-48">
              <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schedules</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => setStatusFilter('all')}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Loading pump schedules...</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data.map((schedule) => (
              <Card key={schedule.id} className="bg-card text-card-foreground hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Power className="h-4 w-4" />
                      <div>
                        <CardTitle className="text-base text-foreground">
                          {schedule.asset?.name || schedule.asset?.code || 'Unknown Pump'}
                        </CardTitle>
                        <CardDescription>{schedule.scheme?.name}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getStatusColor(schedule.status)} className="capitalize">
                        {schedule.status}
                      </Badge>
                      {getSourceBadge(schedule.source)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Start Time</div>
                      <div className="font-medium text-foreground">
                        {format(new Date(schedule.start_at), 'PPp')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">End Time</div>
                      <div className="font-medium text-foreground">
                        {format(new Date(schedule.end_at), 'PPp')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    {schedule.target_volume_m3 && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Target Volume</div>
                          <div className="font-medium text-foreground">
                            {schedule.target_volume_m3.toLocaleString()} m³
                          </div>
                        </div>
                      </div>
                    )}
                    {schedule.actual_volume_m3 && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <div>
                          <div className="text-xs text-muted-foreground">Actual Volume</div>
                          <div className="font-medium text-foreground">
                            {schedule.actual_volume_m3.toLocaleString()} m³
                          </div>
                        </div>
                      </div>
                    )}
                    {schedule.energy_cost && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Energy Cost</div>
                          <div className="font-medium text-foreground">
                            ${schedule.energy_cost.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {schedule.constraints && Object.keys(schedule.constraints).length > 0 && (
                    <div className="pt-4 border-t">
                      <div className="text-xs font-medium text-foreground mb-2">Constraints</div>
                      <div className="text-xs text-muted-foreground">
                        {Object.keys(schedule.constraints).length} constraint(s) applied
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {data?.data.length === 0 && (
            <Card className="bg-card text-card-foreground">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Power className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-4">No pump schedules found</p>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  Create First Schedule
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
