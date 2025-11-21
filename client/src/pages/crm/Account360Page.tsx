import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { crmService, type Complaint, type Note } from '../../services/crm.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { AlertCircle, TrendingUp, TrendingDown, Minus, User, MapPin, CreditCard, Plus, MessageSquare, BarChart3, FileText, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Account360Page() {
  const { accountNo } = useParams<{ accountNo: string }>();
  const queryClient = useQueryClient();
  const [isComplaintDialogOpen, setIsComplaintDialogOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState<Partial<Complaint>>({
    category: 'billing',
    priority: 'medium',
    status: 'open',
  });
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState('');

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['account-overview', accountNo],
    queryFn: () => crmService.getAccountOverview(accountNo!),
    enabled: !!accountNo,
  });

  const { data: billing } = useQuery({
    queryKey: ['account-billing', accountNo],
    queryFn: () => crmService.getBillingHistory(accountNo!, 12),
    enabled: !!accountNo,
  });

  const { data: analytics } = useQuery({
    queryKey: ['account-analytics', accountNo],
    queryFn: () => crmService.getConsumptionAnalytics(accountNo!, 12),
    enabled: !!accountNo,
  });

  const { data: complaintsData } = useQuery({
    queryKey: ['account-complaints', accountNo],
    queryFn: () => crmService.getComplaints({ account_no: accountNo! }),
    enabled: !!accountNo,
  });

  const { data: notesData } = useQuery({
    queryKey: ['account-notes', accountNo],
    queryFn: () => crmService.getNotes({ account_no: accountNo! }),
    enabled: !!accountNo,
  });

  const createComplaintMutation = useMutation({
    mutationFn: (data: Partial<Complaint>) => crmService.createComplaint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-complaints', accountNo] });
      queryClient.invalidateQueries({ queryKey: ['account-overview', accountNo] });
      setIsComplaintDialogOpen(false);
      setNewComplaint({ category: 'billing', priority: 'medium', status: 'open' });
      toast.success('Complaint created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create complaint');
    },
  });

  const updateComplaintMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Complaint> }) =>
      crmService.updateComplaint(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-complaints', accountNo] });
      queryClient.invalidateQueries({ queryKey: ['account-overview', accountNo] });
      toast.success('Complaint updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update complaint');
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (data: Partial<Note>) => crmService.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-notes', accountNo] });
      setIsNoteDialogOpen(false);
      setNoteContent('');
      toast.success('Note created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create note');
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Note> }) =>
      crmService.updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-notes', accountNo] });
      setIsNoteDialogOpen(false);
      setEditingNote(null);
      setNoteContent('');
      toast.success('Note updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update note');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: number) => crmService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-notes', accountNo] });
      toast.success('Note deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete note');
    },
  });

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg">Loading account details...</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-red-600">Account not found</p>
      </div>
    );
  }

  const balance = overview.balance?.balance || 0;
  const trendIcon = analytics?.trend === 'increasing' ? (
    <TrendingUp className="h-4 w-4 text-orange-600" />
  ) : analytics?.trend === 'decreasing' ? (
    <TrendingDown className="h-4 w-4 text-green-600" />
  ) : (
    <Minus className="h-4 w-4 text-gray-600" />
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Account {accountNo}</h1>
          <p className="text-muted-foreground">
            {overview.customer.first_name} {overview.customer.last_name}
          </p>
        </div>
        <Badge variant={overview.connection.status === 'active' ? 'default' : 'destructive'}>
          {overview.connection.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {balance > 0 ? 'Outstanding' : 'Paid up'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Consumption</CardTitle>
            {trendIcon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.average || 0} m³</div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              Trend: {analytics?.trend?.replace('_', ' ') || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.active_cases_count}</div>
            <p className="text-xs text-muted-foreground mt-1">Revenue Assurance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complaints</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.open_complaints_count}</div>
            <p className="text-xs text-muted-foreground mt-1">Open issues</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reads">Meter Reads</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="cases">RA Cases</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Name:</span>
                  <span className="text-sm">
                    {overview.customer.first_name} {overview.customer.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">ID Number:</span>
                  <span className="text-sm">{overview.customer.id_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Phone:</span>
                  <span className="text-sm">{overview.customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{overview.customer.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Type:</span>
                  <Badge variant="outline">{overview.customer.customer_type}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Premise Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Address:</span>
                  <span className="text-sm">{overview.premise.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Category:</span>
                  <Badge variant="outline">{overview.premise.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Connection Date:</span>
                  <span className="text-sm">
                    {new Date(overview.connection.connected_at).toLocaleDateString()}
                  </span>
                </div>
                {overview.latest_meter && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Meter No:</span>
                    <span className="text-sm">{overview.latest_meter.meter_no}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {overview.balance && overview.balance.balance > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Balance Aging</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Current</p>
                    <p className="text-lg font-bold">KES {overview.balance.current.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">1-30 Days</p>
                    <p className="text-lg font-bold">KES {overview.balance.days_30.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">31-60 Days</p>
                    <p className="text-lg font-bold">KES {overview.balance.days_60.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">61-90 Days</p>
                    <p className="text-lg font-bold">KES {overview.balance.days_90.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Over 90 Days</p>
                    <p className="text-lg font-bold text-red-600">
                      KES {overview.balance.over_90.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {analytics && analytics.consumption.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Consumption Trends (Last 12 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analytics.consumption.map((item) => ({
                        month: new Date(item.period_start).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                        consumption: item.consumption,
                      }))}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="month" 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        label={{ value: 'm³', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="consumption" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Average:</span>
                    <span className="font-semibold">{analytics.average} m³/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Trend:</span>
                    <Badge variant={
                      analytics.trend === 'increasing' ? 'destructive' : 
                      analytics.trend === 'decreasing' ? 'default' : 
                      'secondary'
                    }>
                      {analytics.trend === 'increasing' && <TrendingUp className="h-3 w-3 mr-1" />}
                      {analytics.trend === 'decreasing' && <TrendingDown className="h-3 w-3 mr-1" />}
                      {analytics.trend === 'stable' && <Minus className="h-3 w-3 mr-1" />}
                      {analytics.trend.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billing?.invoices.map((invoice: any) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        {new Date(invoice.period_start).toLocaleDateString()} -{' '}
                        {new Date(invoice.period_end).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>KES {invoice.total_amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(invoice.due_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billing?.payments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.paid_at).toLocaleDateString()}</TableCell>
                      <TableCell>KES {payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.channel}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reads">
          <Card>
            <CardHeader>
              <CardTitle>Recent Meter Reads</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reading</TableHead>
                    <TableHead>Consumption</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.recent_reads.map((read: any, idx: number) => {
                    const prevRead = idx > 0 ? overview.recent_reads[idx - 1] : null;
                    const consumption = prevRead ? read.value - prevRead.value : null;
                    
                    return (
                      <TableRow key={read.id}>
                        <TableCell>{new Date(read.read_at).toLocaleDateString()}</TableCell>
                        <TableCell>{read.value} m³</TableCell>
                        <TableCell>
                          {consumption !== null ? `${consumption} m³` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={read.quality === 'good' ? 'default' : 'secondary'}>
                            {read.quality}
                          </Badge>
                        </TableCell>
                        <TableCell>{read.source}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Customer Complaints
              </CardTitle>
              <Dialog open={isComplaintDialogOpen} onOpenChange={setIsComplaintDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Complaint
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log New Complaint</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={newComplaint.category}
                        onValueChange={(value) => setNewComplaint({ ...newComplaint, category: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="water_quality">Water Quality</SelectItem>
                          <SelectItem value="supply">Supply Issue</SelectItem>
                          <SelectItem value="meter">Meter Problem</SelectItem>
                          <SelectItem value="leak">Leak Report</SelectItem>
                          <SelectItem value="customer_service">Customer Service</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={newComplaint.priority}
                        onValueChange={(value) => setNewComplaint({ ...newComplaint, priority: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe the issue..."
                        value={newComplaint.description || ''}
                        onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsComplaintDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        createComplaintMutation.mutate({
                          ...newComplaint,
                          account_no: accountNo,
                          customer_id: overview?.customer.id,
                        });
                      }}
                      disabled={!newComplaint.description || createComplaintMutation.isPending}
                    >
                      {createComplaintMutation.isPending ? 'Creating...' : 'Create Complaint'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaintsData?.data && complaintsData.data.length > 0 ? (
                    complaintsData.data.map((complaint: Complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell className="font-mono text-sm">#{complaint.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{complaint.category.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              complaint.priority === 'critical'
                                ? 'destructive'
                                : complaint.priority === 'high'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {complaint.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              complaint.status === 'resolved' || complaint.status === 'closed'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {complaint.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(complaint.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {complaint.status === 'open' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateComplaintMutation.mutate({
                                  id: complaint.id,
                                  data: { status: 'triage' },
                                })
                              }
                            >
                              Triage
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No complaints found for this account
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Account Notes
              </CardTitle>
              <Dialog open={isNoteDialogOpen} onOpenChange={(open) => {
                setIsNoteDialogOpen(open);
                if (!open) {
                  setEditingNote(null);
                  setNoteContent('');
                }
              }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Note Content</Label>
                      <Textarea
                        placeholder="Enter your note here..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        rows={6}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsNoteDialogOpen(false);
                      setEditingNote(null);
                      setNoteContent('');
                    }}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (editingNote) {
                          updateNoteMutation.mutate({
                            id: editingNote.id,
                            data: { content: noteContent },
                          });
                        } else {
                          createNoteMutation.mutate({
                            account_no: accountNo,
                            customer_id: overview?.customer.id,
                            content: noteContent,
                          });
                        }
                      }}
                      disabled={!noteContent.trim() || createNoteMutation.isPending || updateNoteMutation.isPending}
                    >
                      {(createNoteMutation.isPending || updateNoteMutation.isPending) 
                        ? 'Saving...' 
                        : editingNote ? 'Update Note' : 'Add Note'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notesData?.data && notesData.data.length > 0 ? (
                  notesData.data.map((note: Note) => (
                    <div
                      key={note.id}
                      className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{note.createdBy?.name || 'Unknown'}</span>
                            <span>•</span>
                            <span>{new Date(note.created_at).toLocaleString()}</span>
                            {note.updated_at !== note.created_at && (
                              <>
                                <span>•</span>
                                <span className="italic">edited</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingNote(note);
                              setNoteContent(note.content);
                              setIsNoteDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this note?')) {
                                deleteNoteMutation.mutate(note.id);
                              }
                            }}
                            disabled={deleteNoteMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No notes found for this account</p>
                    <p className="text-sm">Add a note to keep track of important information</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Assurance Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {overview.active_cases_count} active case(s) for this account
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
