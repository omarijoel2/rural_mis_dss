import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { contractorService } from '../../services/cmms.service';
import { Button } from '../../components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { FileText, AlertCircle, TrendingUp, Clock, Plus, AlertTriangle } from 'lucide-react';
import { Progress } from '../../components/ui/progress';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FormTextarea } from '../../components/forms/FormTextarea';
import { toast } from 'sonner';

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  terminated: 'bg-red-100 text-red-800',
};

const contractSchema = z.object({
  contract_num: z.string().min(1, 'Contract number is required'),
  vendor_name: z.string().min(1, 'Vendor name is required'),
  type: z.enum(['maintenance', 'construction', 'supply', 'consulting']),
  value: z.number().positive('Contract value must be positive'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  description: z.string().optional(),
});

const violationSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  penalty_amount: z.number().positive('Penalty amount must be positive'),
});

type ContractFormData = z.infer<typeof contractSchema>;
type ViolationFormData = z.infer<typeof violationSchema>;

export function ContractorsPage() {
  const [filters, setFilters] = useState<{ page: number; per_page: number; status?: string }>({ 
    page: 1, 
    per_page: 15, 
    status: 'active' 
  });
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [violationDialogOpen, setViolationDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const queryClient = useQueryClient();

  const contractForm = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contract_num: '',
      vendor_name: '',
      type: 'maintenance',
      value: 0,
      start_date: '',
      end_date: '',
      description: '',
    },
  });

  const violationForm = useForm<ViolationFormData>({
    resolver: zodResolver(violationSchema),
    defaultValues: {
      description: '',
      penalty_amount: 0,
    },
  });

  useEffect(() => {
    if (!contractDialogOpen) {
      contractForm.reset();
    }
  }, [contractDialogOpen, contractForm]);

  useEffect(() => {
    if (!violationDialogOpen) {
      violationForm.reset();
      setSelectedContract(null);
    }
  }, [violationDialogOpen, violationForm]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['service-contracts', filters],
    queryFn: () => contractorService.getContracts(filters),
  });

  const { data: vendorScores } = useQuery({
    queryKey: ['vendor-scores'],
    queryFn: () => contractorService.getVendorScore({}),
  });

  const { data: expiringContracts } = useQuery({
    queryKey: ['expiring-contracts'],
    queryFn: () => contractorService.getExpiringContracts({ days: 90 }),
  });

  const createContractMutation = useMutation({
    mutationFn: contractorService.createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-contracts'] });
      setContractDialogOpen(false);
      toast.success('Contract created successfully');
    },
    onError: () => toast.error('Failed to create contract'),
  });

  const recordViolationMutation = useMutation({
    mutationFn: ({ contractId, data }: { contractId: number; data: any }) =>
      contractorService.recordViolation(contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-contracts'] });
      setViolationDialogOpen(false);
      toast.success('SLA violation recorded');
    },
    onError: () => toast.error('Failed to record violation'),
  });

  const handleCreateContract = (data: ContractFormData) => {
    createContractMutation.mutate({
      ...data,
      status: 'active' as const,
    });
  };

  const handleRecordViolation = (data: ViolationFormData) => {
    if (!selectedContract) {
      toast.error('No contract selected');
      return;
    }

    recordViolationMutation.mutate({
      contractId: selectedContract.id,
      data: {
        description: data.description,
        penalty_amount: data.penalty_amount,
        occurred_at: new Date().toISOString(),
      },
    });
  };

  const activeCount = data?.data?.filter(c => c.status === 'active').length || 0;
  const totalValue = data?.data?.reduce((sum, c) => sum + (c.value || 0), 0) || 0;

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Failed to load contracts data</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contractor & SLA Management</h1>
          <p className="text-muted-foreground">Service contracts and vendor performance tracking</p>
        </div>
        <Dialog open={contractDialogOpen} onOpenChange={setContractDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Service Contract</DialogTitle>
            </DialogHeader>
            <form onSubmit={contractForm.handleSubmit(handleCreateContract)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  control={contractForm.control}
                  name="contract_num"
                  label="Contract Number"
                  required
                  error={contractForm.formState.errors.contract_num?.message}
                />
                <FormInput
                  control={contractForm.control}
                  name="vendor_name"
                  label="Vendor Name"
                  required
                  error={contractForm.formState.errors.vendor_name?.message}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  control={contractForm.control}
                  name="type"
                  label="Contract Type"
                  required
                  options={[
                    { value: 'maintenance', label: 'Maintenance' },
                    { value: 'construction', label: 'Construction' },
                    { value: 'supply', label: 'Supply' },
                    { value: 'consulting', label: 'Consulting' },
                  ]}
                  error={contractForm.formState.errors.type?.message}
                />
                <FormInput
                  control={contractForm.control}
                  name="value"
                  label="Contract Value"
                  type="number"
                  step="0.01"
                  required
                  error={contractForm.formState.errors.value?.message}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  control={contractForm.control}
                  name="start_date"
                  label="Start Date"
                  type="date"
                  required
                  error={contractForm.formState.errors.start_date?.message}
                />
                <FormInput
                  control={contractForm.control}
                  name="end_date"
                  label="End Date"
                  type="date"
                  required
                  error={contractForm.formState.errors.end_date?.message}
                />
              </div>
              <FormTextarea
                control={contractForm.control}
                name="description"
                label="Description"
                rows={3}
                error={contractForm.formState.errors.description?.message}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setContractDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createContractMutation.isPending || !contractForm.formState.isValid}
                >
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Active Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Total contracts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Contract Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total active value</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {expiringContracts?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Next 90 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              SLA Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.data?.reduce((sum, c) => sum + (c.violations?.length || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contracts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Scorecards</TabsTrigger>
          <TabsTrigger value="expiring">Expiring</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Service Contracts</CardTitle>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => {
                    const { status, ...rest } = filters;
                    setFilters(value === 'all' 
                      ? { ...rest, page: 1 } 
                      : { ...rest, status: value, page: 1 }
                    );
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : !data?.data || data.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No contracts found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-mono">{contract.contract_num}</TableCell>
                        <TableCell className="font-medium">{contract.vendor_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{contract.type}</Badge>
                        </TableCell>
                        <TableCell>${contract.value.toLocaleString()}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(contract.start_date).toLocaleDateString()} -<br />
                          {new Date(contract.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[contract.status]}>
                            {contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedContract(contract);
                              setViolationDialogOpen(true);
                            }}
                          >
                            Log Violation
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance Scorecards</CardTitle>
            </CardHeader>
            <CardContent>
              {vendorScores && vendorScores.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Timeliness</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Overall Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorScores.map((score: any) => (
                      <TableRow key={score.id}>
                        <TableCell className="font-medium">{score.vendor_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={score.quality_score} className="w-24" />
                            <span className="text-sm">{score.quality_score}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={score.timeliness_score} className="w-24" />
                            <span className="text-sm">{score.timeliness_score}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={score.compliance_score} className="w-24" />
                            <span className="text-sm">{score.compliance_score}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={score.overall_score >= 80 ? 'default' : 'secondary'}
                          >
                            {score.overall_score}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No vendor scorecards available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring">
          <Card>
            <CardHeader>
              <CardTitle>Contracts Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              {expiringContracts && expiringContracts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringContracts.map((contract: any) => {
                      const daysLeft = Math.ceil(
                        (new Date(contract.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <TableRow key={contract.id}>
                          <TableCell className="font-mono">{contract.contract_num}</TableCell>
                          <TableCell className="font-medium">{contract.vendor_name}</TableCell>
                          <TableCell>
                            {new Date(contract.end_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={daysLeft <= 30 ? 'destructive' : 'secondary'}>
                              {daysLeft} days
                            </Badge>
                          </TableCell>
                          <TableCell>${contract.value.toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No contracts expiring soon
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={violationDialogOpen} onOpenChange={setViolationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record SLA Violation</DialogTitle>
          </DialogHeader>
          <form onSubmit={violationForm.handleSubmit(handleRecordViolation)} className="space-y-4">
            <div className="bg-muted p-3 rounded-md text-sm">
              <strong>Contract:</strong> {selectedContract?.contract_num} - {selectedContract?.vendor_name}
            </div>
            <FormTextarea
              control={violationForm.control}
              name="description"
              label="Violation Description"
              placeholder="Describe the SLA breach..."
              rows={3}
              required
              error={violationForm.formState.errors.description?.message}
            />
            <FormInput
              control={violationForm.control}
              name="penalty_amount"
              label="Penalty Amount"
              type="number"
              step="0.01"
              required
              error={violationForm.formState.errors.penalty_amount?.message}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViolationDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={recordViolationMutation.isPending || !violationForm.formState.isValid}
              >
                Record Violation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
