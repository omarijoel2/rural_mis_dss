import { useState, useEffect } from 'react';
import { useCreateStation, useUpdateStation } from '../../hooks/useHydromet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { LocationPicker } from './LocationPicker';
import type { HydrometStation, CreateStationData } from '../../services/hydromet.service';

interface StationFormDialogProps {
  open: boolean;
  onClose: () => void;
  station: HydrometStation | null;
  isCreating: boolean;
}

export function StationFormDialog({ open, onClose, station, isCreating }: StationFormDialogProps) {
  const createMutation = useCreateStation();
  const updateMutation = useUpdateStation();

  const [formData, setFormData] = useState<Partial<CreateStationData>>({
    name: '',
    code: '',
    station_type_id: undefined,
    datasource_id: 1,
    elevation_m: undefined,
    active: true,
    latitude: undefined,
    longitude: undefined,
  });

  useEffect(() => {
    if (station && !isCreating) {
      setFormData({
        name: station.name,
        code: station.code,
        station_type_id: station.station_type_id,
        datasource_id: station.datasource_id,
        elevation_m: station.elevation_m || undefined,
        active: station.active,
        latitude: station.location?.coordinates[1],
        longitude: station.location?.coordinates[0],
      });
    } else if (isCreating) {
      setFormData({
        name: '',
        code: '',
        station_type_id: undefined,
        datasource_id: 1,
        elevation_m: undefined,
        active: true,
        latitude: undefined,
        longitude: undefined,
      });
    }
  }, [station, isCreating, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.station_type_id || !formData.datasource_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (isCreating) {
        await createMutation.mutateAsync(formData as CreateStationData);
        toast.success('Station created successfully');
      } else if (station) {
        await updateMutation.mutateAsync({ id: station.id, data: formData });
        toast.success('Station updated successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isCreating ? 'create' : 'update'} station`);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreating ? 'Add New Station' : 'Edit Station'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Station Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., HMS-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Station Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Tana River Flow Station"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="station_type_id">Station Type *</Label>
              <Select
                value={formData.station_type_id?.toString()}
                onValueChange={(value) => setFormData({ ...formData, station_type_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Weather</SelectItem>
                  <SelectItem value="2">Hydrological</SelectItem>
                  <SelectItem value="3">Rain Gauge</SelectItem>
                  <SelectItem value="4">Stream Gauge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="datasource_id">Data Source *</Label>
              <Select
                value={formData.datasource_id?.toString()}
                onValueChange={(value) => setFormData({ ...formData, datasource_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Manual Reading</SelectItem>
                  <SelectItem value="2">Telemetry</SelectItem>
                  <SelectItem value="3">SCADA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="elevation_m">Elevation (m)</Label>
            <Input
              id="elevation_m"
              type="number"
              step="0.1"
              value={formData.elevation_m || ''}
              onChange={(e) => setFormData({ ...formData, elevation_m: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="1500"
            />
          </div>

          <div className="space-y-2">
            <Label>Location (PostGIS)</Label>
            <LocationPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={(lat, lon) => setFormData({ ...formData, latitude: lat, longitude: lon })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked as boolean })}
            />
            <Label htmlFor="active" className="cursor-pointer">
              Station is active
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isCreating ? 'Create Station' : 'Update Station'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
