import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../../services/crm.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { DollarSign, AlertTriangle, Users, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export function DunningPage() {
  const [pendingBuckets, setPendingBuckets] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: agingReport, isLoading: loadingAging } = useQuery({
    queryKey: ['aging-report'],
    queryFn: () => crmService.getAgingReport(),
  });

  const { data: disconnectionList, isLoading: loadingDisconnection } = useQuery({
    queryKey: ['disconnection-list'],
    queryFn: () => crmService.getDisconnectionList(),
  });

  const generateNoticesMutation = useMutation({
    mutationFn: (agingBucket: string) => crmService.generateDunningNotices(agingBucket),
    onMutate: (agingBucket) => {
      setPendingBuckets((prev) => new Set(prev).add(agingBucket));
    },
    onSuccess: (_data, agingBucket) => {
      setPendingBuckets((prev) => {
        const next = new Set(prev);
        next.delete(agingBucket);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['aging-report'] });
      toast.success('Dunning notices generated successfully');
    },
    onError: (error: Error, agingBucket) => {
      setPendingBuckets((prev) => {
        const next = new Set(prev);
        next.delete(agingBucket);
        return next;
      });
      toast.error(`Failed to generate notices: ${error.message}`);
    },
  });

  const handleGenerateNotices = (bucket: string) => {
    if (window.confirm(`Generate dunning notices for ${bucket} accounts?`)) {
      generateNoticesMutation.mutate(bucket);
    }
  };

  const summary = {
    total_balance: agingReport?.summary?.total_balance ?? 0,
    total_accounts: agingReport?.summary?.total_accounts ?? 0,
    current: agingReport?.summary?.current ?? 0,
    days_30: agingReport?.summary?.days_30 ?? 0,
    days_60: agingReport?.summary?.days_60 ?? 0,
    days_90: agingReport?.summary?.days_90 ?? 0,
    over_90: agingReport?.summary?.over_90 ?? 0,
  };
  const byCategory = agingReport?.by_category || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dunning & Collections</h1>
        <p className="text-muted-foreground">Monitor overdue accounts and manage collections</p>
      </div>

      {loadingAging ? (
        <p className="text-muted-foreground">Loading aging report...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KES {summary.total_balance.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">{summary.total_accounts} accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {summary.current.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Not overdue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">1-90 Days</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KES {(summary.days_30 + summary.days_60 + summary.days_90).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Over 90 Days</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  KES {summary.over_90.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Critical</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Balance Aging Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground">
                  <div>Bucket</div>
                  <div>Amount</div>
                  <div>% of Total</div>
                  <div>Count</div>
                  <div>Actions</div>
                </div>

                <div className="grid grid-cols-6 gap-4 items-center py-2 border-t">
                  <div className="font-medium">Current</div>
                  <div>KES {summary?.current.toLocaleString()}</div>
                  <div>
                    {summary?.total_balance
                      ? ((summary.current / summary.total_balance) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                  <div>-</div>
                  <div>
                    <Badge variant="outline">No Action</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-4 items-center py-2 border-t">
                  <div className="font-medium">1-30 Days</div>
                  <div>KES {summary?.days_30.toLocaleString()}</div>
                  <div>
                    {summary?.total_balance
                      ? ((summary.days_30 / summary.total_balance) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                  <div>-</div>
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateNotices('days_30')}
                      disabled={pendingBuckets.has('days_30')}
                    >
                      {pendingBuckets.has('days_30') ? 'Generating...' : 'Reminder Notice'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-4 items-center py-2 border-t">
                  <div className="font-medium">31-60 Days</div>
                  <div>KES {summary?.days_60.toLocaleString()}</div>
                  <div>
                    {summary?.total_balance
                      ? ((summary.days_60 / summary.total_balance) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                  <div>-</div>
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateNotices('days_60')}
                      disabled={pendingBuckets.has('days_60')}
                    >
                      {pendingBuckets.has('days_60') ? 'Generating...' : 'Warning Notice'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-4 items-center py-2 border-t">
                  <div className="font-medium">61-90 Days</div>
                  <div>KES {summary?.days_90.toLocaleString()}</div>
                  <div>
                    {summary?.total_balance
                      ? ((summary.days_90 / summary.total_balance) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                  <div>-</div>
                  <div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleGenerateNotices('days_90')}
                      disabled={pendingBuckets.has('days_90')}
                    >
                      {pendingBuckets.has('days_90') ? 'Generating...' : 'Final Notice'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-4 items-center py-2 border-t">
                  <div className="font-medium text-red-600">Over 90 Days</div>
                  <div className="text-red-600 font-bold">
                    KES {summary?.over_90.toLocaleString()}
                  </div>
                  <div className="text-red-600">
                    {summary?.total_balance
                      ? ((summary.over_90 / summary.total_balance) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                  <div>-</div>
                  <div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleGenerateNotices('over_90')}
                      disabled={pendingBuckets.has('over_90')}
                    >
                      {pendingBuckets.has('over_90') ? 'Generating...' : 'Disconnection Notice'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accounts by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Total Balance</TableHead>
                    <TableHead>Account Count</TableHead>
                    <TableHead>Avg Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(byCategory).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    Object.entries(byCategory).map(([category, data]: [string, any]) => (
                      <TableRow key={category}>
                        <TableCell className="font-medium capitalize">{category}</TableCell>
                        <TableCell>KES {data.total_balance?.toLocaleString() || 0}</TableCell>
                        <TableCell>{data.count || 0}</TableCell>
                        <TableCell>
                          KES{' '}
                          {data.count
                            ? ((data.total_balance || 0) / data.count).toLocaleString()
                            : 0}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disconnection List (Over 90 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDisconnection ? (
                <p className="text-muted-foreground">Loading disconnection list...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account No</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Last Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disconnectionList?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No accounts for disconnection
                        </TableCell>
                      </TableRow>
                    ) : (
                      disconnectionList?.map((account: any) => (
                        <TableRow key={account.account_no}>
                          <TableCell className="font-medium">{account.account_no}</TableCell>
                          <TableCell>{account.customer_name}</TableCell>
                          <TableCell className="text-red-600 font-bold">
                            KES {account.balance.toLocaleString()}
                          </TableCell>
                          <TableCell>{account.days_overdue}</TableCell>
                          <TableCell>
                            {account.last_payment_date
                              ? new Date(account.last_payment_date).toLocaleDateString()
                              : 'Never'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
