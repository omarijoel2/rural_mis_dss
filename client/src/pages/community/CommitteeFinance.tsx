import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

export function CommitteeFinance() {
  const [entries, setEntries] = useState([]);
  const [balance] = useState(1200000);

  useEffect(() => {
    fetch('/api/community/finance/cashbook')
      .then(r => r.json())
      .then(d => setEntries(d.data || []))
      .catch(() => setEntries([
        { id: '1', date: '2025-11-20', refNo: 'REC001', particulars: 'Monthly tariff', type: 'receipt', amount: 125000, status: 'approved' },
        { id: '2', date: '2025-11-19', refNo: 'PAY001', particulars: 'Operator salary', type: 'payment', amount: 45000, status: 'approved' },
      ]));
  }, []);

  const receipts = entries.filter(e => e.type === 'receipt');
  const payments = entries.filter(e => e.type === 'payment');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Committee Finance & Cashbook</h1>
          <p className="text-muted-foreground mt-1">Community tariff collection, cashbook, and financial audits</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New Entry</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {(receipts.reduce((a, e) => a + (e.amount || 0), 0) / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Current period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bank Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {(balance / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.filter(e => e.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cashbook Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Entries</TabsTrigger>
              <TabsTrigger value="receipts">Receipts</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-left py-2 px-2">Ref #</th>
                      <th className="text-left py-2 px-2">Particulars</th>
                      <th className="text-left py-2 px-2">Type</th>
                      <th className="text-right py-2 px-2">Amount</th>
                      <th className="text-left py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(e => (
                      <tr key={e.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">{e.date}</td>
                        <td className="py-2 px-2 font-mono text-xs">{e.refNo}</td>
                        <td className="py-2 px-2">{e.particulars}</td>
                        <td className="py-2 px-2"><Badge variant={e.type === 'receipt' ? 'default' : 'secondary'}>{e.type}</Badge></td>
                        <td className="py-2 px-2 text-right">KES {(e.amount / 1000).toFixed(0)}K</td>
                        <td className="py-2 px-2"><Badge variant={e.status === 'approved' ? 'default' : 'outline'}>{e.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="receipts">
              <div className="text-sm text-muted-foreground">Receipts: KES {(receipts.reduce((a, e) => a + (e.amount || 0), 0) / 1000).toFixed(0)}K</div>
            </TabsContent>

            <TabsContent value="payments">
              <div className="text-sm text-muted-foreground">Payments: KES {(payments.reduce((a, e) => a + (e.amount || 0), 0) / 1000).toFixed(0)}K</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
