import { useForm, FormProvider } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ChecklistBuilder } from './ChecklistBuilder';
import { toast } from 'sonner';

interface ChecklistBuilderFormProps {
  initialChecklist?: any;
  onSuccess?: () => void;
}

export function ChecklistBuilderForm({ initialChecklist, onSuccess }: ChecklistBuilderFormProps) {
  // Convert options arrays to newline-separated strings for textarea display
  const convertSchemaForEdit = (schema: any[]) => {
    return schema.map((q: any) => ({
      ...q,
      options: Array.isArray(q.options) ? q.options.join('\n') : (q.options || ''),
    }));
  };

  const methods = useForm({
    defaultValues: {
      title: initialChecklist?.title || '',
      frequency: initialChecklist?.frequency || '',
      schema: initialChecklist?.schema 
        ? convertSchemaForEdit(initialChecklist.schema)
        : [
          {
            question: 'Is the facility operational?',
            type: 'boolean',
            required: true,
            options: '',
          },
        ],
    },
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (initialChecklist) {
        return coreOpsService.checklists.update(initialChecklist.id, data);
      }
      return coreOpsService.checklists.create(data);
    },
    onSuccess: () => {
      toast.success(initialChecklist ? 'Checklist updated' : 'Checklist created');
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: any) => {
    if (!data.schema || data.schema.length === 0) {
      toast.error('Add at least one question');
      return;
    }

    // Validate all questions have text
    const hasEmptyQuestions = data.schema.some((q: any) => !q.question?.trim());
    if (hasEmptyQuestions) {
      toast.error('All questions must have text');
      return;
    }

    // Convert options string to array for choice type
    const processedSchema = data.schema.map((q: any) => {
      let options: string[] = [];
      if (q.type === 'choice' && q.options) {
        options = Array.isArray(q.options) 
          ? q.options.filter((o: string) => o?.trim())
          : q.options.split('\n').filter((o: string) => o.trim());
      }
      return { ...q, options };
    });

    mutation.mutate({
      ...data,
      schema: processedSchema,
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        {/* Checklist Name */}
        <div className="space-y-2">
          <Label htmlFor="title">Checklist Title</Label>
          <Input
            id="title"
            placeholder="e.g., Daily Facility Inspection"
            {...methods.register('title', { required: 'Title is required' })}
          />
          {methods.formState.errors.title && (
            <p className="text-sm text-red-500">{(methods.formState.errors.title as any).message}</p>
          )}
        </div>

        {/* Frequency */}
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency (Optional)</Label>
          <select
            id="frequency"
            {...methods.register('frequency')}
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">No specific frequency</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="shift_start">At shift start</option>
            <option value="shift_end">At shift end</option>
            <option value="on_demand">On demand</option>
          </select>
        </div>

        {/* Questions Builder */}
        <ChecklistBuilder />

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? 'Saving...' : initialChecklist ? 'Update Checklist' : 'Create Checklist'}
        </Button>
      </form>
    </FormProvider>
  );
}
