import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hseService } from '../../services/cmms.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Shield, AlertTriangle, FileCheck, ClipboardCheck } from 'lucide-react';

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

  const { data: permits, isLoading: permitsLoading } = useQuery({
    queryKey: ['hse-permits', permitFilters],
    queryFn: () => hseService.getPermits(permitFilters),
  });

  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ['hse-incidents', incidentFilters],
    queryFn: () => hseService.getIncidents(incidentFilters),
  });

  const { data: capas, isLoading: capasLoading } = useQuery({
    queryKey: ['hse-capas', capaFilters],
    queryFn: () => hseService.getCapas(capaFilters),
  });

  const { data: incidentStats } = useQuery({
    queryKey: ['incident-stats'],
    queryFn: () => hseService.getIncidentStats({}),
  });

  const pendingPermits = permits?.data?.filter(p => p.status === 'pending').length || 0;
  const openIncidents = incidents?.data?.filter(i => i.status === 'open').length || 0;
  const openCapas = capas?.data?.filter(c => c.status === 'open').length || 0;

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
              </div>
            </CardHeader>
            <CardContent>
              {permitsLoading ? (
                <div className="text-center py-8">Loading...</div>
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
                    {permits?.data?.map((permit) => (
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
              </div>
            </CardHeader>
            <CardContent>
              {incidentsLoading ? (
                <div className="text-center py-8">Loading...</div>
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
                    {incidents?.data?.map((incident) => (
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
              </div>
            </CardHeader>
            <CardContent>
              {capasLoading ? (
                <div className="text-center py-8">Loading...</div>
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
                    {capas?.data?.map((capa) => {
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
