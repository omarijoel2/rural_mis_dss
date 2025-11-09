import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

interface PlanFormData {
  name: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: any;
}

export function PlanFormDialog({ open, onOpenChange, plan }: PlanFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!plan;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PlanFormData>({
    defaultValues: plan || {
      frequency: 'monthly',
      is_active: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: PlanFormData) => apiClient.post('/v1/water-quality/plans', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-quality-plans'] });
      toast.success('Sampling plan created successfully');
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create plan');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PlanFormData) => apiClient.patch(`/v1/water-quality/plans/${plan.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-quality-plans'] });
      toast.success('Sampling plan updated successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update plan');
    },
  });

  const onSubmit = (data: PlanFormData) => {
    const payload = {
      ...data,
      end_date: data.end_date || undefined,
    };
    
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  useEffect(() => {
    if (plan) {
      reset({
        ...plan,
        start_date: plan.start_date?.split('T')[0],
        end_date: plan.end_date?.split('T')[0],
      });
    } else {
      reset({ frequency: 'monthly', is_active: false });
    }
  }, [plan, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update sampling plan details' : 'Create a new water quality sampling plan'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              {...register('name', { required: true })}
              placeholder="e.g., Q1 2024 Monitoring"
            />
            {errors.name && <p className="text-sm text-red-500">Required</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Sampling Frequency *</Label>
            <Select
              onValueChange={(value) => setValue('frequency', value)}
              defaultValue={plan?.frequency || 'monthly'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date', { required: true })}
              />
              {errors.start_date && <p className="text-sm text-red-500">Required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
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
              Activate plan immediately
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
