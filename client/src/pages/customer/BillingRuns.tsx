import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt, Plus, Eye, Play } from 'lucide-react';
import { commercialService, type BillingRun } from '@/services/commercial.service';
import { toast } from 'sonner';

export function BillingRuns() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [step, setStep] = useState(1);
  const queryClient = useQueryClient();

  const { data: runsData, isLoading } = useQuery({
    queryKey: ['billing-runs'],
    queryFn: () => commercialService.getBillingRuns({ per_page: 50 }),
  });

  const previewMutation = useMutation({
    mutationFn: commercialService.previewBilling,
    onSuccess: (data) => {
      setPreviewData(data);
      setStep(2);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate preview');
    },
  });

  const executeMutation = useMutation({
    mutationFn: commercialService.executeBilling,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['billing-runs'] });
      setWizardOpen(false);
      setStep(1);
      setPreviewData(null);
      toast.success(`Billing run completed: ${data.invoices_created} invoices created`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to execute billing run');
    },
  });

  const handlePreview = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    previewMutation.mutate({
      period_start: formData.get('period_start') as string,
      period_end: formData.get('period_end') as string,
      segment: formData.get('segment') as string || undefined,
      limit: 10,
    });
  };

  const handleExecute = () => {
    if (!previewData) return;
    
    const formData = new FormData(document.querySelector('form') as HTMLFormElement);
    executeMutation.mutate({
      period_start: formData.get('period_start') as string,
      period_end: formData.get('period_end') as string,
      due_date: formData.get('due_date') as string,
      segment: formData.get('segment') as string || undefined,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Billing Runs</h1>
          <p className="text-muted-foreground mt-1">Monthly billing execution and invoice generation</p>
        </div>
        <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setStep(1); setPreviewData(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              New Billing Run
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {step === 1 ? 'Step 1: Configure Billing Period' : 'Step 2: Review & Execute'}
              </DialogTitle>
            </DialogHeader>

            {step === 1 && (
              <form onSubmit={handlePreview} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="period_start">Billing Period Start</Label>
                    <Input id="period_start" name="period_start" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="period_end">Billing Period End</Label>
                    <Input id="period_end" name="period_end" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Invoice Due Date</Label>
                    <Input id="due_date" name="due_date" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="segment">Customer Segment (Optional)</Label>
                    <select id="segment" name="segment" className="w-full border rounded-md p-2">
                      <option value="">All Customers</option>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="industrial">Industrial</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setWizardOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={previewMutation.isPending}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </form>
            )}

            {step === 2 && previewData && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{previewData.preview_count}</div>
                      <p className="text-xs text-muted-foreground">Accounts</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(previewData.total_estimated)}
                      </div>
                      <p className="text-xs text-muted-foreground">Total Estimated</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm font-medium">{previewData.period_start}</div>
                      <p className="text-xs text-muted-foreground">Period Start</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm font-medium">{previewData.period_end}</div>
                      <p className="text-xs text-muted-foreground">Period End</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account No</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Consumption (m³)</TableHead>
                        <TableHead className="text-right">Estimated Charge</TableHead>
                        <TableHead>Tariff</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.accounts.map((account: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono">{account.account_no}</TableCell>
                          <TableCell>{account.customer_name}</TableCell>
                          <TableCell className="text-right">{account.consumption.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(account.estimated_charge)}
                          </TableCell>
                          <TableCell>{account.tariff}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={handleExecute} disabled={executeMutation.isPending}>
                    <Play className="h-4 w-4 mr-2" />
                    Execute Billing Run
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Billing Run History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading billing runs...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Period Dates</TableHead>
                  <TableHead className="text-right">Invoice Count</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runsData?.data?.map((run: BillingRun, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{run.period}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(run.period_start).toLocaleDateString()} - {new Date(run.period_end).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{(run.invoice_count || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(run.total_amount || 0)}
                    </TableCell>
                    <TableCell>{new Date(run.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {runsData?.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No billing runs found. Create your first billing run to generate invoices.
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
