import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workOrderService } from '../../services/workOrder.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { data: workOrders } = useQuery({
    queryKey: ['work-orders', { per_page: 500 }],
    queryFn: () => workOrderService.getWorkOrders({ per_page: 500 }),
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getWorkOrdersForDate = (date: number) => {
    if (!workOrders?.data) return [];
    return workOrders.data.filter((wo: any) => {
      const woDate = new Date(wo.due_at);
      return (
        woDate.getDate() === date &&
        woDate.getMonth() === currentMonth.getMonth() &&
        woDate.getFullYear() === currentMonth.getFullYear() &&
        (priorityFilter === 'all' || wo.priority === priorityFilter)
      );
    });
  };

  const days = Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => i + 1);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Schedule</h1>
        <p className="text-muted-foreground">View and manage work orders by calendar</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[150px]">{monthName}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map((i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {days.map((day) => {
              const dayWorkOrders = getWorkOrdersForDate(day);
              return (
                <div
                  key={day}
                  className="aspect-square border rounded-lg p-2 hover:bg-muted/50 transition-colors bg-card"
                >
                  <div className="text-sm font-semibold mb-1">{day}</div>
                  <div className="space-y-1 max-h-[60px] overflow-y-auto text-xs">
                    {dayWorkOrders.slice(0, 2).map((wo: any) => (
                      <Badge key={wo.id} className={`${priorityColors[wo.priority as keyof typeof priorityColors]} text-xs`}>
                        {wo.kind}
                      </Badge>
                    ))}
                    {dayWorkOrders.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{dayWorkOrders.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Scheduled</p>
            <p className="text-2xl font-bold">{workOrders?.data?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold">
              {workOrders?.data?.filter((wo: any) => {
                const woDate = new Date(wo.due_at);
                return woDate.getMonth() === currentMonth.getMonth();
              }).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">High Priority</p>
            <p className="text-2xl font-bold text-orange-600">
              {workOrders?.data?.filter((wo: any) => wo.priority === 'high').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Critical</p>
            <p className="text-2xl font-bold text-red-600">
              {workOrders?.data?.filter((wo: any) => wo.priority === 'critical').length || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
