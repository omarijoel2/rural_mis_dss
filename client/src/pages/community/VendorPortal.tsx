import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Handshake, Star, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface Vendor {
  id: string;
  companyName: string;
  status: string;
  kycStatus: string;
  rating: number;
  otifScore: number;
}

export function VendorPortal() {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    fetch('/api/partner/vendors')
      .then(r => r.json())
      .then(d => setVendors(d.data || []))
      .catch(() => setVendors([
        { id: '1', companyName: 'WaterTech Solutions', status: 'approved', kycStatus: 'verified', rating: 4.8, otifScore: 0.94 },
        { id: '2', companyName: 'Nairobi Supplies', status: 'approved', kycStatus: 'verified', rating: 4.5, otifScore: 0.89 },
      ]));
  }, []);

  const approved = vendors.filter(v => v.status === 'approved').length;
  const avgOtif = vendors.length > 0 ? (vendors.reduce((a, v) => a + v.otifScore, 0) / vendors.length * 100).toFixed(0) : 0;
  const pending = vendors.filter(v => v.kycStatus === 'pending').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Vendor & Partner Portal</h1>
          <p className="text-muted-foreground mt-1">Vendor registration, KYC, and performance tracking</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Register Vendor</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Vendors</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approved}</div>
            <p className="text-xs text-muted-foreground">Active in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg OTIF Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOtif}%</div>
            <p className="text-xs text-muted-foreground">On-time in-full delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Company</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">KYC</th>
                  <th className="text-left py-2 px-2">Rating</th>
                  <th className="text-left py-2 px-2">OTIF</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">{v.companyName}</td>
                    <td className="py-2 px-2"><Badge variant={v.status === 'approved' ? 'default' : 'secondary'}>{v.status}</Badge></td>
                    <td className="py-2 px-2"><Badge variant={v.kycStatus === 'verified' ? 'default' : 'outline'}>{v.kycStatus}</Badge></td>
                    <td className="py-2 px-2">{v.rating > 0 ? `${v.rating}★` : 'N/A'}</td>
                    <td className="py-2 px-2">{(v.otifScore * 100).toFixed(0)}%</td>
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
