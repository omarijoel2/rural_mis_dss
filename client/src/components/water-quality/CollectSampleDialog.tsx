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
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface CollectSampleFormData {
  collected_by: string;
  field_temp?: number;
  field_ph?: number;
  field_chlorine?: number;
  field_notes?: string;
}

interface CollectSampleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sample: any;
}

export function CollectSampleDialog({ open, onOpenChange, sample }: CollectSampleDialogProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CollectSampleFormData>();

  const collectMutation = useMutation({
    mutationFn: (data: CollectSampleFormData) => 
      apiClient.post(`/water-quality/samples/${sample.id}/collect`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-quality-samples'] });
      toast.success('Sample collected successfully');
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to collect sample');
    },
  });

  const onSubmit = (data: CollectSampleFormData) => {
    collectMutation.mutate({
      ...data,
      field_temp: data.field_temp ? parseFloat(data.field_temp as any) : undefined,
      field_ph: data.field_ph ? parseFloat(data.field_ph as any) : undefined,
      field_chlorine: data.field_chlorine ? parseFloat(data.field_chlorine as any) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Collect Sample</DialogTitle>
          <DialogDescription>
            Record field collection details for {sample?.barcode}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collected_by">Collected By *</Label>
            <Input
              id="collected_by"
              {...register('collected_by', { required: true })}
              placeholder="Field officer name"
            />
            {errors.collected_by && <p className="text-sm text-red-500">Required</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field_temp">Temp (°C)</Label>
              <Input
                id="field_temp"
                type="number"
                step="0.1"
                {...register('field_temp')}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field_ph">pH</Label>
              <Input
                id="field_ph"
                type="number"
                step="0.1"
                {...register('field_ph')}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field_chlorine">Cl₂ (mg/L)</Label>
              <Input
                id="field_chlorine"
                type="number"
                step="0.01"
                {...register('field_chlorine')}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field_notes">Field Notes</Label>
            <Textarea
              id="field_notes"
              {...register('field_notes')}
              placeholder="Any observations during collection..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={collectMutation.isPending}>
              {collectMutation.isPending ? 'Collecting...' : 'Collect Sample'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
