import { useState } from 'react';
import { useStationSensors, useCreateSensor, useDeleteSensor } from '../../hooks/useHydromet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Plus, Trash2, Radio } from 'lucide-react';
import { toast } from 'sonner';
import type { HydrometStation, CreateSensorData } from '../../services/hydromet.service';

interface SensorManagementDialogProps {
  station: HydrometStation | null;
  onClose: () => void;
}

export function SensorManagementDialog({ station, onClose }: SensorManagementDialogProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSensor, setNewSensor] = useState<Partial<CreateSensorData>>({
    parameter_id: undefined,
    make: '',
    model: '',
    serial_number: '',
  });

  const { data: sensors, isLoading } = useStationSensors(station?.id || null);
  const createMutation = useCreateSensor();
  const deleteMutation = useDeleteSensor();

  const handleAddSensor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!station || !newSensor.parameter_id) {
      toast.error('Please select a parameter');
      return;
    }

    try {
      await createMutation.mutateAsync({
        stationId: station.id,
        data: newSensor as CreateSensorData,
      });
      toast.success('Sensor added successfully');
      setIsAddingNew(false);
      setNewSensor({
        parameter_id: undefined,
        make: '',
        model: '',
        serial_number: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add sensor');
    }
  };

  const handleDeleteSensor = async (sensorId: number) => {
    if (!station) return;

    if (!window.confirm('Are you sure you want to delete this sensor?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ stationId: station.id, sensorId });
      toast.success('Sensor deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete sensor');
    }
  };

  const isPending = createMutation.isPending;

  return (
    <Dialog open={station !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Manage Sensors - {station?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading sensors...</p>
          ) : sensors && sensors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Make</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Installed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sensors.map((sensor) => (
                  <TableRow key={sensor.id}>
                    <TableCell className="font-medium">
                      Parameter #{sensor.parameter_id}
                    </TableCell>
                    <TableCell>{sensor.make || 'N/A'}</TableCell>
                    <TableCell>{sensor.model || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {sensor.serial_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sensor.active ? 'default' : 'secondary'}>
                        {sensor.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sensor.installed_at
                        ? new Date(sensor.installed_at).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSensor(sensor.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Radio className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No sensors configured</p>
            </div>
          )}

          {!isAddingNew ? (
            <Button onClick={() => setIsAddingNew(true)} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Sensor
            </Button>
          ) : (
            <form onSubmit={handleAddSensor} className="space-y-4 border rounded-lg p-4">
              <h3 className="font-semibold">Add New Sensor</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parameter_id">Parameter *</Label>
                  <Select
                    value={newSensor.parameter_id?.toString()}
                    onValueChange={(value) =>
                      setNewSensor({ ...newSensor, parameter_id: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parameter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Temperature</SelectItem>
                      <SelectItem value="2">Rainfall</SelectItem>
                      <SelectItem value="3">Water Level</SelectItem>
                      <SelectItem value="4">Flow Rate</SelectItem>
                      <SelectItem value="5">Humidity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    value={newSensor.make}
                    onChange={(e) => setNewSensor({ ...newSensor, make: e.target.value })}
                    placeholder="e.g., Campbell Scientific"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={newSensor.model}
                    onChange={(e) => setNewSensor({ ...newSensor, model: e.target.value })}
                    placeholder="e.g., CS215"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input
                    id="serial_number"
                    value={newSensor.serial_number}
                    onChange={(e) =>
                      setNewSensor({ ...newSensor, serial_number: e.target.value })
                    }
                    placeholder="e.g., SN12345"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Adding...' : 'Add Sensor'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewSensor({
                      parameter_id: undefined,
                      make: '',
                      model: '',
                      serial_number: '',
                    });
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
