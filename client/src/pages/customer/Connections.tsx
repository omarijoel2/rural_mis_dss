import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { commercialService, type ConnectionApplication } from '@/services/commercial.service';
import { toast } from 'sonner';

export function Connections() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wizardStep, setWizardStep] = useState(1);
  const queryClient = useQueryClient();

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['connection-applications', statusFilter],
    queryFn: () => commercialService.getConnectionApplications({
      status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
      per_page: 50,
    }),
  });

  const submitMutation = useMutation({
    mutationFn: commercialService.submitApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-applications'] });
      setWizardOpen(false);
      setWizardStep(1);
      toast.success('Application submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      commercialService.updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-applications'] });
      toast.success('Application updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update application');
    },
  });

  const handleWizardSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (wizardStep < 3) {
      setWizardStep(wizardStep + 1);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      applicant_name: formData.get('applicant_name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      id_number: formData.get('id_number') as string,
      address: formData.get('address') as string,
      location: {
        lat: parseFloat(formData.get('lat') as string) || -1.286389,
        lng: parseFloat(formData.get('lng') as string) || 36.817223,
      },
      connection_type: formData.get('connection_type') as string,
      property_type: formData.get('property_type') as string,
    };

    submitMutation.mutate(data);
  };

  const handleApprove = (id: number) => {
    updateMutation.mutate({ id, data: { status: 'approved' } });
  };

  const handleReject = (id: number) => {
    updateMutation.mutate({ id, data: { status: 'rejected' } });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: string; icon: any }> = {
      kyc_pending: { variant: 'bg-yellow-600', icon: AlertCircle },
      pending_approval: { variant: 'bg-blue-600', icon: AlertCircle },
      approved: { variant: 'bg-green-600', icon: CheckCircle },
      rejected: { variant: 'bg-red-600', icon: XCircle },
      connected: { variant: 'bg-purple-600', icon: CheckCircle },
    };
    const { variant, icon: Icon } = config[status] || config.kyc_pending;
    return (
      <Badge className={variant}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getKycBadge = (kycStatus: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-600',
      verified: 'bg-green-600',
      rejected: 'bg-red-600',
    };
    return <Badge className={variants[kycStatus]}>{kycStatus.toUpperCase()}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Connection Applications</h1>
          <p className="text-muted-foreground mt-1">New service requests and approval workflow</p>
        </div>
        <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setWizardStep(1)}>
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Step {wizardStep} of 3: {wizardStep === 1 ? 'Applicant Details' : wizardStep === 2 ? 'Property Information' : 'Confirmation'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleWizardSubmit} className="space-y-4">
              {wizardStep === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="applicant_name">Full Name</Label>
                    <Input id="applicant_name" name="applicant_name" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input id="email" name="email" type="email" />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="id_number">ID/Passport Number</Label>
                    <Input id="id_number" name="id_number" required />
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="address">Property Address</Label>
                    <Input id="address" name="address" required />
                  </div>
                  <div>
                    <Label htmlFor="connection_type">Connection Type</Label>
                    <select id="connection_type" name="connection_type" className="w-full border rounded-md p-2" required>
                      <option value="new">New Connection</option>
                      <option value="upgrade">Upgrade</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="property_type">Property Type</Label>
                    <select id="property_type" name="property_type" className="w-full border rounded-md p-2" required>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="industrial">Industrial</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="lat">Latitude</Label>
                    <Input id="lat" name="lat" type="number" step="any" defaultValue="-1.286389" required />
                  </div>
                  <div>
                    <Label htmlFor="lng">Longitude</Label>
                    <Input id="lng" name="lng" type="number" step="any" defaultValue="36.817223" required />
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">Review Application</h3>
                    <p className="text-muted-foreground mt-2">
                      Please review your information before submitting
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                    <p><strong>Applicant:</strong> Check form data</p>
                    <p><strong>Phone:</strong> Check form data</p>
                    <p><strong>Property:</strong> Check form data</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setWizardOpen(false)}
                >
                  {wizardStep > 1 ? 'Previous' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={submitMutation.isPending}>
                  {wizardStep < 3 ? 'Next' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Application Management
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="kyc_pending">KYC Pending</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="connected">Connected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading applications...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application No</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead className="text-right">Est. Cost</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicationsData?.data?.map((app: ConnectionApplication) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono">{app.application_no}</TableCell>
                    <TableCell className="font-medium">{app.applicant_name}</TableCell>
                    <TableCell>{app.phone}</TableCell>
                    <TableCell className="max-w-xs truncate">{app.address}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>{getKycBadge(app.kyc_status)}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(app.estimated_cost)}
                    </TableCell>
                    <TableCell>{new Date(app.applied_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {app.status === 'pending_approval' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleApprove(app.id)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)}>
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {applicationsData?.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No applications found. Submit a new application to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
