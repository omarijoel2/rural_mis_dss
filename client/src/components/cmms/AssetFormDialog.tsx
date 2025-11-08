import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assetService } from '../../services/asset.service';
import { Asset, CreateAssetDto } from '../../types/cmms';
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
import { toast } from 'sonner';

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset;
}

export function AssetFormDialog({ open, onOpenChange, asset }: AssetFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!asset;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateAssetDto>({
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

  const createMutation = useMutation({
    mutationFn: (data: CreateAssetDto) => assetService.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset created successfully');
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create asset');
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
      toast.error(error.response?.data?.message || 'Failed to update asset');
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
