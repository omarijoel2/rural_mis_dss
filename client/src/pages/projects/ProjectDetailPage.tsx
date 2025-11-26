import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  FileText, 
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Target,
  TrendingUp,
  Users,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client';

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-gray-100 text-gray-800',
  tendering: 'bg-blue-100 text-blue-800',
  execution: 'bg-green-100 text-green-800',
  suspended: 'bg-orange-100 text-orange-800',
  completed: 'bg-purple-100 text-purple-800',
  closed: 'bg-slate-100 text-slate-800',
};

const MILESTONE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  delayed: 'bg-red-100 text-red-800',
};

const RISK_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-800',
  monitoring: 'bg-yellow-100 text-yellow-800',
  mitigated: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [isAddRiskOpen, setIsAddRiskOpen] = useState(false);
  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ name: '', description: '', planned_date: '', weight: '' });
  const [newRisk, setNewRisk] = useState({ title: '', description: '', category: 'technical', probability: 'medium', impact: 'medium', mitigation: '', owner: '' });
  const [newIssue, setNewIssue] = useState({ title: '', description: '', category: 'technical', priority: 'medium', assigned_to: '' });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any }>(`/projects/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: milestones } = useQuery({
    queryKey: ['project-milestones', id],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any[] }>(`/projects/${id}/milestones`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: procurement } = useQuery({
    queryKey: ['project-procurement', id],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any[] }>(`/projects/${id}/procurement`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: risks } = useQuery({
    queryKey: ['project-risks', id],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any[] }>(`/projects/${id}/risks`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: issues } = useQuery({
    queryKey: ['project-issues', id],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any[] }>(`/projects/${id}/issues`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: documents } = useQuery({
    queryKey: ['project-documents', id],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any[] }>(`/projects/${id}/documents`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: communications } = useQuery({
    queryKey: ['project-communications', id],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any[] }>(`/projects/${id}/communications`);
      return response.data;
    },
    enabled: !!id,
  });

  const addMilestoneMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<{ data: any }>(`/projects/${id}/milestones`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Milestone added successfully');
      queryClient.invalidateQueries({ queryKey: ['project-milestones', id] });
      setIsAddMilestoneOpen(false);
      setNewMilestone({ name: '', description: '', planned_date: '', weight: '' });
    },
    onError: () => toast.error('Failed to add milestone'),
  });

  const addRiskMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<{ data: any }>(`/projects/${id}/risks`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Risk registered successfully');
      queryClient.invalidateQueries({ queryKey: ['project-risks', id] });
      setIsAddRiskOpen(false);
      setNewRisk({ title: '', description: '', category: 'technical', probability: 'medium', impact: 'medium', mitigation: '', owner: '' });
    },
    onError: () => toast.error('Failed to register risk'),
  });

  const addIssueMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<{ data: any }>(`/projects/${id}/issues`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Issue logged successfully');
      queryClient.invalidateQueries({ queryKey: ['project-issues', id] });
      setIsAddIssueOpen(false);
      setNewIssue({ title: '', description: '', category: 'technical', priority: 'medium', assigned_to: '' });
    },
    onError: () => toast.error('Failed to log issue'),
  });

  if (projectLoading) {
    return <div className="flex items-center justify-center h-64">Loading project details...</div>;
  }

  if (!project) {
    return <div className="text-center py-10">Project not found</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
  };

  const completedMilestones = (milestones || []).filter((m: any) => m.status === 'completed').length;
  const totalMilestones = (milestones || []).length;
  const milestoneProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const openRisks = (risks || []).filter((r: any) => r.status === 'open' || r.status === 'monitoring').length;
  const openIssues = (issues || []).filter((i: any) => i.status !== 'resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Badge className={STATUS_COLORS[project.status] || 'bg-gray-100'}>{project.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">{project.code} | {project.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Project</Button>
          <Button>Generate Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-xl font-bold">{formatCurrency(project.baseline_budget)}</p>
                {project.revised_budget && (
                  <p className="text-xs text-orange-600">Revised: {formatCurrency(project.revised_budget)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Physical Progress</p>
                <p className="text-xl font-bold">{project.physical_progress}%</p>
                <Progress value={project.physical_progress} className="h-1 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Milestones</p>
                <p className="text-xl font-bold">{completedMilestones}/{totalMilestones}</p>
                <Progress value={milestoneProgress} className="h-1 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Risks/Issues</p>
                <p className="text-xl font-bold">{openRisks} / {openIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          <TabsTrigger value="risks">Risks & Issues</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Baseline Start</span>
                  <span className="font-medium">{project.baseline_start_date || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Baseline End</span>
                  <span className="font-medium">{project.baseline_end_date || 'Not set'}</span>
                </div>
                {project.actual_start_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Actual Start</span>
                    <span className="font-medium">{project.actual_start_date}</span>
                  </div>
                )}
                {project.revised_end_date && (
                  <div className="flex justify-between text-orange-600">
                    <span>Revised End</span>
                    <span className="font-medium">{project.revised_end_date}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Baseline Budget</span>
                  <span className="font-medium">{formatCurrency(project.baseline_budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Financial Progress</span>
                  <span className="font-medium">{project.financial_progress}%</span>
                </div>
                <Progress value={project.financial_progress} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span>{formatCurrency(project.baseline_budget * project.financial_progress / 100)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(milestones || []).slice(0, 5).map((milestone: any) => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {milestone.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : milestone.status === 'in_progress' ? (
                        <Clock className="h-5 w-5 text-blue-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium">{milestone.name}</p>
                        <p className="text-sm text-muted-foreground">{milestone.planned_date}</p>
                      </div>
                    </div>
                    <Badge className={MILESTONE_STATUS_COLORS[milestone.status] || 'bg-gray-100'}>{milestone.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Project Milestones</h3>
            <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Milestone</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Milestone</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Milestone Name *</label>
                    <Input value={newMilestone.name} onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input value={newMilestone.description} onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Planned Date *</label>
                      <Input type="date" value={newMilestone.planned_date} onChange={(e) => setNewMilestone({ ...newMilestone, planned_date: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Weight (%)</label>
                      <Input type="number" value={newMilestone.weight} onChange={(e) => setNewMilestone({ ...newMilestone, weight: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={() => addMilestoneMutation.mutate(newMilestone)} disabled={!newMilestone.name || !newMilestone.planned_date}>
                    Add Milestone
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Planned Date</TableHead>
                    <TableHead>Actual Date</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deliverables</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(milestones || []).map((milestone: any) => (
                    <TableRow key={milestone.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{milestone.name}</p>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{milestone.planned_date}</TableCell>
                      <TableCell>{milestone.actual_date || '-'}</TableCell>
                      <TableCell>{milestone.weight}%</TableCell>
                      <TableCell><Badge className={MILESTONE_STATUS_COLORS[milestone.status] || 'bg-gray-100'}>{milestone.status}</Badge></TableCell>
                      <TableCell className="max-w-[200px] truncate">{milestone.deliverables || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procurement" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Procurement & Contracts</h3>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" />New Tender</Button>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(procurement || []).map((tender: any) => (
                    <TableRow key={tender.id}>
                      <TableCell className="font-medium">{tender.tender_no}</TableCell>
                      <TableCell>{tender.title}</TableCell>
                      <TableCell><Badge variant="outline">{tender.method?.replace('_', ' ')}</Badge></TableCell>
                      <TableCell>{formatCurrency(tender.estimated_value)}</TableCell>
                      <TableCell>{tender.contract_value ? formatCurrency(tender.contract_value) : '-'}</TableCell>
                      <TableCell>{tender.contractor || '-'}</TableCell>
                      <TableCell>
                        <Badge className={tender.status === 'completed' ? 'bg-green-100 text-green-800' : tender.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                          {tender.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Risk Register</h3>
                <Dialog open={isAddRiskOpen} onOpenChange={setIsAddRiskOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Risk</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register New Risk</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Risk Title *</label>
                        <Input value={newRisk.title} onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Input value={newRisk.description} onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-sm font-medium">Category</label>
                          <Select value={newRisk.category} onValueChange={(v) => setNewRisk({ ...newRisk, category: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="cost">Cost</SelectItem>
                              <SelectItem value="schedule">Schedule</SelectItem>
                              <SelectItem value="regulatory">Regulatory</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Probability</label>
                          <Select value={newRisk.probability} onValueChange={(v) => setNewRisk({ ...newRisk, probability: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Impact</label>
                          <Select value={newRisk.impact} onValueChange={(v) => setNewRisk({ ...newRisk, impact: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Mitigation Strategy</label>
                        <Input value={newRisk.mitigation} onChange={(e) => setNewRisk({ ...newRisk, mitigation: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Risk Owner</label>
                        <Input value={newRisk.owner} onChange={(e) => setNewRisk({ ...newRisk, owner: e.target.value })} />
                      </div>
                      <Button onClick={() => addRiskMutation.mutate(newRisk)} disabled={!newRisk.title}>
                        Register Risk
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {(risks || []).map((risk: any) => (
                    <div key={risk.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{risk.risk_no}: {risk.title}</p>
                          <p className="text-sm text-muted-foreground">{risk.description}</p>
                        </div>
                        <Badge className={RISK_COLORS[risk.status] || 'bg-gray-100'}>{risk.status}</Badge>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>Score: <strong>{risk.risk_score}</strong></span>
                        <span>Owner: {risk.owner}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Issue Tracker</h3>
                <Dialog open={isAddIssueOpen} onOpenChange={setIsAddIssueOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-2" />Log Issue</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log New Issue</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Issue Title *</label>
                        <Input value={newIssue.title} onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Input value={newIssue.description} onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Category</label>
                          <Select value={newIssue.category} onValueChange={(v) => setNewIssue({ ...newIssue, category: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="procurement">Procurement</SelectItem>
                              <SelectItem value="quality">Quality</SelectItem>
                              <SelectItem value="safety">Safety</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Priority</label>
                          <Select value={newIssue.priority} onValueChange={(v) => setNewIssue({ ...newIssue, priority: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Assigned To</label>
                        <Input value={newIssue.assigned_to} onChange={(e) => setNewIssue({ ...newIssue, assigned_to: e.target.value })} />
                      </div>
                      <Button onClick={() => addIssueMutation.mutate(newIssue)} disabled={!newIssue.title}>
                        Log Issue
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {(issues || []).map((issue: any) => (
                    <div key={issue.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{issue.issue_no}: {issue.title}</p>
                          <p className="text-sm text-muted-foreground">{issue.description}</p>
                        </div>
                        <Badge className={PRIORITY_COLORS[issue.priority] || 'bg-gray-100'}>{issue.priority}</Badge>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>Status: <strong>{issue.status}</strong></span>
                        <span>Assigned: {issue.assigned_to}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Document Repository</h3>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" />Upload Document</Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(documents || []).map((doc: any) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-sm text-muted-foreground">{doc.doc_no}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{doc.category}</Badge></TableCell>
                      <TableCell>{doc.file_type?.toUpperCase()}</TableCell>
                      <TableCell>v{doc.version}</TableCell>
                      <TableCell>{doc.uploaded_by}</TableCell>
                      <TableCell>
                        <Badge className={doc.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.created_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Stakeholder Communications</h3>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" />New Communication</Button>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              {(communications || []).map((comm: any) => (
                <div key={comm.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-medium">{comm.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1">{comm.message}</p>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>From: {comm.sender}</span>
                          <span>To: {comm.recipients?.join(', ')}</span>
                          <span>{comm.sent_date}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{comm.comm_type?.replace('_', ' ')}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
