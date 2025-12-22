import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assetService } from '../../services/asset.service';
import { applyServerErrors } from '@/lib/formErrors';
import { Asset, CreateAssetDto } from '../../types/cmms';
import { apiClient } from '../../lib/api-client';
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
import { Alert, AlertDescription } from '../ui/alert';
import { Info } from 'lucide-react';
import { toast } from 'sonner';

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset;
}

export function AssetFormDialog({ open, onOpenChange, asset }: AssetFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!asset;

  const { register, handleSubmit, reset, setValue, watch, setError, formState: { errors } } = useForm<CreateAssetDto>({
    defaultValues: asset ? {
      class_id: asset.class_id,
      parent_id: asset.parent_id || undefined,
      scheme_id: asset.scheme_id || undefined,
      dma_id: asset.dma_id || undefined,
      code: asset.code,
      name: asset.name,
      status: asset.status,
      manufacturer: asset.manufacturer || undefined,
      model: asset.model || undefined,
      serial: asset.serial || undefined,
      install_date: asset.install_date || undefined,
      barcode: asset.barcode || undefined,
    } : {
      status: 'active',
    },
  });

  const { data: classes } = useQuery({
    queryKey: ['asset-classes'],
    queryFn: () => assetService.getClasses(),
  });

  const { data: assets } = useQuery({
    queryKey: ['assets-for-parent'],
    queryFn: () => assetService.getAssets({ per_page: 200 }),
  });

  const { data: sources } = useQuery({
    queryKey: ['sources-for-assets'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<any>('/sources', { per_page: 200 });
        const items = response?.data?.data || response?.data || [];
        return Array.isArray(items) ? items : [];
      } catch {
        return [];
      }
    },
  });

  const { data: kiosks } = useQuery({
    queryKey: ['kiosks-for-assets'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<any>('/crm/kiosks', { per_page: 200 });
        const items = response?.data?.data || response?.data || [];
        return Array.isArray(items) ? items : [];
      } catch {
        return [];
      }
    },
  });

  const selectedClassCode = watch('class_id') ? classes?.find((c: any) => c.id === watch('class_id'))?.code : null;
  const isBorehole = selectedClassCode === 'BOREHOLE';
  const isKiosk = selectedClassCode === 'KIOSK';

  const createMutation = useMutation({
    mutationFn: (data: CreateAssetDto) => assetService.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset created successfully');
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      const errorsPayload = error?.payload?.errors || error?.response?.data?.errors;
      if (errorsPayload) {
        applyServerErrors(setError, errorsPayload);
        const first = Object.keys(errorsPayload)[0];
        setTimeout(() => {
          const el = document.querySelector(`[name="${first}"]`);
          if (el && (el as HTMLElement).scrollIntoView) {
            (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
            (el as any).focus?.();
          }
        }, 200);
      } else {
        toast.error(error.response?.data?.message || 'Failed to create asset');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateAssetDto) => assetService.updateAsset(asset!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', asset!.id] });
      toast.success('Asset updated successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      const errorsPayload = error?.payload?.errors || error?.response?.data?.errors;
      if (errorsPayload) {
        applyServerErrors(setError, errorsPayload);
        const first = Object.keys(errorsPayload)[0];
        setTimeout(() => {
          const el = document.querySelector(`[name="${first}"]`);
          if (el && (el as HTMLElement).scrollIntoView) {
            (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
            (el as any).focus?.();
          }
        }, 200);
      } else {
        toast.error(error.response?.data?.message || 'Failed to update asset');
      }
    },
  });

  const onSubmit = (data: CreateAssetDto) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  useEffect(() => {
    if (asset) {
      Object.keys(asset).forEach((key) => {
        setValue(key as keyof CreateAssetDto, (asset as any)[key]);
      });
    } else {
      reset({ status: 'active' });
    }
  }, [asset, setValue, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Asset' : 'Create New Asset'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update asset information' : 'Add a new asset to the registry'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class_id">Asset Class *</Label>
              <Select
                onValueChange={(value) => setValue('class_id', Number(value))}
                defaultValue={asset?.class_id?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.class_id && <p className="text-sm text-red-500">Required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent Asset</Label>
              <Select
                onValueChange={(value) => setValue('parent_id', (value && value !== 'none') ? Number(value) : undefined)}
                defaultValue={asset?.parent_id?.toString() || 'none'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {assets?.data.filter(a => a.id !== asset?.id).map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.code} - {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Asset Code *</Label>
              <Input
                id="code"
                {...register('code', { required: true })}
                placeholder="e.g., PUMP-001"
              />
              {errors.code && <p className="text-sm text-red-500">Required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                {...register('name', { required: true })}
                placeholder="e.g., Main Borehole Pump"
              />
              {errors.name && <p className="text-sm text-red-500">Required</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              onValueChange={(value) => setValue('status', value as any)}
              defaultValue={asset?.status || 'active'}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" {...register('manufacturer')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" {...register('model')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial">Serial Number</Label>
              <Input id="serial" {...register('serial')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="install_date">Installation Date</Label>
              <Input
                id="install_date"
                type="date"
                {...register('install_date')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" {...register('barcode')} />
            </div>
          </div>

          {isBorehole && (
            <div className="space-y-2">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Link this asset to a water source from the Hydro-Met module to track abstraction and water quality data.
                </AlertDescription>
              </Alert>
              <Label htmlFor="source_id">Linked Water Source</Label>
              <Select
                onValueChange={(value) => setValue('source_id', value && value !== 'none' ? Number(value) : undefined)}
                defaultValue={asset?.source_id?.toString() || 'none'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select water source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {sources?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.code} - {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isKiosk && (
            <div className="space-y-2">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Link this asset to a kiosk from the Customer module to track sales, vendor, and revenue data.
                </AlertDescription>
              </Alert>
              <Label htmlFor="kiosk_id">Linked Kiosk</Label>
              <Select
                onValueChange={(value) => setValue('kiosk_id', value && value !== 'none' ? Number(value) : undefined)}
                defaultValue={asset?.kiosk_id?.toString() || 'none'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select kiosk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {kiosks?.map((k: any) => (
                    <SelectItem key={k.id} value={k.id.toString()}>
                      {k.kiosk_code} - {k.vendor_name} {k.location ? `(${k.location})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
