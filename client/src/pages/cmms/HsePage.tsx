import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hseService } from '../../services/cmms.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
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
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Shield, AlertTriangle, FileCheck, ClipboardCheck, Plus } from 'lucide-react';
import { toast } from 'sonner';

const PERMIT_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-800',
};

const INCIDENT_SEVERITY_COLORS = {
  minor: 'bg-blue-100 text-blue-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  serious: 'bg-orange-100 text-orange-800',
  fatal: 'bg-red-100 text-red-800',
};

export function HsePage() {
  const [permitFilters, setPermitFilters] = useState({ page: 1, per_page: 15, status: '' });
  const [incidentFilters, setIncidentFilters] = useState({ page: 1, per_page: 15, status: 'open' });
  const [capaFilters, setCapaFilters] = useState({ page: 1, per_page: 15, status: 'open' });
  const [permitDialogOpen, setPermitDialogOpen] = useState(false);
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [capaDialogOpen, setCapaDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: permits, isLoading: permitsLoading, error: permitsError } = useQuery({
    queryKey: ['hse-permits', permitFilters],
    queryFn: () => hseService.getPermits(permitFilters),
  });

  const { data: incidents, isLoading: incidentsLoading, error: incidentsError } = useQuery({
    queryKey: ['hse-incidents', incidentFilters],
    queryFn: () => hseService.getIncidents(incidentFilters),
  });

  const { data: capas, isLoading: capasLoading, error: capasError } = useQuery({
    queryKey: ['hse-capas', capaFilters],
    queryFn: () => hseService.getCapas(capaFilters),
  });

  const { data: incidentStats } = useQuery({
    queryKey: ['incident-stats'],
    queryFn: () => hseService.getIncidentStats({}),
  });

  const createPermitMutation = useMutation({
    mutationFn: hseService.createPermit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hse-permits'] });
      setPermitDialogOpen(false);
      toast.success('Permit request created successfully');
    },
    onError: () => toast.error('Failed to create permit'),
  });

  const createIncidentMutation = useMutation({
    mutationFn: hseService.createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hse-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incident-stats'] });
      setIncidentDialogOpen(false);
      toast.success('Incident reported successfully');
    },
    onError: () => toast.error('Failed to report incident'),
  });

  const createCapaMutation = useMutation({
    mutationFn: hseService.createCapa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hse-capas'] });
      setCapaDialogOpen(false);
      toast.success('CAPA created successfully');
    },
    onError: () => toast.error('Failed to create CAPA'),
  });

  const handleCreatePermit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      permit_type: formData.get('permit_type') as 'hot_work' | 'confined_space' | 'height_work' | 'excavation' | 'other',
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      valid_from: formData.get('valid_from') as string,
      valid_until: formData.get('valid_until') as string,
      status: 'pending' as const,
    };
    createPermitMutation.mutate(data);
  };

  const handleCreateIncident = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      category: formData.get('category') as 'injury' | 'spill' | 'damage' | 'near_miss' | 'other',
      severity: formData.get('severity') as 'minor' | 'moderate' | 'serious' | 'fatal',
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      occurred_at: formData.get('occurred_at') as string,
      status: 'open' as const,
    };
    createIncidentMutation.mutate(data);
  };

  const handleCreateCapa = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const assignedTo = parseInt(formData.get('assigned_to') as string);
    
    if (isNaN(assignedTo)) {
      toast.error('Please enter a valid user ID');
      e.currentTarget.reset();
      return;
    }
    
    const data = {
      type: formData.get('type') as 'corrective' | 'preventive',
      description: formData.get('description') as string,
      due_date: formData.get('due_date') as string,
      assigned_to: assignedTo,
      status: 'open' as const,
    };
    createCapaMutation.mutate(data);
  };

  const pendingPermits = permits?.data?.filter(p => p.status === 'pending').length || 0;
  const openIncidents = incidents?.data?.filter(i => i.status === 'open').length || 0;
  const openCapas = capas?.data?.filter(c => c.status === 'open').length || 0;

  if (permitsError || incidentsError || capasError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Failed to load HSE data</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">HSE Safety Management</h1>
        <p className="text-muted-foreground">Health, Safety, and Environment compliance</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-yellow-600" />
              Pending Permits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingPermits}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Open Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{openIncidents}</div>
            <p className="text-xs text-muted-foreground">Under investigation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Open CAPAs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openCapas}</div>
            <p className="text-xs text-muted-foreground">Actions pending</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Days Since LTI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {incidentStats?.days_since_lti || 0}
            </div>
            <p className="text-xs text-muted-foreground">Lost-time injury free</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="permits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="permits">Work Permits</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="capas">CAPAs</TabsTrigger>
        </TabsList>

        <TabsContent value="permits">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Work Permits</CardTitle>
                <div className="flex gap-2">
                  <Select
                    value={permitFilters.status}
                    onValueChange={(value) =>
                      setPermitFilters({ ...permitFilters, status: value, page: 1 })
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={permitDialogOpen} onOpenChange={setPermitDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Request Permit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Work Permit</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreatePermit} className="space-y-4">
                        <div>
                          <Label htmlFor="permit_type">Permit Type</Label>
                          <Select name="permit_type" required>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hot_work">Hot Work</SelectItem>
                              <SelectItem value="confined_space">Confined Space</SelectItem>
                              <SelectItem value="height_work">Height Work</SelectItem>
                              <SelectItem value="excavation">Excavation</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input id="location" name="location" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="valid_from">Valid From</Label>
                            <Input id="valid_from" name="valid_from" type="datetime-local" required />
                          </div>
                          <div>
                            <Label htmlFor="valid_until">Valid Until</Label>
                            <Input id="valid_until" name="valid_until" type="datetime-local" required />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" rows={3} required />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPermitDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createPermitMutation.isPending}>
                            Submit Request
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {permitsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : !permits?.data || permits.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No work permits
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permit Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Valid Period</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permits.data.map((permit) => (
                      <TableRow key={permit.id}>
                        <TableCell>
                          <Badge variant="outline">{permit.permit_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {permit.description}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(permit.valid_from).toLocaleDateString()} -<br />
                          {new Date(permit.valid_until).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{permit.requested_by_user?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge className={PERMIT_STATUS_COLORS[permit.status]}>
                            {permit.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Safety Incidents</CardTitle>
                <div className="flex gap-2">
                  <Select
                    value={incidentFilters.status}
                    onValueChange={(value) =>
                      setIncidentFilters({ ...incidentFilters, status: value, page: 1 })
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigated">Investigated</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={incidentDialogOpen} onOpenChange={setIncidentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Report Incident
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Report Safety Incident</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateIncident} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" required>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="injury">Injury</SelectItem>
                                <SelectItem value="spill">Spill</SelectItem>
                                <SelectItem value="damage">Damage</SelectItem>
                                <SelectItem value="near_miss">Near Miss</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="severity">Severity</Label>
                            <Select name="severity" required>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minor">Minor</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="serious">Serious</SelectItem>
                                <SelectItem value="fatal">Fatal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input id="location" name="location" required />
                        </div>
                        <div>
                          <Label htmlFor="occurred_at">Occurred At</Label>
                          <Input id="occurred_at" name="occurred_at" type="datetime-local" required />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" rows={4} required />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIncidentDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createIncidentMutation.isPending}>
                            Report Incident
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {incidentsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : !incidents?.data || incidents.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No incidents reported
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Occurred At</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.data.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          {new Date(incident.occurred_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{incident.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={INCIDENT_SEVERITY_COLORS[incident.severity]}>
                            {incident.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{incident.location}</TableCell>
                        <TableCell>{incident.reported_by_user?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={incident.status === 'closed' ? 'default' : 'secondary'}
                          >
                            {incident.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capas">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Corrective & Preventive Actions</CardTitle>
                <div className="flex gap-2">
                  <Select
                    value={capaFilters.status}
                    onValueChange={(value) =>
                      setCapaFilters({ ...capaFilters, status: value, page: 1 })
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={capaDialogOpen} onOpenChange={setCapaDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create CAPA
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create CAPA</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateCapa} className="space-y-4">
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Select name="type" required>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="corrective">Corrective Action</SelectItem>
                              <SelectItem value="preventive">Preventive Action</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" rows={4} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="assigned_to">Assign To (User ID)</Label>
                            <Input id="assigned_to" name="assigned_to" type="number" required />
                          </div>
                          <div>
                            <Label htmlFor="due_date">Due Date</Label>
                            <Input id="due_date" name="due_date" type="date" required />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCapaDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createCapaMutation.isPending}>
                            Create CAPA
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {capasLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : !capas?.data || capas.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No CAPAs created
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {capas.data.map((capa) => {
                      const isOverdue =
                        capa.status === 'open' && new Date(capa.due_date) < new Date();
                      return (
                        <TableRow key={capa.id}>
                          <TableCell>
                            <Badge variant="outline">{capa.type}</Badge>
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {capa.description}
                          </TableCell>
                          <TableCell>
                            {capa.assigned_to_user?.name || 'Unassigned'}
                          </TableCell>
                          <TableCell>
                            <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                              {new Date(capa.due_date).toLocaleDateString()}
                              {isOverdue && ' (Overdue)'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={capa.status === 'completed' ? 'default' : 'secondary'}
                            >
                              {capa.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
