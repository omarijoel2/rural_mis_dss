import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { crmService, type Complaint } from '../../services/crm.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Search, Filter, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'list' | 'kanban';

const statusOptions = ['all', 'open', 'triage', 'field', 'resolved', 'closed'] as const;
const priorityOptions = ['all', 'low', 'medium', 'high', 'critical'] as const;
const categoryOptions = [
  'all',
  'billing',
  'water_quality',
  'supply',
  'meter',
  'leak',
  'customer_service',
  'other',
] as const;

export function ComplaintsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<typeof statusOptions[number]>('all');
  const [priorityFilter, setPriorityFilter] = useState<typeof priorityOptions[number]>('all');
  const [categoryFilter, setCategoryFilter] = useState<typeof categoryOptions[number]>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const { data: complaintsData, isLoading, isError, error } = useQuery({
    queryKey: ['complaints', search, statusFilter, priorityFilter, categoryFilter],
    queryFn: () => {
      const filters: any = {};
      if (search) filters.search = search;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      if (categoryFilter !== 'all') filters.category = categoryFilter;
      return crmService.getComplaints(filters);
    },
  });

  const updateComplaintMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Complaint> }) =>
      crmService.updateComplaint(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update complaint');
    },
  });

  const complaints = complaintsData?.data || [];

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'resolved' || status === 'closed') return 'default';
    if (status === 'field') return 'secondary';
    return 'outline';
  };

  const getPriorityBadgeVariant = (priority: string) => {
    if (priority === 'critical') return 'destructive';
    if (priority === 'high') return 'default';
    return 'secondary';
  };

  const groupedByStatus = complaints.reduce((acc, complaint) => {
    if (!acc[complaint.status]) acc[complaint.status] = [];
    acc[complaint.status].push(complaint);
    return acc;
  }, {} as Record<string, Complaint[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Complaints</h1>
          <p className="text-muted-foreground">Manage and track customer service complaints</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            size="sm"
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            onClick={() => setViewMode('kanban')}
            size="sm"
          >
            Kanban Board
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints by account, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'All Status' : status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(val: any) => setPriorityFilter(val)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority === 'all' ? 'All Priority' : priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={(val: any) => setCategoryFilter(val)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading complaints...</div>
          ) : isError ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 text-destructive opacity-50" />
              <p className="text-destructive font-semibold">Failed to load complaints</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(error as any)?.message || 'An error occurred while fetching complaints'}
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.length > 0 ? (
                  complaints.map((complaint: Complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-mono text-sm">#{complaint.id}</TableCell>
                      <TableCell>
                        <Link
                          to={`/crm/accounts/${complaint.account_no}`}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {complaint.account_no}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{complaint.category.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeVariant(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {complaint.description}
                      </TableCell>
                      <TableCell>
                        {complaint.status === 'open' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateComplaintMutation.isPending}
                            onClick={() =>
                              updateComplaintMutation.mutate({
                                id: complaint.id,
                                data: { status: 'triage' },
                              })
                            }
                          >
                            {updateComplaintMutation.isPending ? 'Updating...' : 'Triage'}
                          </Button>
                        )}
                        {complaint.status === 'triage' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateComplaintMutation.isPending}
                            onClick={() =>
                              updateComplaintMutation.mutate({
                                id: complaint.id,
                                data: { status: 'field' },
                              })
                            }
                          >
                            {updateComplaintMutation.isPending ? 'Updating...' : 'Send to Field'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No complaints found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {['open', 'triage', 'field', 'resolved', 'closed'].map((status) => (
                <div key={status} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold capitalize">{status.replace('_', ' ')}</h3>
                    <Badge variant="secondary">{groupedByStatus[status]?.length || 0}</Badge>
                  </div>
                  <div className="space-y-2">
                    {groupedByStatus[status]?.map((complaint: Complaint) => (
                      <Card key={complaint.id} className="p-3 hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-mono text-muted-foreground">
                              #{complaint.id}
                            </span>
                            <Badge
                              variant={getPriorityBadgeVariant(complaint.priority)}
                              className="text-xs"
                            >
                              {complaint.priority}
                            </Badge>
                          </div>
                          <Link
                            to={`/crm/accounts/${complaint.account_no}`}
                            className="text-sm font-medium hover:underline block"
                          >
                            {complaint.account_no}
                          </Link>
                          <Badge variant="outline" className="text-xs">
                            {complaint.category.replace('_', ' ')}
                          </Badge>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {complaint.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </Card>
                    )) || (
                      <div className="text-center text-sm text-muted-foreground py-4">
                        No complaints
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Complaints</p>
              <p className="text-2xl font-bold">{complaints.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-2xl font-bold text-yellow-600">
                {complaints.filter((c: Complaint) => c.status === 'open').length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {complaints.filter((c: Complaint) => ['triage', 'field'].includes(c.status)).length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {complaints.filter((c: Complaint) => ['resolved', 'closed'].includes(c.status)).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
