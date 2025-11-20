import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface FormTextareaProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
}

export function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = false,
  error,
  rows = 3,
}: FormTextareaProps<T>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            rows={rows}
            className={error ? 'border-red-500' : ''}
            value={field.value ?? ''}
          />
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
