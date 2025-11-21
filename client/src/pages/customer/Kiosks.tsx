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
import { Home, Plus, BarChart3, Truck, Edit, Trash2 } from 'lucide-react';
import { commercialService, type Kiosk } from '@/services/commercial.service';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Kiosks() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKiosk, setEditingKiosk] = useState<Kiosk | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedKioskId, setSelectedKioskId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: kiosksData, isLoading } = useQuery({
    queryKey: ['kiosks', statusFilter],
    queryFn: () => commercialService.getKiosks({
      status: statusFilter || undefined,
      per_page: 50,
    }),
  });

  const { data: salesData } = useQuery({
    queryKey: ['kiosk-sales', selectedKioskId],
    queryFn: () => selectedKioskId ? commercialService.getKioskSales(selectedKioskId) : null,
    enabled: !!selectedKioskId,
  });

  const { data: trucksData } = useQuery({
    queryKey: ['trucks'],
    queryFn: () => commercialService.getTrucks(),
  });

  const createMutation = useMutation({
    mutationFn: commercialService.createKiosk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kiosks'] });
      setDialogOpen(false);
      setEditingKiosk(null);
      toast.success('Kiosk created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create kiosk');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Kiosk> }) =>
      commercialService.updateKiosk(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kiosks'] });
      setDialogOpen(false);
      setEditingKiosk(null);
      toast.success('Kiosk updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update kiosk');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: commercialService.deleteKiosk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kiosks'] });
      toast.success('Kiosk deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete kiosk');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: Partial<Kiosk> = {
      kiosk_code: formData.get('kiosk_code') as string,
      vendor_name: formData.get('vendor_name') as string,
      vendor_phone: formData.get('vendor_phone') as string,
      location: formData.get('location') as string,
      coordinates: {
        lat: parseFloat(formData.get('lat') as string),
        lng: parseFloat(formData.get('lng') as string),
      },
      daily_target: parseFloat(formData.get('daily_target') as string),
    };

    if (editingKiosk) {
      updateMutation.mutate({ id: editingKiosk.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (kiosk: Kiosk) => {
    setEditingKiosk(kiosk);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this kiosk?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-600',
      suspended: 'bg-red-600',
      inactive: 'bg-gray-600',
    };
    return <Badge className={variants[status] || 'bg-gray-600'}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Water Kiosks & Trucking</h1>
          <p className="text-muted-foreground mt-1">Kiosk registry, vendor management, and sales tracking</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingKiosk(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Register Kiosk
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingKiosk ? 'Edit Kiosk' : 'Register New Kiosk'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kiosk_code">Kiosk Code</Label>
                  <Input id="kiosk_code" name="kiosk_code" defaultValue={editingKiosk?.kiosk_code} required />
                </div>
                <div>
                  <Label htmlFor="vendor_name">Vendor Name</Label>
                  <Input id="vendor_name" name="vendor_name" defaultValue={editingKiosk?.vendor_name} required />
                </div>
                <div>
                  <Label htmlFor="vendor_phone">Vendor Phone</Label>
                  <Input id="vendor_phone" name="vendor_phone" type="tel" defaultValue={editingKiosk?.vendor_phone} required />
                </div>
                <div>
                  <Label htmlFor="daily_target">Daily Target (KES)</Label>
                  <Input id="daily_target" name="daily_target" type="number" defaultValue={editingKiosk?.daily_target} required />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="location">Location Description</Label>
                  <Input id="location" name="location" defaultValue={editingKiosk?.location} required />
                </div>
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input id="lat" name="lat" type="number" step="any" defaultValue={editingKiosk?.coordinates.lat || -1.286389} required />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input id="lng" name="lng" type="number" step="any" defaultValue={editingKiosk?.coordinates.lng || 36.817223} required />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingKiosk ? 'Update' : 'Register'} Kiosk
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{kiosksData?.summary?.total_kiosks || 0}</div>
            <p className="text-xs text-muted-foreground">Total Kiosks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{kiosksData?.summary?.active_kiosks || 0}</div>
            <p className="text-xs text-muted-foreground">Active Kiosks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(kiosksData?.summary?.today_total_sales || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Today's Sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(kiosksData?.summary?.total_balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total Balance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kiosk Registry */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Kiosk Registry
              </CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading kiosks...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Today's Sales</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kiosksData?.data?.map((kiosk: Kiosk) => (
                    <TableRow key={kiosk.id} className="cursor-pointer" onClick={() => setSelectedKioskId(kiosk.id)}>
                      <TableCell className="font-mono">{kiosk.kiosk_code}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{kiosk.vendor_name}</div>
                          <div className="text-xs text-muted-foreground">{kiosk.vendor_phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{kiosk.location}</TableCell>
                      <TableCell>{getStatusBadge(kiosk.status)}</TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div>{new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(kiosk.today_sales)}</div>
                          <div className="text-xs text-muted-foreground">
                            Target: {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(kiosk.daily_target)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={kiosk.balance < 0 ? 'text-red-600 font-semibold' : ''}>
                          {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(kiosk.balance)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(kiosk); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(kiosk.id); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {kiosksData?.data?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No kiosks found. Register your first kiosk to start tracking.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Sales Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sales Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedKioskId && salesData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Volume</div>
                    <div className="font-semibold">{salesData.total_volume.toFixed(1)} m³</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg. Daily</div>
                    <div className="font-semibold">{new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(salesData.average_daily)}</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={salesData.sales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Click on a kiosk to view sales performance
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Water Trucks */}
      {trucksData && trucksData.data?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Water Truck Fleet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Truck No</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Capacity (L)</TableHead>
                  <TableHead className="text-right">Trips Today</TableHead>
                  <TableHead className="text-right">Revenue Today</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trucksData.data.map((truck: any) => (
                  <TableRow key={truck.id}>
                    <TableCell className="font-mono">{truck.truck_no}</TableCell>
                    <TableCell>{truck.driver_name}</TableCell>
                    <TableCell>{truck.phone}</TableCell>
                    <TableCell>
                      <Badge className={truck.status === 'in_transit' ? 'bg-blue-600' : 'bg-green-600'}>
                        {truck.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{truck.capacity.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{truck.trips_today}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(truck.revenue_today)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
