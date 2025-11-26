import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Plus, Search, FileText, Calendar, DollarSign, Clock, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-blue-100 text-blue-800',
  evaluation: 'bg-yellow-100 text-yellow-800',
  awarded: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-green-100 text-green-800',
  completed: 'bg-slate-100 text-slate-800',
  cancelled: 'bg-red-100 text-red-800',
};

const METHOD_LABELS: Record<string, string> = {
  open_tender: 'Open Tender',
  restricted_tender: 'Restricted Tender',
  request_for_quotation: 'RFQ',
  direct_procurement: 'Direct Procurement',
  framework_agreement: 'Framework Agreement',
};

export function ProcurementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('tenders');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTender, setNewTender] = useState({
    title: '',
    description: '',
    method: 'open_tender',
    estimated_value: '',
    closing_date: '',
  });

  const { data: procurementData, isLoading } = useQuery({
    queryKey: ['procurement'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any[] }>('/procurement');
      return response.data;
    },
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['procurement-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any }>('/procurement/dashboard');
      return response.data;
    },
  });

  const createTenderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<{ data: any }>('/projects/1/procurement', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Tender created successfully');
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-dashboard'] });
      setIsCreateOpen(false);
      setNewTender({ title: '', description: '', method: 'open_tender', estimated_value: '', closing_date: '' });
    },
    onError: () => toast.error('Failed to create tender'),
  });

  const handleCreateTender = () => {
    createTenderMutation.mutate({
      ...newTender,
      estimated_value: parseFloat(newTender.estimated_value),
    });
  };

  const procurement = procurementData || [];
  const dashboard = dashboardData || { total_tenders: 0, active: 0, awarded_value: 0, pending_evaluation: 0, expiring_contracts: 0 };

  const filteredProcurement = procurement.filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.tender_no.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTenders = procurement.filter((p: any) => ['published', 'evaluation'].includes(p.status));
  const activeContracts = procurement.filter((p: any) => ['awarded', 'in_progress'].includes(p.status));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Procurement & Contracts</h1>
          <p className="text-muted-foreground">Manage tenders, contracts, and supplier relationships</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Tender
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Tender</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tender Title *</label>
                <Input
                  placeholder="e.g., Supply of Pipeline Materials"
                  value={newTender.title}
                  onChange={(e) => setNewTender({ ...newTender, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Brief description of requirements"
                  value={newTender.description}
                  onChange={(e) => setNewTender({ ...newTender, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Procurement Method</label>
                  <Select value={newTender.method} onValueChange={(v) => setNewTender({ ...newTender, method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open_tender">Open Tender</SelectItem>
                      <SelectItem value="restricted_tender">Restricted Tender</SelectItem>
                      <SelectItem value="request_for_quotation">RFQ</SelectItem>
                      <SelectItem value="direct_procurement">Direct Procurement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Estimated Value (KES)</label>
                  <Input
                    type="number"
                    placeholder="5000000"
                    value={newTender.estimated_value}
                    onChange={(e) => setNewTender({ ...newTender, estimated_value: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Closing Date</label>
                <Input
                  type="date"
                  value={newTender.closing_date}
                  onChange={(e) => setNewTender({ ...newTender, closing_date: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleCreateTender}
                disabled={!newTender.title || !newTender.estimated_value || createTenderMutation.isPending}
              >
                {createTenderMutation.isPending ? 'Creating...' : 'Create Tender'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tenders</p>
                <p className="text-2xl font-bold">{dashboard.total_tenders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{dashboard.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Awarded Value</p>
                <p className="text-xl font-bold">{formatCurrency(dashboard.awarded_value)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Evaluation</p>
                <p className="text-2xl font-bold">{dashboard.pending_evaluation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiring Contracts</p>
                <p className="text-2xl font-bold">{dashboard.expiring_contracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tenders">Active Tenders ({activeTenders.length})</TabsTrigger>
          <TabsTrigger value="contracts">Active Contracts ({activeContracts.length})</TabsTrigger>
          <TabsTrigger value="all">All Procurement ({procurement.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tenders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Open Tenders & Under Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              {activeTenders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active tenders</p>
              ) : (
                <div className="space-y-4">
                  {activeTenders.map((tender: any) => (
                    <div key={tender.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-muted-foreground">{tender.tender_no}</span>
                            <Badge className={STATUS_COLORS[tender.status] || 'bg-gray-100'}>{tender.status}</Badge>
                          </div>
                          <h4 className="font-medium mt-1">{tender.title}</h4>
                          <p className="text-sm text-muted-foreground">{tender.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(tender.estimated_value)}</p>
                          <p className="text-sm text-muted-foreground">Est. Value</p>
                        </div>
                      </div>
                      <div className="flex gap-6 mt-3 text-sm text-muted-foreground">
                        <span>Method: {METHOD_LABELS[tender.method] || tender.method}</span>
                        <span>Closing: {tender.closing_date}</span>
                        <span>Published: {tender.publish_date}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" variant="outline">Manage Bids</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract</TableHead>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Performance Bond</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeContracts.map((contract: any) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contract.title}</p>
                          <p className="text-sm text-muted-foreground">{contract.tender_no}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{contract.contractor || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{contract.contract_value ? formatCurrency(contract.contract_value) : '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{contract.contract_start}</p>
                          <p className="text-muted-foreground">to {contract.contract_end}</p>
                        </div>
                      </TableCell>
                      <TableCell>{contract.performance_bond ? formatCurrency(contract.performance_bond) : '-'}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[contract.status] || 'bg-gray-100'}>{contract.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or tender number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="evaluation">Evaluation</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tender No.</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Est. Value</TableHead>
                    <TableHead>Contract Value</TableHead>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcurement.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.tender_no}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">{item.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{METHOD_LABELS[item.method] || item.method}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(item.estimated_value)}</TableCell>
                      <TableCell>{item.contract_value ? formatCurrency(item.contract_value) : '-'}</TableCell>
                      <TableCell>{item.contractor || '-'}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[item.status] || 'bg-gray-100'}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {item.closing_date && <p>Close: {item.closing_date}</p>}
                          {item.award_date && <p className="text-muted-foreground">Award: {item.award_date}</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
