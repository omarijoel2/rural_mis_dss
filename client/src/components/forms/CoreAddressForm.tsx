import React from 'react';
import { useForm } from 'react-hook-form';

type Props = {
  initial?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  serverErrors?: Record<string, string[]>;
};

export function CoreAddressForm({ initial, onSubmit, onCancel, serverErrors }: Props) {
  const { register, handleSubmit } = useForm({ defaultValues: initial });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Premise Code</label>
          <input className="input" {...register('premise_code')} />
          {serverErrors?.premise_code && <p className="text-rose-600 text-sm">{serverErrors.premise_code.join(' ')}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Country</label>
          <input className="input" {...register('country')} />
          {serverErrors?.country && <p className="text-rose-600 text-sm">{serverErrors.country.join(' ')}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Street</label>
        <input className="input" {...register('street')} />
        {serverErrors?.street && <p className="text-rose-600 text-sm">{serverErrors.street.join(' ')}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Village</label>
          <input className="input" {...register('village')} />
          {serverErrors?.village && <p className="text-rose-600 text-sm">{serverErrors.village.join(' ')}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Ward</label>
          <input className="input" {...register('ward')} />
          {serverErrors?.ward && <p className="text-rose-600 text-sm">{serverErrors.ward.join(' ')}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">City</label>
          <input className="input" {...register('city')} />
          {serverErrors?.city && <p className="text-rose-600 text-sm">{serverErrors.city.join(' ')}</p>}
        </div>
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

export default CoreAddressForm;
