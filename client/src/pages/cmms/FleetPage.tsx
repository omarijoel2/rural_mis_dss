import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { fleetService } from '../../services/cmms.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
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
} from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Truck, Wrench, Fuel, TrendingUp, AlertTriangle } from 'lucide-react';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FormTextarea } from '../../components/forms/FormTextarea';
import type { FleetAsset } from '../../types/cmms';
import { toast } from 'sonner';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  retired: 'bg-gray-100 text-gray-800',
};

const serviceSchema = z.object({
  service_type: z.string().min(1, 'Service type is required'),
  cost: z.number().positive('Cost must be positive'),
  odometer_reading: z.number().optional(),
  notes: z.string().optional(),
});

const fuelSchema = z.object({
  liters: z.number().positive('Liters must be positive'),
  cost: z.number().positive('Cost must be positive'),
  odometer_reading: z.number().positive('Odometer reading is required'),
});

type ServiceFormData = z.infer<typeof serviceSchema>;
type FuelFormData = z.infer<typeof fuelSchema>;

export function FleetPage() {
  const [filters, setFilters] = useState({ page: 1, per_page: 15, status: '' });
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [fuelDialogOpen, setFuelDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetAsset | null>(null);
  const queryClient = useQueryClient();

  const serviceForm = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      service_type: '',
      cost: 0,
      notes: '',
    },
  });

  const fuelForm = useForm<FuelFormData>({
    resolver: zodResolver(fuelSchema),
    defaultValues: {
      liters: 0,
      cost: 0,
      odometer_reading: 0,
    },
  });

  useEffect(() => {
    if (!serviceDialogOpen) {
      serviceForm.reset();
      setSelectedVehicle(null);
    }
  }, [serviceDialogOpen, serviceForm]);

  useEffect(() => {
    if (!fuelDialogOpen) {
      fuelForm.reset();
      setSelectedVehicle(null);
    }
  }, [fuelDialogOpen, fuelForm]);

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

  const handleLogService = (data: ServiceFormData) => {
    if (!selectedVehicle) {
      toast.error('No vehicle selected');
      return;
    }

    serviceLogMutation.mutate({
      fleet_asset_id: selectedVehicle.id,
      service_type: data.service_type,
      performed_at: new Date().toISOString(),
      notes: data.notes || '',
      cost: data.cost,
      odometer_reading: data.odometer_reading,
    });
  };

  const handleLogFuel = (data: FuelFormData) => {
    if (!selectedVehicle) {
      toast.error('No vehicle selected');
      return;
    }

    fuelLogMutation.mutate({
      fleet_asset_id: selectedVehicle.id,
      liters: data.liters,
      cost: data.cost,
      odometer_reading: data.odometer_reading,
      filled_at: new Date().toISOString(),
    });
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
          <form onSubmit={serviceForm.handleSubmit(handleLogService)} className="space-y-4">
            <FormSelect
              control={serviceForm.control}
              name="service_type"
              label="Service Type"
              required
              options={[
                { value: 'routine', label: 'Routine Maintenance' },
                { value: 'repair', label: 'Repair' },
                { value: 'inspection', label: 'Inspection' },
                { value: 'other', label: 'Other' },
              ]}
              error={serviceForm.formState.errors.service_type?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={serviceForm.control}
                name="cost"
                label="Cost"
                type="number"
                step="0.01"
                required
                error={serviceForm.formState.errors.cost?.message}
              />
              <FormInput
                control={serviceForm.control}
                name="odometer_reading"
                label="Odometer (km)"
                type="number"
                step="1"
                error={serviceForm.formState.errors.odometer_reading?.message}
              />
            </div>
            <FormTextarea
              control={serviceForm.control}
              name="notes"
              label="Notes"
              rows={3}
              error={serviceForm.formState.errors.notes?.message}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setServiceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={serviceLogMutation.isPending || !serviceForm.formState.isValid}
              >
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
          <form onSubmit={fuelForm.handleSubmit(handleLogFuel)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={fuelForm.control}
                name="liters"
                label="Liters"
                type="number"
                step="0.01"
                required
                error={fuelForm.formState.errors.liters?.message}
              />
              <FormInput
                control={fuelForm.control}
                name="cost"
                label="Cost"
                type="number"
                step="0.01"
                required
                error={fuelForm.formState.errors.cost?.message}
              />
            </div>
            <FormInput
              control={fuelForm.control}
              name="odometer_reading"
              label="Odometer (km)"
              type="number"
              step="1"
              required
              error={fuelForm.formState.errors.odometer_reading?.message}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFuelDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={fuelLogMutation.isPending || !fuelForm.formState.isValid}
              >
                Log Fuel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
