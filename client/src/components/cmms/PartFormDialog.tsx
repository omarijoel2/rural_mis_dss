import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { partService } from '../../services/part.service';
import { applyServerErrors } from '@/lib/formErrors';
import { Part, CreatePartDto } from '../../types/cmms';
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
import { toast } from 'sonner';

interface PartFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part?: Part;
}

export function PartFormDialog({ open, onOpenChange, part }: PartFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!part;

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<CreatePartDto>({
    defaultValues: part ? {
      code: part.code,
      name: part.name,
      category: part.category,
      description: part.description || undefined,
      unit: part.unit,
      unit_cost: part.unit_cost || undefined,
      reorder_level: part.reorder_level || undefined,
      supplier_id: part.supplier_id || undefined,
    } : {},
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePartDto) => partService.createPart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('Part created successfully');
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
        toast.error(error.response?.data?.message || 'Failed to create part');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreatePartDto) => partService.updatePart(part!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      queryClient.invalidateQueries({ queryKey: ['part', part!.id] });
      toast.success('Part updated successfully');
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
        toast.error(error.response?.data?.message || 'Failed to update part');
      }
    },
  });

  const onSubmit = (data: CreatePartDto) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  useEffect(() => {
    if (part) {
      reset({
        code: part.code,
        name: part.name,
        category: part.category,
        description: part.description || undefined,
        unit: part.unit,
        unit_cost: part.unit_cost || undefined,
        reorder_level: part.reorder_level || undefined,
        supplier_id: part.supplier_id || undefined,
      });
    } else {
      reset({});
    }
  }, [part, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Part' : 'Create New Part'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update part information' : 'Add a new part to inventory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Part Code *</Label>
              <Input
                id="code"
                {...register('code', { required: true })}
                placeholder="e.g., PIPE-100MM"
              />
              {errors.code && <p className="text-sm text-red-500">Required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                {...register('category', { required: true })}
                placeholder="e.g., Pipes, Fittings, Valves"
              />
              {errors.category && <p className="text-sm text-red-500">Required</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Part Name *</Label>
            <Input
              id="name"
              {...register('name', { required: true })}
              placeholder="e.g., PVC Pipe 100mm x 6m"
            />
            {errors.name && <p className="text-sm text-red-500">Required</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Part description and specifications..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                {...register('unit', { required: true })}
                placeholder="e.g., pcs, m, kg"
              />
              {errors.unit && <p className="text-sm text-red-500">Required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_cost">Unit Cost</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                {...register('unit_cost', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level</Label>
              <Input
                id="reorder_level"
                type="number"
                {...register('reorder_level', { valueAsNumber: true })}
                placeholder="Minimum stock"
              />
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
