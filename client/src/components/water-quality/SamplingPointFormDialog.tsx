import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface SamplingPointFormData {
  name: string;
  code: string;
  kind: string;
  scheme_id?: number;
  latitude: number;
  longitude: number;
  elevation_m?: number;
  is_active: boolean;
}

interface SamplingPointFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  point?: any;
}

export function SamplingPointFormDialog({ open, onOpenChange, point }: SamplingPointFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!point;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SamplingPointFormData>({
    defaultValues: point ? {
      ...point,
      latitude: point.location?.coordinates?.[1],
      longitude: point.location?.coordinates?.[0],
    } : {
      kind: 'source',
      is_active: true,
    },
  });

  const { data: schemes } = useQuery({
    queryKey: ['schemes-for-sampling-point'],
    queryFn: async () => {
      return apiClient.get<any>('/schemes', { per_page: 200 });
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/water-quality/sampling-points', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-quality-sampling-points'] });
      toast.success('Sampling point created successfully');
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create sampling point');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiClient.patch(`/water-quality/sampling-points/${point.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-quality-sampling-points'] });
      toast.success('Sampling point updated successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update sampling point');
    },
  });

  const onSubmit = (data: SamplingPointFormData) => {
    const payload = {
      name: data.name,
      code: data.code,
      kind: data.kind,
      scheme_id: data.scheme_id || undefined,
      latitude: parseFloat(data.latitude as any),
      longitude: parseFloat(data.longitude as any),
      elevation_m: data.elevation_m ? parseFloat(data.elevation_m as any) : undefined,
      is_active: data.is_active,
    };
    
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  useEffect(() => {
    if (point) {
      reset({
        ...point,
        latitude: point.location?.coordinates?.[1],
        longitude: point.location?.coordinates?.[0],
      });
    } else {
      reset({ kind: 'source', is_active: true });
    }
  }, [point, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Sampling Point' : 'Create New Sampling Point'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update sampling point information' : 'Add a new sampling point with GPS location'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Point Name *</Label>
              <Input
                id="name"
                {...register('name', { required: true })}
                placeholder="e.g., Borehole #1"
              />
              {errors.name && <p className="text-sm text-red-500">Required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                {...register('code', { required: true })}
                placeholder="e.g., BH-001"
              />
              {errors.code && <p className="text-sm text-red-500">Required</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kind">Point Kind *</Label>
              <Select
                onValueChange={(value) => setValue('kind', value)}
                defaultValue={point?.kind || 'source'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select kind" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="source">Source</SelectItem>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="reservoir">Reservoir</SelectItem>
                  <SelectItem value="distribution">Distribution</SelectItem>
                  <SelectItem value="kiosk">Kiosk</SelectItem>
                  <SelectItem value="household">Household</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheme_id">Scheme</Label>
              <Select
                onValueChange={(value) => setValue('scheme_id', (value && value !== 'none') ? Number(value) : undefined)}
                defaultValue={point?.scheme_id?.toString() || 'none'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scheme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {schemes?.data?.map((scheme: any) => (
                    <SelectItem key={scheme.id} value={scheme.id.toString()}>
                      {scheme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                {...register('latitude', { required: true })}
                placeholder="e.g., -1.2921"
              />
              {errors.latitude && <p className="text-sm text-red-500">Required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                {...register('longitude', { required: true })}
                placeholder="e.g., 36.8219"
              />
              {errors.longitude && <p className="text-sm text-red-500">Required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="elevation_m">Elevation (m)</Label>
              <Input
                id="elevation_m"
                type="number"
                step="any"
                {...register('elevation_m')}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked as boolean)}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active sampling point
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
