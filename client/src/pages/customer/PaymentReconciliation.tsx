import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Filter, TrendingDown } from 'lucide-react';
import { commercialService, type Payment, type AgingReport } from '@/services/commercial.service';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function PaymentReconciliation() {
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['payments', channelFilter, statusFilter, searchTerm],
    queryFn: () => commercialService.getPayments({
      channel: channelFilter !== 'all' ? channelFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchTerm || undefined,
      per_page: 50,
    }),
  });

  const { data: agingData } = useQuery({
    queryKey: ['aging-report'],
    queryFn: () => commercialService.getAgingReport(),
  });

  const reconcileMutation = useMutation({
    mutationFn: ({ paymentId, invoiceIds }: { paymentId: number; invoiceIds: number[] }) =>
      commercialService.reconcilePayment(paymentId, invoiceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['aging-report'] });
      toast.success('Payment reconciled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reconcile payment');
    },
  });

  const getChannelBadge = (channel: string) => {
    const variants: Record<string, string> = {
      cash: 'bg-green-600',
      bank: 'bg-blue-600',
      mpesa: 'bg-purple-600',
      online: 'bg-orange-600',
      adjustment: 'bg-gray-600',
    };
    return <Badge className={variants[channel] || 'bg-gray-600'}>{channel.toUpperCase()}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Reconciliation</h1>
        <p className="text-muted-foreground mt-1">Match payments to invoices across all channels</p>
      </div>

      {/* Aging Dashboard */}
      {agingData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Aging Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold">{(agingData.summary?.total_accounts || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total Accounts</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(agingData.summary?.total_balance || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Balance</p>
                </div>
                <div>
                  <div className="text-xl font-semibold">{agingData.dso || 0} days</div>
                  <p className="text-xs text-muted-foreground">DSO (Days Sales Outstanding)</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={agingData.aging_buckets || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Debtors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(agingData.top_debtors || []).slice(0, 5).map((debtor: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">{debtor.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{debtor.account_no}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(debtor.balance)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        90+: {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(debtor.over_90)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Reconciliation Console */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Reconciliation Console
            </CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search account or ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="reconciled">Reconciled</SelectItem>
                  <SelectItem value="unreconciled">Unreconciled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account No</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsData?.data?.map((payment: Payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono">{payment.account_no}</TableCell>
                    <TableCell>{new Date(payment.paid_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-medium">
                      {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(payment.amount)}
                    </TableCell>
                    <TableCell>{getChannelBadge(payment.channel)}</TableCell>
                    <TableCell className="font-mono text-xs">{payment.ref || 'N/A'}</TableCell>
                    <TableCell>
                      {payment.connection?.customer ? 
                        `${payment.connection.customer.first_name} ${payment.connection.customer.last_name}` : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          toast.info('Manual reconciliation dialog would open here');
                        }}
                      >
                        Reconcile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paymentsData?.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No payments found. Adjust filters to see more results.
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
