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

interface ReceiveSampleFormData {
  received_by: string;
  container_condition?: string;
  preservation_check?: string;
  lab_notes?: string;
}

interface ReceiveSampleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sample: any;
}

export function ReceiveSampleDialog({ open, onOpenChange, sample }: ReceiveSampleDialogProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReceiveSampleFormData>();

  const receiveMutation = useMutation({
    mutationFn: (data: ReceiveSampleFormData) => 
      apiClient.post(`/water-quality/samples/${sample.id}/receive-lab`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-quality-samples'] });
      toast.success('Sample received in lab successfully');
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to receive sample');
    },
  });

  const onSubmit = (data: ReceiveSampleFormData) => {
    receiveMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Receive Sample in Lab</DialogTitle>
          <DialogDescription>
            Record lab receipt details for {sample?.barcode}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="received_by">Received By *</Label>
            <Input
              id="received_by"
              {...register('received_by', { required: true })}
              placeholder="Lab technician name"
            />
            {errors.received_by && <p className="text-sm text-red-500">Required</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="container_condition">Container Condition</Label>
            <Input
              id="container_condition"
              {...register('container_condition')}
              placeholder="e.g., Good, Intact, No leaks"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preservation_check">Preservation Check</Label>
            <Input
              id="preservation_check"
              {...register('preservation_check')}
              placeholder="e.g., Properly preserved, Ice pack present"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lab_notes">Lab Notes</Label>
            <Textarea
              id="lab_notes"
              {...register('lab_notes')}
              placeholder="Any observations upon receipt..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={receiveMutation.isPending}>
              {receiveMutation.isPending ? 'Receiving...' : 'Receive Sample'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
