import { useState, useEffect } from 'react';
import { useCreateSource, useUpdateSource } from '../../hooks/useHydromet';
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
import { toast } from 'sonner';
import type { Source, CreateSourceData } from '../../services/hydromet.service';

interface SourceFormDialogProps {
  open: boolean;
  onClose: () => void;
  source: Source | null;
  isCreating: boolean;
}

export function SourceFormDialog({ open, onClose, source, isCreating }: SourceFormDialogProps) {
  const createMutation = useCreateSource();
  const updateMutation = useUpdateSource();

  const [formData, setFormData] = useState<Partial<CreateSourceData>>({
    name: '',
    code: '',
    kind_id: undefined,
    status_id: undefined,
    catchment: '',
    elevation_m: undefined,
    depth_m: undefined,
    capacity_m3_per_day: undefined,
    permit_no: '',
    latitude: undefined,
    longitude: undefined,
  });

  useEffect(() => {
    if (source && !isCreating) {
      setFormData({
        name: source.name,
        code: source.code,
        kind_id: source.kind_id,
        status_id: source.status_id,
        catchment: source.catchment || '',
        elevation_m: source.elevation_m || undefined,
        depth_m: source.depth_m || undefined,
        capacity_m3_per_day: source.capacity_m3_per_day || undefined,
        permit_no: source.permit_no || '',
        latitude: source.location?.coordinates[1],
        longitude: source.location?.coordinates[0],
      });
    } else if (isCreating) {
      setFormData({
        name: '',
        code: '',
        kind_id: undefined,
        status_id: undefined,
        catchment: '',
        elevation_m: undefined,
        depth_m: undefined,
        capacity_m3_per_day: undefined,
        permit_no: '',
        latitude: undefined,
        longitude: undefined,
      });
    }
  }, [source, isCreating, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.kind_id || !formData.status_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (isCreating) {
        await createMutation.mutateAsync(formData as CreateSourceData);
        toast.success('Source created successfully');
      } else if (source) {
        await updateMutation.mutateAsync({ id: source.id, data: formData });
        toast.success('Source updated successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isCreating ? 'create' : 'update'} source`);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreating ? 'Add New Source' : 'Edit Source'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Source Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., SRC-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Source Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Kikuyu Borehole"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kind_id">Source Type *</Label>
              <Select
                value={formData.kind_id?.toString()}
                onValueChange={(value) => setFormData({ ...formData, kind_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Borehole</SelectItem>
                  <SelectItem value="2">Spring</SelectItem>
                  <SelectItem value="3">River</SelectItem>
                  <SelectItem value="4">Dam</SelectItem>
                  <SelectItem value="5">Well</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status_id">Status *</Label>
              <Select
                value={formData.status_id?.toString()}
                onValueChange={(value) => setFormData({ ...formData, status_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="2">Inactive</SelectItem>
                  <SelectItem value="3">Abandoned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="catchment">Catchment Area</Label>
            <Input
              id="catchment"
              value={formData.catchment}
              onChange={(e) => setFormData({ ...formData, catchment: e.target.value })}
              placeholder="e.g., Tana Basin"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
              <Label htmlFor="depth_m">Depth (m)</Label>
              <Input
                id="depth_m"
                type="number"
                step="0.1"
                value={formData.depth_m || ''}
                onChange={(e) => setFormData({ ...formData, depth_m: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="120"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity_m3_per_day">Capacity (m³/day)</Label>
              <Input
                id="capacity_m3_per_day"
                type="number"
                step="0.1"
                value={formData.capacity_m3_per_day || ''}
                onChange={(e) => setFormData({ ...formData, capacity_m3_per_day: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="permit_no">Permit Number</Label>
            <Input
              id="permit_no"
              value={formData.permit_no}
              onChange={(e) => setFormData({ ...formData, permit_no: e.target.value })}
              placeholder="e.g., WRUA/2023/001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={formData.latitude || ''}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="-1.286389"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={formData.longitude || ''}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="36.817223"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isCreating ? 'Create Source' : 'Update Source'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
