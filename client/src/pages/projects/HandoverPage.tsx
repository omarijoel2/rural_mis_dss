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
import { Plus, Package, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Handover {
  id: string;
  project_id: string;
  project_title: string;
  status: string;
  commissioning_date: string;
  assets_count: number;
  warranty_expiry: string | null;
  documents_count: number;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export function HandoverPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newHandover, setNewHandover] = useState({
    project_id: '',
    commissioning_date: '',
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['handovers-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/handovers/dashboard');
      return res.json();
    },
  });

  const { data: handoversData, isLoading } = useQuery({
    queryKey: ['handovers'],
    queryFn: async () => {
      const res = await fetch('/api/handovers');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/handovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Handover package created');
      queryClient.invalidateQueries({ queryKey: ['handovers'] });
      queryClient.invalidateQueries({ queryKey: ['handovers-dashboard'] });
      setIsCreateOpen(false);
      setNewHandover({ project_id: '', commissioning_date: '' });
    },
  });

  const handovers = handoversData?.data || [];
  const dashboard = dashboardData || { pending: 0, accepted: 0, rejected: 0, expiring_warranties: 0 };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Asset Capitalization & Handover</h1>
          <p className="text-muted-foreground">Manage project handovers, as-builts, and warranty tracking</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Handover
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Handover Package</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project ID *</label>
                <Input
                  placeholder="e.g., 5"
                  value={newHandover.project_id}
                  onChange={(e) => setNewHandover({ ...newHandover, project_id: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Commissioning Date *</label>
                <Input
                  type="date"
                  value={newHandover.commissioning_date}
                  onChange={(e) => setNewHandover({ ...newHandover, commissioning_date: e.target.value })}
                />
              </div>
              <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Upload documents</p>
                <p className="text-xs">As-builts, O&M manuals, warranties</p>
              </div>
              <Button
                onClick={() => createMutation.mutate(newHandover)}
                disabled={!newHandover.project_id || !newHandover.commissioning_date || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Handover Package'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" /> Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{dashboard.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" /> Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{dashboard.accepted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" /> Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" /> Expiring Warranties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{dashboard.expiring_warranties}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Handover Packages</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading handovers...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commissioning Date</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Warranty Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {handovers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No handover packages found
                    </TableCell>
                  </TableRow>
                ) : (
                  handovers.map((handover: Handover) => (
                    <TableRow key={handover.id}>
                      <TableCell className="font-medium">{handover.project_title}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[handover.status]}>
                          {handover.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{handover.commissioning_date}</TableCell>
                      <TableCell>{handover.assets_count}</TableCell>
                      <TableCell>{handover.documents_count}</TableCell>
                      <TableCell>
                        {handover.warranty_expiry || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          {handover.status === 'pending' && (
                            <Button size="sm" variant="default">Accept</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Capitalization Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Asset Class</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Depreciation Method</TableHead>
                <TableHead>Useful Life</TableHead>
                <TableHead>Posted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Eldoret Meter Replacement</TableCell>
                <TableCell>Meters & AMI Equipment</TableCell>
                <TableCell>KES 12,000,000</TableCell>
                <TableCell>Straight Line</TableCell>
                <TableCell>10 years</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Posted</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
