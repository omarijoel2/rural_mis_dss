import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { Plus, MapPin, FileText, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { projectsService, type LandParcel, type Wayleave } from '../../services/projects.service';

const STATUS_COLORS: Record<string, string> = {
  identified: 'bg-gray-100 text-gray-800',
  valuation: 'bg-blue-100 text-blue-800',
  negotiation: 'bg-yellow-100 text-yellow-800',
  acquired: 'bg-green-100 text-green-800',
  disputed: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-gray-100 text-gray-800',
};

export function LandPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newParcel, setNewParcel] = useState({
    ref_no: '',
    owner_name: '',
    area_ha: '',
    county: '',
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['land-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/land/dashboard');
      return res.json();
    },
  });

  const { data: parcelsData, isLoading } = useQuery({
    queryKey: ['land-parcels'],
    queryFn: () => projectsService.getLandParcels(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/land', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Land parcel registered');
      queryClient.invalidateQueries({ queryKey: ['land-parcels'] });
      queryClient.invalidateQueries({ queryKey: ['land-dashboard'] });
      setIsCreateOpen(false);
      setNewParcel({ ref_no: '', owner_name: '', area_ha: '', county: '' });
    },
  });

  const parcels = (parcelsData as any) || [];
  const dashboard = dashboardData || {
    total_parcels: 0,
    acquired: 0,
    disputed: 0,
    pending_compensation: 0,
    active_wayleaves: 0,
    expiring_wayleaves: 0,
    total_compensation_paid: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Land & Wayleave Administration</h1>
          <p className="text-muted-foreground">Manage parcels, wayleaves, and compensation</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Register Parcel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register Land Parcel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Reference Number *</label>
                <Input
                  placeholder="e.g., LND-004"
                  value={newParcel.ref_no}
                  onChange={(e) => setNewParcel({ ...newParcel, ref_no: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Owner Name *</label>
                <Input
                  placeholder="Land owner name"
                  value={newParcel.owner_name}
                  onChange={(e) => setNewParcel({ ...newParcel, owner_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Area (Hectares)</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={newParcel.area_ha}
                    onChange={(e) => setNewParcel({ ...newParcel, area_ha: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">County</label>
                  <Input
                    placeholder="Nairobi"
                    value={newParcel.county}
                    onChange={(e) => setNewParcel({ ...newParcel, county: e.target.value })}
                  />
                </div>
              </div>
              <Button
                onClick={() => createMutation.mutate({
                  ref_no: newParcel.ref_no,
                  owner_name: newParcel.owner_name,
                  area_ha: parseFloat(newParcel.area_ha),
                  county: newParcel.county,
                })}
                disabled={!newParcel.ref_no || !newParcel.owner_name || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? 'Registering...' : 'Register Parcel'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Total Parcels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.total_parcels}</div>
            <p className="text-xs text-muted-foreground">{dashboard.acquired} acquired</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Disputed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{dashboard.disputed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" /> Active Wayleaves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.active_wayleaves}</div>
            <p className="text-xs text-muted-foreground">{dashboard.expiring_wayleaves} expiring soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Compensation Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KES {(dashboard.total_compensation_paid / 1000000).toFixed(1)}M</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="parcels">
        <TabsList>
          <TabsTrigger value="parcels">Land Parcels</TabsTrigger>
          <TabsTrigger value="wayleaves">Wayleaves</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
        </TabsList>

        <TabsContent value="parcels">
          <Card>
            <CardHeader>
              <CardTitle>Land Parcels Registry</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading parcels...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref No</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Area (Ha)</TableHead>
                      <TableHead>County</TableHead>
                      <TableHead>Title Status</TableHead>
                      <TableHead>Acquisition Status</TableHead>
                      <TableHead>Project</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parcels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No parcels found
                        </TableCell>
                      </TableRow>
                    ) : (
                      parcels.map((parcel: LandParcel) => (
                        <TableRow key={parcel.id}>
                          <TableCell className="font-mono">{parcel.ref_no}</TableCell>
                          <TableCell className="font-medium">{parcel.owner_name}</TableCell>
                          <TableCell>{parcel.area_ha}</TableCell>
                          <TableCell>{parcel.county || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{parcel.title_status || 'unregistered'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[parcel.acquisition_status]}>
                              {parcel.acquisition_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {parcel.project_id ? `PRJ-${parcel.project_id}` : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wayleaves">
          <Card>
            <CardHeader>
              <CardTitle>Wayleave Register</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wayleave No</TableHead>
                    <TableHead>Parcel</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Width (m)</TableHead>
                    <TableHead>Length (m)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Annual Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">WL-2024-001</TableCell>
                    <TableCell>LND-001</TableCell>
                    <TableCell>Pipeline</TableCell>
                    <TableCell>6</TableCell>
                    <TableCell>1,200</TableCell>
                    <TableCell><Badge className="bg-green-100 text-green-800">active</Badge></TableCell>
                    <TableCell>2044-03-31</TableCell>
                    <TableCell>KES 50,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">WL-2024-002</TableCell>
                    <TableCell>LND-002</TableCell>
                    <TableCell>Access Road</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>800</TableCell>
                    <TableCell><Badge className="bg-yellow-100 text-yellow-800">pending</Badge></TableCell>
                    <TableCell>2025-07-14</TableCell>
                    <TableCell>KES 25,000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compensation">
          <Card>
            <CardHeader>
              <CardTitle>Compensation Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comp No</TableHead>
                    <TableHead>Parcel</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Valuation</TableHead>
                    <TableHead>Negotiated</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">CMP-2024-001</TableCell>
                    <TableCell>LND-001</TableCell>
                    <TableCell>Land Acquisition</TableCell>
                    <TableCell>KES 2.5M</TableCell>
                    <TableCell>KES 2.8M</TableCell>
                    <TableCell className="text-green-600 font-semibold">KES 2.8M</TableCell>
                    <TableCell><Badge className="bg-green-100 text-green-800">paid</Badge></TableCell>
                    <TableCell>2024-04-10</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">CMP-2024-002</TableCell>
                    <TableCell>LND-002</TableCell>
                    <TableCell>Land Acquisition</TableCell>
                    <TableCell>KES 8.5M</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>KES 0</TableCell>
                    <TableCell><Badge className="bg-yellow-100 text-yellow-800">negotiated</Badge></TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
