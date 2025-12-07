import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Ticket,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  MessageSquare,
  Phone,
  Mail,
  Smartphone,
  Loader2,
} from 'lucide-react';
import { crmService, CrmTicket, TicketCategory } from '@/services/crm.service';
import { toast } from 'sonner';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';

const CHANNELS = [
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: Smartphone },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { value: 'walk_in', label: 'Walk-in', icon: User },
  { value: 'app', label: 'App', icon: Smartphone },
  { value: 'ussd', label: 'USSD', icon: Phone },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-slate-500' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

const STATUSES = [
  { value: 'new', label: 'New', color: 'bg-purple-500' },
  { value: 'assigned', label: 'Assigned', color: 'bg-blue-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-500' },
  { value: 'closed', label: 'Closed', color: 'bg-slate-500' },
];

function getSlaStatus(ticket: CrmTicket): { status: 'ok' | 'warning' | 'breached'; label: string } {
  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    return { status: 'ok', label: 'Completed' };
  }
  
  const resolutionDue = ticket.sla_resolution_due ? parseISO(ticket.sla_resolution_due) : null;
  
  if (!resolutionDue) {
    return { status: 'ok', label: 'No SLA' };
  }
  
  if (isPast(resolutionDue)) {
    return { status: 'breached', label: 'SLA Breached' };
  }
  
  const hoursRemaining = (resolutionDue.getTime() - new Date().getTime()) / (1000 * 60 * 60);
  if (hoursRemaining < 4) {
    return { status: 'warning', label: `${Math.round(hoursRemaining)}h remaining` };
  }
  
  return { status: 'ok', label: formatDistanceToNow(resolutionDue, { addSuffix: true }) };
}

export function Tickets() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  const [formCategoryId, setFormCategoryId] = useState<string>('');
  const [formChannel, setFormChannel] = useState<string>('phone');
  const [formPriority, setFormPriority] = useState<string>('normal');

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['tickets', statusFilter, priorityFilter],
    queryFn: () => crmService.getTickets({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      per_page: 50,
    }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['ticket-categories'],
    queryFn: () => crmService.getTicketCategories(),
  });

  const createMutation = useMutation({
    mutationFn: crmService.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket created successfully');
      setDialogOpen(false);
      setFormCategoryId('');
      setFormChannel('phone');
      setFormPriority('normal');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; priority?: string; assigned_to?: string } }) =>
      crmService.updateTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update ticket');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!formCategoryId) {
      toast.error('Please select a category');
      return;
    }
    
    createMutation.mutate({
      category_id: formCategoryId,
      channel: formChannel,
      subject: formData.get('subject') as string,
      description: formData.get('description') as string || undefined,
      priority: formPriority,
    });
  };
  
  const resetForm = () => {
    setFormCategoryId('');
    setFormChannel('phone');
    setFormPriority('normal');
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    updateMutation.mutate({ id: ticketId, data: { status: newStatus } });
  };

  const handlePriorityChange = (ticketId: string, newPriority: string) => {
    updateMutation.mutate({ id: ticketId, data: { priority: newPriority } });
  };

  const tickets = ticketsData?.data || [];
  const categories = categoriesData?.data || [];

  const stats = {
    total: tickets.length,
    new: tickets.filter(t => t.status === 'new').length,
    inProgress: tickets.filter(t => t.status === 'in_progress' || t.status === 'assigned').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    breached: tickets.filter(t => getSlaStatus(t).status === 'breached').length,
  };

  const getPriorityBadge = (priority: string) => {
    const config = PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config = STATUSES.find(s => s.value === status) || STATUSES[0];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getChannelIcon = (channel: string) => {
    const config = CHANNELS.find(c => c.value === channel);
    const Icon = config?.icon || MessageSquare;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">CRM Tickets</h1>
          <p className="text-muted-foreground mt-1">Customer support ticket management and SLA tracking</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category *</Label>
                  <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: TicketCategory) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel">Channel *</Label>
                  <Select value={formChannel} onValueChange={setFormChannel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNELS.map((ch) => (
                        <SelectItem key={ch.value} value={ch.value}>
                          {ch.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formPriority} onValueChange={setFormPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input name="subject" placeholder="Brief description of the issue" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  name="description" 
                  placeholder="Detailed description of the customer's issue..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Ticket
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Ticket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.new}</div>
                <p className="text-xs text-muted-foreground">New</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.resolved}</div>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.breached}</div>
                <p className="text-xs text-muted-foreground">SLA Breached</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Ticket Queue
            </CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tickets found. Create your first ticket to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket: CrmTicket) => {
                  const slaStatus = getSlaStatus(ticket);
                  return (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono font-medium">{ticket.ticket_no}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(ticket.channel)}
                          <span className="capitalize">{ticket.channel.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                      <TableCell>{ticket.category?.name || '-'}</TableCell>
                      <TableCell>
                        <Select
                          value={ticket.priority}
                          onValueChange={(value) => handlePriorityChange(ticket.id, value)}
                        >
                          <SelectTrigger className="h-7 w-24 border-0 p-0">
                            {getPriorityBadge(ticket.priority)}
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITIES.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ticket.status}
                          onValueChange={(value) => handleStatusChange(ticket.id, value)}
                        >
                          <SelectTrigger className="h-7 w-28 border-0 p-0">
                            {getStatusBadge(ticket.status)}
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            slaStatus.status === 'breached'
                              ? 'border-red-500 text-red-500'
                              : slaStatus.status === 'warning'
                              ? 'border-yellow-500 text-yellow-500'
                              : 'border-green-500 text-green-500'
                          }
                        >
                          {slaStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(parseISO(ticket.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
