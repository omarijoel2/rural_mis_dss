import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface Bid {
  id: string;
  rfqId: string;
  vendorName: string;
  status: string;
  priceTotal: number;
  leadTime: number;
}

export function BidsCenter() {
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    fetch('/api/partner/bids')
      .then(r => r.json())
      .then(d => setBids(d.data || []))
      .catch(() => setBids([
        { id: '1', rfqId: 'RFQ-001', vendorName: 'WaterTech', status: 'submitted', priceTotal: 850000, leadTime: 14 },
      ]));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Bids & RFQ Center</h1>
          <p className="text-muted-foreground mt-1">RFQ management, bid submission, and evaluation</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New RFQ</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active RFQs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Open for bidding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Evaluation</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bids.filter(b => b.status === 'submitted').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bids.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bids</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">RFQ ID</th>
                  <th className="text-left py-2 px-2">Vendor</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-right py-2 px-2">Price</th>
                  <th className="text-left py-2 px-2">Lead Time</th>
                </tr>
              </thead>
              <tbody>
                {bids.map(b => (
                  <tr key={b.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-mono text-xs">{b.rfqId}</td>
                    <td className="py-2 px-2">{b.vendorName}</td>
                    <td className="py-2 px-2"><Badge variant="default">{b.status}</Badge></td>
                    <td className="py-2 px-2 text-right">KES {(b.priceTotal / 1000).toFixed(0)}K</td>
                    <td className="py-2 px-2">{b.leadTime} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
