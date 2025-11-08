import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { workOrderService } from '../../services/workOrder.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Plus, Search, AlertCircle, Edit } from 'lucide-react';
import type { WorkOrder, WorkOrderFilters } from '../../types/cmms';
import { WorkOrderFormDialog } from '../../components/cmms/WorkOrderFormDialog';

const STATUS_OPTIONS = [
  { value: 'none', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const KIND_OPTIONS = [
  { value: 'none', label: 'All Types' },
  { value: 'pm', label: 'Preventive Maintenance' },
  { value: 'cm', label: 'Corrective Maintenance' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'project', label: 'Project' },
];

const PRIORITY_OPTIONS = [
  { value: 'none', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export function WorkOrdersPage() {
  const [filters, setFilters] = useState<WorkOrderFilters>({
    per_page: 15,
    page: 1,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | undefined>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['work-orders', filters],
    queryFn: () => workOrderService.getWorkOrders(filters),
  });

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search, page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ 
      ...filters, 
      status: (status && status !== 'none') ? (status as 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled') : undefined, 
      page: 1 
    });
  };

  const handleKindFilter = (kind: string) => {
    setFilters({ 
      ...filters, 
      kind: (kind && kind !== 'none') ? (kind as 'pm' | 'cm' | 'emergency' | 'project') : undefined, 
      page: 1 
    });
  };

  const handlePriorityFilter = (priority: string) => {
    setFilters({ 
      ...filters, 
      priority: (priority && priority !== 'none') ? (priority as 'low' | 'medium' | 'high' | 'critical') : undefined, 
      page: 1 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg">Loading work orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-red-600">Error loading work orders: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground">Track maintenance and repair tasks</p>
        </div>
        <Button onClick={() => {
          setEditingWorkOrder(undefined);
          setDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Work Order
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by WO number or title..."
                  className="pl-9"
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={filters.status || ''} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.kind || ''} onValueChange={handleKindFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {KIND_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.priority || ''} onValueChange={handlePriorityFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WO #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((wo) => (
                  <TableRow key={wo.id}>
                    <TableCell className="font-medium">{wo.wo_num}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">{wo.title}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {wo.asset?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase">
                        {wo.kind}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={PRIORITY_COLORS[wo.priority]}>
                        {wo.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[wo.status]}>
                        {wo.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {wo.assigned_to_user?.name || 'Unassigned'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {wo.scheduled_for 
                        ? new Date(wo.scheduled_for).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/cmms/work-orders/${wo.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingWorkOrder(wo);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data?.data.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">No work orders found</p>
              <Button onClick={() => {
                setEditingWorkOrder(undefined);
                setDialogOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Work Order
              </Button>
            </div>
          )}

          {data && data.total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {data.from} to {data.to} of {data.total} work orders
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.current_page === 1}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.current_page === data.last_page}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <WorkOrderFormDialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingWorkOrder(undefined);
        }}
        workOrder={editingWorkOrder}
      />
    </div>
  );
}
