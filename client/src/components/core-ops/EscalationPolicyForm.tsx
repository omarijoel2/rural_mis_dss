import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { coreOpsService } from '../../services/core-ops.service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Plus, Trash2, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  category: string;
}

interface EscalationRule {
  severity: 'critical' | 'high' | 'medium' | 'low';
  escalate_after_minutes: number;
  notification_channels: string[];
  recipients: Array<{
    type: 'user' | 'role' | 'email' | 'phone';
    target: string;
    name?: string;
  }>;
  repeat_every_minutes?: number;
}

interface EscalationPolicyFormProps {
  initialPolicy?: any;
  onSuccess?: () => void;
}

async function fetchSupervisors(): Promise<User[]> {
  const response = await fetch('/api/v1/admin/users?category=supervisor');
  const data = await response.json();
  return data.data || [];
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
          recipients: [],
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
    if (!data.rules || data.rules.length === 0) {
      toast.error('Add at least one escalation rule');
      return;
    }

    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Policy Name</Label>
        <Input
          id="name"
          placeholder="e.g., Critical Priority Response"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && <p className="text-sm text-red-500">{(errors.name as any).message}</p>}
      </div>

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
                recipients: [],
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
  const { fields: recipientFields, append: addRecipient, remove: removeRecipient, replace: replaceRecipients } = useFieldArray({
    control,
    name: `rules.${ruleIndex}.recipients`,
  });

  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const { data: supervisors = [], isLoading: loadingSupervisors } = useQuery({
    queryKey: ['supervisors'],
    queryFn: fetchSupervisors,
  });

  const watchedRecipients = useWatch({
    control,
    name: `rules.${ruleIndex}.recipients` as any,
  });
  const currentRecipients: Array<{ type: string; target: string; name?: string }> = watchedRecipients || [];

  const selectedUserIds = currentRecipients
    .filter((r: any) => r.type === 'user')
    .map((r: any) => parseInt(r.target));

  const toggleSupervisor = (user: User) => {
    const isSelected = selectedUserIds.includes(user.id);
    if (isSelected) {
      const newRecipients = currentRecipients.filter(
        (r: any) => !(r.type === 'user' && parseInt(r.target) === user.id)
      );
      replaceRecipients(newRecipients);
    } else {
      addRecipient({ type: 'user', target: String(user.id), name: user.name });
    }
  };

  const severityOptions = ['critical', 'high', 'medium', 'low'];
  const channelOptions = ['email', 'sms', 'webhook', 'push'];

  return (
    <Card className="border bg-muted/30">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Supervisors to Notify</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                >
                  {isSelectOpen ? 'Done' : 'Select Supervisors'}
                </Button>
              </div>

              {isSelectOpen && (
                <div className="border rounded-lg p-3 bg-background max-h-48 overflow-y-auto">
                  {loadingSupervisors ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading supervisors...
                    </div>
                  ) : supervisors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No supervisors found</p>
                  ) : (
                    <div className="space-y-1">
                      {supervisors.map((user: User) => {
                        const isSelected = selectedUserIds.includes(user.id);
                        return (
                          <div
                            key={user.id}
                            onClick={() => toggleSupervisor(user)}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                              isSelected ? 'bg-primary/10 border border-primary' : 'hover:bg-muted'
                            }`}
                          >
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-primary" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {selectedUserIds.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {currentRecipients
                    .filter((r: any) => r.type === 'user')
                    .map((r: any, idx: number) => (
                      <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                        {r.name || `User #${r.target}`}
                        <button
                          type="button"
                          onClick={() => {
                            const newRecipients = currentRecipients.filter(
                              (rec) => !(rec.type === 'user' && rec.target === r.target)
                            );
                            replaceRecipients(newRecipients);
                          }}
                          className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {selectedUserIds.length} supervisor{selectedUserIds.length !== 1 ? 's' : ''} selected
              </p>
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
