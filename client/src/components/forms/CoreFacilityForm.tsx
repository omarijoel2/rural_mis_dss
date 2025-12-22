import React from 'react';
import { useForm } from 'react-hook-form';

type Props = {
  initial?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  serverErrors?: Record<string, string[]>;
};

export function CoreFacilityForm({ initial, onSubmit, onCancel, serverErrors }: Props) {
  const { register, handleSubmit } = useForm({ defaultValues: initial });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Code</label>
        <input className="input" {...register('code')} />
        {serverErrors?.code && <p className="text-rose-600 text-sm">{serverErrors.code.join(' ')}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input className="input" {...register('name')} />
        {serverErrors?.name && <p className="text-rose-600 text-sm">{serverErrors.name.join(' ')}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Category</label>
        <input className="input" {...register('category')} />
        {serverErrors?.category && <p className="text-rose-600 text-sm">{serverErrors.category.join(' ')}</p>}
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

export default CoreFacilityForm;
