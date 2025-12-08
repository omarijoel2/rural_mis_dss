import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface ChecklistField {
  question: string;
  type: 'boolean' | 'text' | 'number' | 'choice' | 'rating';
  required?: boolean;
  options?: string[];
}

interface ChecklistBuilderProps {
  onSchemaChange?: (schema: ChecklistField[]) => void;
}

export function ChecklistBuilder({ onSchemaChange }: ChecklistBuilderProps) {
  const { control, register, watch, formState: { errors } } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'schema',
  });

  const watchSchema = watch('schema');

  const addQuestion = () => {
    append({
      question: '',
      type: 'boolean' as const,
      required: true,
      options: '',
    });
  };

  const fieldTypes: Array<'boolean' | 'text' | 'number' | 'choice' | 'rating'> = ['boolean', 'text', 'number', 'choice', 'rating'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Checklist Questions</Label>
        <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
          <Plus className="h-4 w-4 mr-1" />
          Add Question
        </Button>
      </div>

      {fields.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <p className="text-sm">No questions yet. Click "Add Question" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <QuestionEditor
              key={field.id}
              fieldIndex={idx}
              onRemove={() => remove(idx)}
              onMove={(direction) => {
                if (direction === 'up' && idx > 0) move(idx, idx - 1);
                if (direction === 'down' && idx < fields.length - 1) move(idx, idx + 1);
              }}
              register={register}
              fieldTypes={fieldTypes}
              watch={watch}
            />
          ))}
        </div>
      )}

      {errors.schema && (
        <p className="text-sm text-red-500">{(errors.schema as any)?.message}</p>
      )}

      <div className="text-sm text-muted-foreground pt-2">
        {fields.length} question{fields.length !== 1 ? 's' : ''} in this checklist
      </div>
    </div>
  );
}

function QuestionEditor({ fieldIndex, onRemove, onMove, register, fieldTypes, watch }: { fieldIndex: number; onRemove: () => void; onMove: (direction: 'up' | 'down') => void; register: any; fieldTypes: any[]; watch: any }) {
  const questionData = watch(`schema.${fieldIndex}`);
  const [showOptions, setShowOptions] = useState(questionData?.type === 'choice');

  const optionValue = watch(`schema.${fieldIndex}.options`);
  const optionsArray = Array.isArray(optionValue) 
    ? optionValue.filter((o: string) => o?.trim()) 
    : (typeof optionValue === 'string' ? optionValue.split('\n').filter((o: string) => o.trim()) : []);

  return (
    <Card className="border bg-muted/30">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-4">
            {/* Question Text */}
            <div className="space-y-2">
              <Label htmlFor={`question-${fieldIndex}`} className="text-sm">
                Question {fieldIndex + 1}
              </Label>
              <Input
                id={`question-${fieldIndex}`}
                placeholder="Enter your question..."
                {...register(`schema.${fieldIndex}.question`, { required: 'Question is required' })}
              />
            </div>

            {/* Type & Required */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`type-${fieldIndex}`} className="text-sm">
                  Type
                </Label>
                <select
                  id={`type-${fieldIndex}`}
                  {...register(`schema.${fieldIndex}.type`)}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setShowOptions(e.target.value === 'choice');
                  }}
                  className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                >
                  {fieldTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register(`schema.${fieldIndex}.required`)}
                    className="rounded"
                  />
                  <span>Required</span>
                </Label>
              </div>
            </div>

            {/* Options for Choice Type */}
            {showOptions && (
              <div className="space-y-2">
                <Label htmlFor={`options-${fieldIndex}`} className="text-sm">
                  Options (one per line)
                </Label>
                <textarea
                  id={`options-${fieldIndex}`}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  rows={3}
                  {...register(`schema.${fieldIndex}.options`)}
                  className="w-full rounded border border-input bg-background px-3 py-2 text-sm font-mono"
                />
                {optionsArray.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {optionsArray.map((opt: string, idx: number) => (
                      <div key={idx} className="bg-background rounded px-2 py-1 border text-xs">
                        {opt.trim()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onMove('up')}
              title="Move up"
              className="text-muted-foreground"
            >
              ↑
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onMove('down')}
              title="Move down"
              className="text-muted-foreground"
            >
              ↓
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              title="Delete"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
