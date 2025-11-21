import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Plus, Zap, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function EnergyTariffSetup() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    valid_from: '',
    valid_to: '',
    peak_rate: '',
    offpeak_rate: '',
    demand_charge: '',
    currency: 'KES',
  });

  const queryClient = useQueryClient();

  const { data: tariffs } = useQuery({
    queryKey: ['energy-tariffs'],
    queryFn: async () => {
      const res = await fetch('/api/v1/costing/energy/tariffs');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/v1/costing/energy/tariffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create tariff');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energy-tariffs'] });
      setOpen(false);
      setFormData({
        name: '',
        valid_from: '',
        valid_to: '',
        peak_rate: '',
        offpeak_rate: '',
        demand_charge: '',
        currency: 'KES',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const isActive = (tariff: any) => {
    const now = new Date();
    const validFrom = new Date(tariff.valid_from);
    const validTo = tariff.valid_to ? new Date(tariff.valid_to) : null;
    return validFrom <= now && (!validTo || validTo >= now);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Energy Tariff Setup</h1>
          <p className="text-muted-foreground mt-1">
            Manage utility tariff rates for energy cost calculations
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Tariff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Energy Tariff</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Tariff Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., KPLC Industrial Rate 2025"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valid_from">Valid From *</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valid_to">Valid To</Label>
                  <Input
                    id="valid_to"
                    type="date"
                    value={formData.valid_to}
                    onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="peak_rate">Peak Rate (per kWh) *</Label>
                  <Input
                    id="peak_rate"
                    type="number"
                    step="0.0001"
                    value={formData.peak_rate}
                    onChange={(e) => setFormData({ ...formData, peak_rate: e.target.value })}
                    placeholder="15.80"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="offpeak_rate">Off-Peak Rate (per kWh) *</Label>
                  <Input
                    id="offpeak_rate"
                    type="number"
                    step="0.0001"
                    value={formData.offpeak_rate}
                    onChange={(e) => setFormData({ ...formData, offpeak_rate: e.target.value })}
                    placeholder="8.50"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="demand_charge">Demand Charge (per kVA)</Label>
                  <Input
                    id="demand_charge"
                    type="number"
                    step="0.0001"
                    value={formData.demand_charge}
                    onChange={(e) => setFormData({ ...formData, demand_charge: e.target.value })}
                    placeholder="450.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="KES"
                    maxLength={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Tariff'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Tariff Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tariff Name</TableHead>
                <TableHead>Peak Rate</TableHead>
                <TableHead>Off-Peak Rate</TableHead>
                <TableHead>Demand Charge</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tariffs?.data && tariffs.data.length > 0 ? (
                tariffs.data.map((tariff: any) => (
                  <TableRow key={tariff.id}>
                    <TableCell className="font-medium">{tariff.name}</TableCell>
                    <TableCell>{tariff.currency} {parseFloat(tariff.peak_rate).toFixed(2)}/kWh</TableCell>
                    <TableCell>{tariff.currency} {parseFloat(tariff.offpeak_rate).toFixed(2)}/kWh</TableCell>
                    <TableCell>
                      {tariff.demand_charge ? `${tariff.currency} ${parseFloat(tariff.demand_charge).toFixed(2)}/kVA` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(tariff.valid_from).toLocaleDateString()}
                        {tariff.valid_to && ` - ${new Date(tariff.valid_to).toLocaleDateString()}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isActive(tariff) ? (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No tariffs configured yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
