import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  step?: string;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  error,
  step,
}: FormInputProps<T>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, ...field } }) => (
          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            step={step}
            className={error ? 'border-red-500' : ''}
            value={value ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              if (type === 'number') {
                // Let user type freely, convert on blur
                onChange(val === '' ? undefined : val);
              } else {
                onChange(val);
              }
            }}
            onBlur={(e) => {
              if (type === 'number' && e.target.value !== '') {
                // Convert to number on blur
                const num = parseFloat(e.target.value);
                onChange(isNaN(num) ? e.target.value : num);
              }
              field.onBlur();
            }}
          />
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
