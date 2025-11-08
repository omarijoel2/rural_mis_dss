import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workOrderService } from '../../services/workOrder.service';
import { assetService } from '../../services/asset.service';
import { WorkOrder, CreateWorkOrderDto } from '../../types/cmms';
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

interface WorkOrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder?: WorkOrder;
}

export function WorkOrderFormDialog({ open, onOpenChange, workOrder }: WorkOrderFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!workOrder;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateWorkOrderDto>({
    defaultValues: workOrder ? {
      kind: workOrder.kind,
      asset_id: workOrder.asset_id || undefined,
      title: workOrder.title,
      description: workOrder.description || undefined,
      priority: workOrder.priority,
      scheduled_for: workOrder.scheduled_for || undefined,
      assigned_to: workOrder.assigned_to || undefined,
      pm_policy_id: workOrder.pm_policy_id || undefined,
    } : {
      kind: 'cm',
      priority: 'medium',
    },
  });

  const { data: assets } = useQuery({
    queryKey: ['assets-for-wo'],
    queryFn: () => assetService.getAssets({ per_page: 200 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateWorkOrderDto) => workOrderService.createWorkOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success('Work order created successfully');
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create work order');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateWorkOrderDto) => workOrderService.updateWorkOrder(workOrder!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrder!.id] });
      toast.success('Work order updated successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update work order');
    },
  });

  const onSubmit = (data: CreateWorkOrderDto) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  useEffect(() => {
    if (workOrder) {
      Object.keys(workOrder).forEach((key) => {
        setValue(key as keyof CreateWorkOrderDto, (workOrder as any)[key]);
      });
    } else {
      reset({ kind: 'cm', priority: 'medium' });
    }
  }, [workOrder, setValue, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Work Order' : 'Create New Work Order'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update work order details' : 'Schedule a new maintenance task'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kind">Type *</Label>
              <Select
                onValueChange={(value) => setValue('kind', value as any)}
                defaultValue={workOrder?.kind || 'cm'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pm">Preventive Maintenance</SelectItem>
                  <SelectItem value="cm">Corrective Maintenance</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                onValueChange={(value) => setValue('priority', value as any)}
                defaultValue={workOrder?.priority || 'medium'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset_id">Related Asset</Label>
            <Select
              onValueChange={(value) => setValue('asset_id', (value && value !== 'none') ? Number(value) : undefined)}
              defaultValue={workOrder?.asset_id?.toString() || 'none'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select asset (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {assets?.data.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id.toString()}>
                    {asset.code} - {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title', { required: true })}
              placeholder="e.g., Replace pump motor"
            />
            {errors.title && <p className="text-sm text-red-500">Required</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detailed description of the work to be done..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_for">Scheduled Date</Label>
              <Input
                id="scheduled_for"
                type="datetime-local"
                {...register('scheduled_for')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assign To (User ID)</Label>
              <Input
                id="assigned_to"
                {...register('assigned_to')}
                placeholder="User UUID"
              />
              <p className="text-xs text-muted-foreground">
                Enter user ID to assign this work order
              </p>
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
