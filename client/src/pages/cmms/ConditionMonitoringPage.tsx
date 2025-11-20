import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { conditionMonitoringService } from '../../services/cmms.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Activity, AlertTriangle, TrendingUp, Gauge } from 'lucide-react';

const HEALTH_COLORS = {
  normal: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  alarm: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export function ConditionMonitoringPage() {
  const [filters, setFilters] = useState({ page: 1, per_page: 20 });

  const { data, isLoading } = useQuery({
    queryKey: ['condition-tags', filters],
    queryFn: () => conditionMonitoringService.getTags(filters),
  });

  const activeAlarms = data?.data?.filter(tag => tag.health_status !== 'normal') || [];
  const criticalCount = activeAlarms.filter(tag => tag.health_status === 'critical').length;
  const alarmCount = activeAlarms.filter(tag => tag.health_status === 'alarm').length;
  const warningCount = activeAlarms.filter(tag => tag.health_status === 'warning').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Condition Monitoring</h1>
        <p className="text-muted-foreground">Real-time asset health and predictive analytics</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Monitoring points</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Immediate action required</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Alarms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{alarmCount}</div>
            <p className="text-xs text-muted-foreground">Out of range</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <p className="text-xs text-muted-foreground">Watch closely</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Condition Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Last Value</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Last Reading</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-mono">{tag.tag}</TableCell>
                    <TableCell>{tag.parameter}</TableCell>
                    <TableCell className="font-semibold">
                      {tag.last_value?.toFixed(2) || '—'} {tag.unit}
                    </TableCell>
                    <TableCell>
                      <Badge className={HEALTH_COLORS[tag.health_status]}>
                        {tag.health_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tag.last_reading_at
                        ? new Date(tag.last_reading_at).toLocaleString()
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tag.is_active ? 'default' : 'secondary'}>
                        {tag.is_active ? 'Active' : 'Inactive'}
                      </Badge>
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
