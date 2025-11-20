import { useQuery } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Activity, AlertTriangle, Calendar, Droplets, Power } from 'lucide-react';
import { format } from 'date-fns';

export function OperationsConsole() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['operations-dashboard'],
    queryFn: () => coreOpsService.operations.getDashboard(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading operations console...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading operations dashboard: {(error as Error).message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getCauseIcon = (cause: string) => {
    switch (cause) {
      case 'planned':
        return <Calendar className="h-4 w-4" />;
      case 'fault':
        return <AlertTriangle className="h-4 w-4" />;
      case 'power':
        return <Power className="h-4 w-4" />;
      case 'water_quality':
        return <Droplets className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'live':
        return 'destructive';
      case 'approved':
        return 'default';
      case 'restored':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Operations Console</h1>
        <p className="text-muted-foreground">Real-time monitoring and control center</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Outages</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.kpis.outages_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Approved or currently live
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pump Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.kpis.schedules_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Next 24 hours
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Dosing Plans</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.kpis.dose_plans_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Actively controlling dosing
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-foreground">Active Outages</CardTitle>
            <CardDescription>Current and planned water supply interruptions</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.active_outages && data.active_outages.length > 0 ? (
              <div className="space-y-4">
                {data.active_outages.map((outage) => (
                  <div key={outage.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="mt-1">
                      {getCauseIcon(outage.cause)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-foreground">
                          {outage.scheme?.name || 'Unknown Scheme'}
                          {outage.code && <span className="text-muted-foreground ml-2">({outage.code})</span>}
                        </div>
                        <Badge variant={getStateColor(outage.state)}>{outage.state}</Badge>
                      </div>
                      {outage.summary && (
                        <p className="text-sm text-muted-foreground">{outage.summary}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Start: {format(new Date(outage.starts_at), 'PPp')}</span>
                        {outage.ends_at && (
                          <span>End: {format(new Date(outage.ends_at), 'PPp')}</span>
                        )}
                      </div>
                      {outage.estimated_customers_affected && (
                        <div className="text-xs text-muted-foreground">
                          ~{outage.estimated_customers_affected.toLocaleString()} customers affected
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No active outages</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-foreground">Pump Schedules</CardTitle>
            <CardDescription>Scheduled and running pump operations</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.active_schedules && data.active_schedules.length > 0 ? (
              <div className="space-y-4">
                {data.active_schedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="mt-1">
                      <Power className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-foreground">
                          {schedule.asset?.name || schedule.asset?.code || 'Unknown Asset'}
                        </div>
                        <Badge variant={getStatusColor(schedule.status)}>{schedule.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {schedule.scheme?.name}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{format(new Date(schedule.start_at), 'PPp')}</span>
                        <span>→</span>
                        <span>{format(new Date(schedule.end_at), 'PPp')}</span>
                      </div>
                      {schedule.target_volume_m3 && (
                        <div className="text-xs text-muted-foreground">
                          Target: {schedule.target_volume_m3.toLocaleString()} m³
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No scheduled pumping</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-foreground">Active Dosing Plans</CardTitle>
          <CardDescription>Chemical dosing control currently in effect</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.active_dose_plans && data.active_dose_plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.active_dose_plans.map((plan) => (
                <div key={plan.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-4 w-4 text-primary" />
                    <div className="font-medium text-foreground">
                      {plan.asset?.name || plan.asset?.code || 'Unknown Asset'}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {plan.scheme?.name}
                  </div>
                  {plan.chemical && (
                    <div className="text-xs text-muted-foreground">
                      Chemical: {plan.chemical}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No active dosing plans</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-foreground">Alarm Tags</CardTitle>
          <CardDescription>Telemetry tags with threshold monitoring enabled</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.alarm_tags && data.alarm_tags.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.alarm_tags.map((tag) => (
                <div key={tag.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-foreground">{tag.tag_name}</div>
                    <Badge variant="outline">{tag.data_type}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {tag.scheme?.name || tag.asset?.name || tag.facility?.name}
                  </div>
                  {tag.unit && (
                    <div className="text-xs text-muted-foreground mb-1">Unit: {tag.unit}</div>
                  )}
                  {tag.thresholds && (
                    <div className="text-xs text-muted-foreground">
                      Thresholds: {Object.entries(tag.thresholds).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No alarm tags configured</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
