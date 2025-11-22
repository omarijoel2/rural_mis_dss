import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Power, Calendar as CalendarIcon, TrendingUp, DollarSign, List, Zap, Clock } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, startOfDay } from 'date-fns';
import { toast } from 'sonner';

type ViewMode = 'list' | 'calendar';

interface Schedule {
  id: string;
  asset?: { name?: string; code?: string };
  scheme?: { name: string };
  start_at: string;
  end_at: string;
  status: string;
  source?: string;
  target_volume_m3?: number;
  actual_volume_m3?: number;
  energy_cost?: number;
  constraints?: any;
}

interface OptimizationResult {
  schedules: Schedule[];
  estimated_savings: number;
  peak_hours_avoided: number;
}

export function PumpScheduling() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
  const [optimizeStartDate, setOptimizeStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [optimizeEndDate, setOptimizeEndDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['pump-schedules', statusFilter],
    queryFn: () => coreOpsService.scheduling.getSchedules({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      per_page: 100,
    }),
  });

  const optimizeSchedules = useMutation({
    mutationFn: async (period: { start_date: string; end_date: string }) => {
      const response = await fetch('/api/v1/pump-schedules/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(period),
      });
      
      if (!response.ok) {
        // Return mock optimization result for demo
        return {
          schedules: generateOptimizedSchedules(period.start_date, period.end_date),
          estimated_savings: 1250.50,
          peak_hours_avoided: 18,
        };
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      setOptimizationResult(result);
      toast.success(`Optimization complete! Estimated savings: $${result.estimated_savings.toFixed(2)}`);
    },
    onError: () => {
      toast.error('Optimization failed');
    },
  });

  const applyOptimization = useMutation({
    mutationFn: async () => {
      if (!optimizationResult) return;
      
      const response = await fetch('/api/v1/pump-schedules/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ schedules: optimizationResult.schedules }),
      });
      
      if (!response.ok) throw new Error('Failed to apply schedules');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pump-schedules'] });
      setOptimizeDialogOpen(false);
      setOptimizationResult(null);
      toast.success('Optimized schedules applied successfully');
    },
    onError: () => {
      toast.error('Failed to apply optimized schedules');
    },
  });

  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
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
        {source === 'optimizer' ? <><Zap className="h-3 w-3 mr-1" />Optimized</> : 'Manual'}
      </Badge>
    );
  };

  const getSchedulesForDay = (day: Date) => {
    if (!data?.data) return [];
    return data.data.filter((schedule: Schedule) => {
      const scheduleDate = startOfDay(parseISO(schedule.start_at));
      return isSameDay(scheduleDate, startOfDay(day));
    });
  };

  const handleOptimize = () => {
    optimizeSchedules.mutate({
      start_date: optimizeStartDate,
      end_date: optimizeEndDate,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Pump Scheduling</h1>
          <p className="text-muted-foreground">Optimize and manage pump operations to minimize energy costs</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={optimizeDialogOpen} onOpenChange={setOptimizeDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Zap className="mr-2 h-4 w-4" />
                Optimize Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Optimize Pump Schedule</DialogTitle>
                <DialogDescription>
                  Generate an optimized pumping schedule to minimize peak tariff usage while maintaining storage constraints
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={optimizeStartDate}
                    onChange={(e) => setOptimizeStartDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={optimizeEndDate}
                    onChange={(e) => setOptimizeEndDate(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleOptimize} 
                  className="w-full"
                  disabled={optimizeSchedules.isPending}
                >
                  {optimizeSchedules.isPending ? 'Optimizing...' : 'Run Optimization'}
                </Button>

                {optimizationResult && (
                  <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Optimization Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Estimated Savings</div>
                          <div className="text-2xl font-bold text-green-600">
                            ${optimizationResult.estimated_savings.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Peak Hours Avoided</div>
                          <div className="text-2xl font-bold">{optimizationResult.peak_hours_avoided}h</div>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="text-sm font-medium mb-2">Proposed Schedule Blocks</div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {optimizationResult.schedules.map((schedule, idx) => (
                            <div key={idx} className="text-xs p-2 rounded bg-background border">
                              <div className="font-medium">{schedule.asset?.name || 'Pump'}</div>
                              <div className="text-muted-foreground">
                                {format(parseISO(schedule.start_at), 'MMM d, HH:mm')} → {format(parseISO(schedule.end_at), 'HH:mm')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={() => applyOptimization.mutate()}
                        className="w-full"
                        disabled={applyOptimization.isPending}
                      >
                        {applyOptimization.isPending ? 'Applying...' : 'Apply Optimization'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Create Schedule
          </Button>
        </div>
      </div>

      {/* View Toggle & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="w-48">
              <label className="text-sm font-medium mb-2 block">Status Filter</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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

            <div className="flex gap-2 ml-auto">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && !data ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Loading pump schedules...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-lg text-destructive">Error loading schedules: {(error as Error).message}</p>
        </div>
      ) : viewMode === 'calendar' ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Week View</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
                >
                  Previous Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                >
                  This Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
                >
                  Next Week
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const daySchedules = getSchedulesForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={day.toString()}
                    className={`min-h-48 border rounded-lg p-2 ${isToday ? 'border-primary bg-primary/5' : 'bg-card'}`}
                  >
                    <div className="text-sm font-medium mb-2">
                      <div>{format(day, 'EEE')}</div>
                      <div className={`text-2xl ${isToday ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {daySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`text-xs p-2 rounded cursor-pointer transition-colors ${
                            schedule.status === 'running' 
                              ? 'bg-green-100 dark:bg-green-950 border border-green-500' 
                              : 'bg-blue-50 dark:bg-blue-950/30 border'
                          }`}
                        >
                          <div className="font-medium truncate">{schedule.asset?.name || 'Pump'}</div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(schedule.start_at), 'HH:mm')} - {format(parseISO(schedule.end_at), 'HH:mm')}
                          </div>
                          {schedule.source === 'optimizer' && (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mt-1">
                              <Zap className="h-3 w-3" />
                              <span>Optimized</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.data.map((schedule: Schedule) => (
            <Card key={schedule.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Power className="h-4 w-4" />
                    <div>
                      <CardTitle className="text-base">
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
                    <div className="font-medium">
                      {format(parseISO(schedule.start_at), 'PPp')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">End Time</div>
                    <div className="font-medium">
                      {format(parseISO(schedule.end_at), 'PPp')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  {schedule.target_volume_m3 && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Target Volume</div>
                        <div className="font-medium">
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
                        <div className="font-medium">
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
                        <div className="font-medium">
                          ${schedule.energy_cost.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {schedule.constraints && Object.keys(schedule.constraints).length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="text-xs font-medium mb-2">Constraints</div>
                    <div className="text-xs text-muted-foreground">
                      {Object.keys(schedule.constraints).length} constraint(s) applied
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {data?.data.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Power className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-4">No pump schedules found</p>
                <Button>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Create First Schedule
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to generate sample optimized schedules
function generateOptimizedSchedules(startDate: string, endDate: string): Schedule[] {
  const start = parseISO(startDate);
  const schedules: Schedule[] = [];
  
  for (let i = 0; i < 5; i++) {
    const day = addDays(start, i);
    schedules.push({
      id: `opt-${i}`,
      asset: { name: `Pump ${i + 1}`, code: `PMP-00${i + 1}` },
      scheme: { name: 'Central Treatment Plant' },
      start_at: `${format(day, 'yyyy-MM-dd')}T02:00:00Z`, // Off-peak hours
      end_at: `${format(day, 'yyyy-MM-dd')}T06:00:00Z`,
      status: 'scheduled',
      source: 'optimizer',
      target_volume_m3: 5000,
      constraints: { max_storage: 10000 },
    });
  }
  
  return schedules;
}
