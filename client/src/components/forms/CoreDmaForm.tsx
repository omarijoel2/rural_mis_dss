import React from 'react';
import { useForm } from 'react-hook-form';

type Props = {
  initial?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
};

export function CoreDmaForm({ initial, onSubmit, onCancel }: Props) {
  const { register, handleSubmit } = useForm({ defaultValues: initial });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Code</label>
        <input className="input" {...register('code')} />
      </div>
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input className="input" {...register('name')} />
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  );
}

export default CoreDmaForm;
