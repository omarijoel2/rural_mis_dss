import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { crmService } from '../../services/crm.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { AlertCircle, TrendingUp, TrendingDown, Minus, User, MapPin, CreditCard } from 'lucide-react';

export function Account360Page() {
  const { accountNo } = useParams<{ accountNo: string }>();

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['account-overview', accountNo],
    queryFn: () => crmService.getAccountOverview(accountNo!),
    enabled: !!accountNo,
  });

  const { data: billing } = useQuery({
    queryKey: ['account-billing', accountNo],
    queryFn: () => crmService.getBillingHistory(accountNo!, 12),
    enabled: !!accountNo,
  });

  const { data: analytics } = useQuery({
    queryKey: ['account-analytics', accountNo],
    queryFn: () => crmService.getConsumptionAnalytics(accountNo!, 12),
    enabled: !!accountNo,
  });

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg">Loading account details...</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-red-600">Account not found</p>
      </div>
    );
  }

  const balance = overview.balance?.balance || 0;
  const trendIcon = analytics?.trend === 'increasing' ? (
    <TrendingUp className="h-4 w-4 text-orange-600" />
  ) : analytics?.trend === 'decreasing' ? (
    <TrendingDown className="h-4 w-4 text-green-600" />
  ) : (
    <Minus className="h-4 w-4 text-gray-600" />
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Account {accountNo}</h1>
          <p className="text-muted-foreground">
            {overview.customer.first_name} {overview.customer.last_name}
          </p>
        </div>
        <Badge variant={overview.connection.status === 'active' ? 'default' : 'destructive'}>
          {overview.connection.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {balance > 0 ? 'Outstanding' : 'Paid up'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Consumption</CardTitle>
            {trendIcon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.average || 0} m³</div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              Trend: {analytics?.trend?.replace('_', ' ') || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.active_cases_count}</div>
            <p className="text-xs text-muted-foreground mt-1">Revenue Assurance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complaints</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.open_complaints_count}</div>
            <p className="text-xs text-muted-foreground mt-1">Open issues</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reads">Meter Reads</TabsTrigger>
          <TabsTrigger value="cases">RA Cases</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Name:</span>
                  <span className="text-sm">
                    {overview.customer.first_name} {overview.customer.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">ID Number:</span>
                  <span className="text-sm">{overview.customer.id_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Phone:</span>
                  <span className="text-sm">{overview.customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{overview.customer.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Type:</span>
                  <Badge variant="outline">{overview.customer.customer_type}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Premise Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Address:</span>
                  <span className="text-sm">{overview.premise.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Category:</span>
                  <Badge variant="outline">{overview.premise.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Connection Date:</span>
                  <span className="text-sm">
                    {new Date(overview.connection.connected_at).toLocaleDateString()}
                  </span>
                </div>
                {overview.latest_meter && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Meter No:</span>
                    <span className="text-sm">{overview.latest_meter.meter_no}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {overview.balance && overview.balance.balance > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Balance Aging</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Current</p>
                    <p className="text-lg font-bold">KES {overview.balance.current.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">1-30 Days</p>
                    <p className="text-lg font-bold">KES {overview.balance.days_30.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">31-60 Days</p>
                    <p className="text-lg font-bold">KES {overview.balance.days_60.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">61-90 Days</p>
                    <p className="text-lg font-bold">KES {overview.balance.days_90.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Over 90 Days</p>
                    <p className="text-lg font-bold text-red-600">
                      KES {overview.balance.over_90.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billing?.invoices.map((invoice: any) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        {new Date(invoice.period_start).toLocaleDateString()} -{' '}
                        {new Date(invoice.period_end).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>KES {invoice.total_amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(invoice.due_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billing?.payments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.paid_at).toLocaleDateString()}</TableCell>
                      <TableCell>KES {payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.channel}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reads">
          <Card>
            <CardHeader>
              <CardTitle>Recent Meter Reads</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reading</TableHead>
                    <TableHead>Consumption</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.recent_reads.map((read: any, idx: number) => {
                    const prevRead = idx > 0 ? overview.recent_reads[idx - 1] : null;
                    const consumption = prevRead ? read.value - prevRead.value : null;
                    
                    return (
                      <TableRow key={read.id}>
                        <TableCell>{new Date(read.read_at).toLocaleDateString()}</TableCell>
                        <TableCell>{read.value} m³</TableCell>
                        <TableCell>
                          {consumption !== null ? `${consumption} m³` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={read.quality === 'good' ? 'default' : 'secondary'}>
                            {read.quality}
                          </Badge>
                        </TableCell>
                        <TableCell>{read.source}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Assurance Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {overview.active_cases_count} active case(s) for this account
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
