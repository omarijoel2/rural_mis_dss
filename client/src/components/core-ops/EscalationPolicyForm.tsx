import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface EscalationRule {
  severity: 'critical' | 'high' | 'medium' | 'low';
  escalate_after_minutes: number;
  notification_channels: string[];
  recipients: Array<{
    type: 'user' | 'role' | 'email' | 'phone';
    target: string;
  }>;
  repeat_every_minutes?: number;
}

interface EscalationPolicyFormProps {
  initialPolicy?: any;
  onSuccess?: () => void;
}

export function EscalationPolicyForm({ initialPolicy, onSuccess }: EscalationPolicyFormProps) {
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: initialPolicy?.name || '',
      rules: initialPolicy?.rules || [
        {
          severity: 'critical',
          escalate_after_minutes: 15,
          notification_channels: ['email'],
          recipients: [{ type: 'email', target: '' }],
        },
      ],
    },
  });

  const { fields: ruleFields, append: addRule, remove: removeRule } = useFieldArray({
    control,
    name: 'rules',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (initialPolicy) {
        return coreOpsService.escalationPolicies.update(initialPolicy.id, data);
      }
      return coreOpsService.escalationPolicies.create(data);
    },
    onSuccess: () => {
      toast.success(initialPolicy ? 'Policy updated' : 'Policy created');
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: any) => {
    // Validate at least one rule
    if (!data.rules || data.rules.length === 0) {
      toast.error('Add at least one escalation rule');
      return;
    }

    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Policy Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Policy Name</Label>
        <Input
          id="name"
          placeholder="e.g., Critical Priority Response"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && <p className="text-sm text-red-500">{(errors.name as any).message}</p>}
      </div>

      {/* Rules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Escalation Rules</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              addRule({
                severity: 'high',
                escalate_after_minutes: 30,
                notification_channels: ['email'],
                recipients: [{ type: 'email', target: '' }],
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
        </div>

        <div className="space-y-3">
          {ruleFields.map((field, ruleIdx) => (
            <RuleEditor
              key={field.id}
              ruleIndex={ruleIdx}
              onRemove={() => removeRule(ruleIdx)}
              register={register}
              control={control}
            />
          ))}
        </div>
      </div>

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? 'Saving...' : initialPolicy ? 'Update Policy' : 'Create Policy'}
      </Button>
    </form>
  );
}

function RuleEditor({ ruleIndex, onRemove, register, control }: any) {
  const { fields: recipientFields, append: addRecipient, remove: removeRecipient } = useFieldArray({
    control,
    name: `rules.${ruleIndex}.recipients`,
  });

  const severityOptions = ['critical', 'high', 'medium', 'low'];
  const channelOptions = ['email', 'sms', 'webhook', 'push'];

  return (
    <Card className="border bg-muted/30">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
            {/* Severity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Severity</Label>
                <select
                  {...register(`rules.${ruleIndex}.severity`)}
                  className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                >
                  {severityOptions.map((sev) => (
                    <option key={sev} value={sev}>
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Escalate After (min)</Label>
                <Input
                  type="number"
                  min="1"
                  {...register(`rules.${ruleIndex}.escalate_after_minutes`, { required: true, valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Repeat Every (min)</Label>
                <Input
                  type="number"
                  min="15"
                  placeholder="Optional"
                  {...register(`rules.${ruleIndex}.repeat_every_minutes`, { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Channels */}
            <div className="space-y-2">
              <Label className="text-sm">Notification Channels</Label>
              <div className="flex flex-wrap gap-2">
                {channelOptions.map((ch) => (
                  <label key={ch} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={ch}
                      {...register(`rules.${ruleIndex}.notification_channels`)}
                      className="rounded"
                    />
                    <span className="text-sm">{ch.charAt(0).toUpperCase() + ch.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Recipients */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Recipients</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addRecipient({ type: 'email', target: '' })}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {recipientFields.map((recipientField, recipIdx) => (
                  <div key={recipientField.id} className="flex gap-2">
                    <select
                      {...register(`rules.${ruleIndex}.recipients.${recipIdx}.type`)}
                      className="w-24 rounded border border-input bg-background px-2 py-1 text-sm"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="user">User</option>
                      <option value="role">Role</option>
                    </select>
                    <Input
                      placeholder="Email, phone, user ID, or role"
                      {...register(`rules.${ruleIndex}.recipients.${recipIdx}.target`)}
                      className="flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRecipient(recipIdx)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
