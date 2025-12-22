import React from 'react';
import { useForm } from 'react-hook-form';

type Props = {
  initial?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  serverErrors?: Record<string, string[]>;
};

export function CoreMeterForm({ initial, onSubmit, onCancel, serverErrors }: Props) {
  const { register, handleSubmit } = useForm({ defaultValues: initial });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Serial</label>
        <input className="input" {...register('serial')} />
        {serverErrors?.serial && <p className="text-rose-600 text-sm">{serverErrors.serial.join(' ')}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Asset ID</label>
        <input className="input" {...register('asset_id')} />
        {serverErrors?.asset_id && <p className="text-rose-600 text-sm">{serverErrors.asset_id.join(' ')}</p>}
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

export default CoreMeterForm;
