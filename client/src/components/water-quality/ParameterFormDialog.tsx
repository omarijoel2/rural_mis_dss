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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface ParameterFormData {
  name: string;
  code: string;
  category: string;
  unit: string;
  who_limit?: number;
  wasreb_limit?: number;
  local_limit?: number;
  lod?: number;
  precision?: number;
}

interface ParameterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parameter?: any;
}

export function ParameterFormDialog({ open, onOpenChange, parameter }: ParameterFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!parameter;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ParameterFormData>({
    defaultValues: parameter || {
      category: 'physical',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ParameterFormData) => apiClient.post('/water-quality/parameters', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-quality-parameters'] });
      toast.success('Parameter created successfully');
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create parameter');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ParameterFormData) => apiClient.patch(`/water-quality/parameters/${parameter.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-quality-parameters'] });
      toast.success('Parameter updated successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update parameter');
    },
  });

  const onSubmit = (data: ParameterFormData) => {
    const payload = {
      ...data,
      who_limit: data.who_limit || undefined,
      wasreb_limit: data.wasreb_limit || undefined,
      local_limit: data.local_limit || undefined,
      lod: data.lod || undefined,
      precision: data.precision || undefined,
    };
    
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  useEffect(() => {
    if (parameter) {
      reset(parameter);
    } else {
      reset({ category: 'physical' });
    }
  }, [parameter, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Parameter' : 'Create New Parameter'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update water quality parameter' : 'Add a new water quality parameter'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Parameter Name *</Label>
              <Input
                id="name"
                {...register('name', { required: true })}
                placeholder="e.g., pH"
              />
              {errors.name && <p className="text-sm text-red-500">Required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                {...register('code', { required: true })}
                placeholder="e.g., PH"
              />
              {errors.code && <p className="text-sm text-red-500">Required</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                onValueChange={(value) => setValue('category', value)}
                defaultValue={parameter?.category || 'physical'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical</SelectItem>
                  <SelectItem value="chemical">Chemical</SelectItem>
                  <SelectItem value="biological">Biological</SelectItem>
                  <SelectItem value="radiological">Radiological</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                {...register('unit', { required: true })}
                placeholder="e.g., mg/L, CFU/100mL, pH units"
              />
              {errors.unit && <p className="text-sm text-red-500">Required</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="who_limit">WHO Limit</Label>
              <Input
                id="who_limit"
                type="number"
                step="any"
                {...register('who_limit')}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wasreb_limit">WASREB Limit</Label>
              <Input
                id="wasreb_limit"
                type="number"
                step="any"
                {...register('wasreb_limit')}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="local_limit">Local Limit</Label>
              <Input
                id="local_limit"
                type="number"
                step="any"
                {...register('local_limit')}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lod">Limit of Detection (LOD)</Label>
              <Input
                id="lod"
                type="number"
                step="any"
                {...register('lod')}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precision">Precision</Label>
              <Input
                id="precision"
                type="number"
                step="1"
                {...register('precision')}
                placeholder="Decimal places (e.g., 2)"
              />
            </div>
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
