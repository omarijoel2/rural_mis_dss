import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fleetService } from '../../services/cmms.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
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
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Truck, Wrench, Fuel, TrendingUp, Plus, AlertTriangle } from 'lucide-react';
import type { FleetAsset } from '../../types/cmms';
import { toast } from 'sonner';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  retired: 'bg-gray-100 text-gray-800',
};

export function FleetPage() {
  const [filters, setFilters] = useState({ page: 1, per_page: 15, status: '' });
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [fuelDialogOpen, setFuelDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetAsset | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['fleet-assets', filters],
    queryFn: () => fleetService.getFleetAssets(filters),
  });

  const { data: utilization } = useQuery({
    queryKey: ['fleet-utilization'],
    queryFn: () => fleetService.getUtilization({}),
  });

  const serviceLogMutation = useMutation({
    mutationFn: fleetService.logService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleet-assets'] });
      queryClient.invalidateQueries({ queryKey: ['fleet-utilization'] });
      setServiceDialogOpen(false);
      toast.success('Service logged successfully');
    },
    onError: () => toast.error('Failed to log service'),
  });

  const fuelLogMutation = useMutation({
    mutationFn: fleetService.logFuel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleet-assets'] });
      setFuelDialogOpen(false);
      toast.success('Fuel logged successfully');
    },
    onError: () => toast.error('Failed to log fuel'),
  });

  const handleLogService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedVehicle) {
      toast.error('No vehicle selected');
      return;
    }
    const formData = new FormData(e.currentTarget);
    const cost = parseFloat(formData.get('cost') as string);
    const odometerReadingStr = formData.get('odometer_reading') as string;
    
    if (isNaN(cost)) {
      toast.error('Please enter a valid cost');
      e.currentTarget.reset();
      return;
    }
    
    const data: any = {
      fleet_asset_id: selectedVehicle.id,
      service_type: formData.get('service_type') as string,
      performed_at: new Date().toISOString(),
      notes: formData.get('notes') as string,
      cost,
    };
    
    if (odometerReadingStr && odometerReadingStr.trim()) {
      const odometerReading = parseFloat(odometerReadingStr);
      if (!isNaN(odometerReading)) {
        data.odometer_reading = odometerReading;
      }
    }
    
    serviceLogMutation.mutate(data);
  };

  const handleLogFuel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedVehicle) {
      toast.error('No vehicle selected');
      return;
    }
    const formData = new FormData(e.currentTarget);
    const liters = parseFloat(formData.get('liters') as string);
    const cost = parseFloat(formData.get('cost') as string);
    const odometerReading = parseFloat(formData.get('odometer_reading') as string);
    
    if (isNaN(liters) || isNaN(cost) || isNaN(odometerReading)) {
      toast.error('Please enter valid numeric values');
      e.currentTarget.reset();
      return;
    }
    
    const data = {
      fleet_asset_id: selectedVehicle.id,
      liters,
      cost,
      odometer_reading: odometerReading,
      filled_at: new Date().toISOString(),
    };
    fuelLogMutation.mutate(data);
  };

  const activeCount = data?.data?.filter(v => v.status === 'active').length || 0;
  const maintenanceCount = data?.data?.filter(v => v.status === 'maintenance').length || 0;

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Failed to load fleet data</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fleet Management</h1>
        <p className="text-muted-foreground">Vehicles, generators, and mobile equipment</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Total Fleet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Registered assets</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground">In service</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wrench className="h-4 w-4 text-yellow-600" />
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{maintenanceCount}</div>
            <p className="text-xs text-muted-foreground">Under repair</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Avg Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {utilization && utilization.length > 0
                ? (utilization.reduce((sum: number, u: any) => sum + (u.utilization_pct || 0), 0) / utilization.length).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Fleet uptime</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fleet Assets</CardTitle>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No fleet assets registered
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Make/Model</TableHead>
                  <TableHead>Odometer</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-mono font-medium">
                      {vehicle.registration}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vehicle.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {vehicle.make} {vehicle.model}
                    </TableCell>
                    <TableCell>
                      {vehicle.odometer ? `${vehicle.odometer.toLocaleString()} km` : '—'}
                    </TableCell>
                    <TableCell>{vehicle.operator?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[vehicle.status]}>
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setServiceDialogOpen(true);
                          }}
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setFuelDialogOpen(true);
                          }}
                        >
                          <Fuel className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Service: {selectedVehicle?.registration}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogService} className="space-y-4">
            <div>
              <Label htmlFor="service_type">Service Type</Label>
              <Select name="service_type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost">Cost</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="odometer_reading">Odometer (km)</Label>
                <Input
                  id="odometer_reading"
                  name="odometer_reading"
                  type="number"
                  step="1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setServiceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={serviceLogMutation.isPending}>
                Log Service
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={fuelDialogOpen} onOpenChange={setFuelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Fuel: {selectedVehicle?.registration}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogFuel} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="liters">Liters</Label>
                <Input
                  id="liters"
                  name="liters"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cost">Cost</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="odometer_reading">Odometer (km)</Label>
              <Input
                id="odometer_reading"
                name="odometer_reading"
                type="number"
                step="1"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFuelDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={fuelLogMutation.isPending}>
                Log Fuel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
