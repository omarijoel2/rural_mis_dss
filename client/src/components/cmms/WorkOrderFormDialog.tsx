import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workOrderService } from '../../services/workOrder.service';
import { applyServerErrors } from '@/lib/formErrors';
import { assetService } from '../../services/asset.service';
import { WorkOrder, CreateWorkOrderDto } from '../../types/cmms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Clock, MapPin, User, AlertTriangle } from 'lucide-react';

interface WorkOrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder?: WorkOrder;
}

export function WorkOrderFormDialog({ open, onOpenChange, workOrder }: WorkOrderFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!workOrder;
  const [selectedAssetId, setSelectedAssetId] = useState<number | undefined>(workOrder?.asset_id || undefined);
  const [scheduledFor, setScheduledFor] = useState<string | undefined>(workOrder?.scheduled_for || undefined);
  const [selectedOperator, setSelectedOperator] = useState<string | undefined>(workOrder?.assigned_to || undefined);
  const [pendingOperator, setPendingOperator] = useState<string | null>(null);
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);

  const { register, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm<CreateWorkOrderDto>({
    defaultValues: workOrder ? {
      kind: workOrder.kind,
      asset_id: workOrder.asset_id || undefined,
      title: workOrder.title,
      description: workOrder.description || undefined,
      priority: workOrder.priority,
      scheduled_for: workOrder.scheduled_for || undefined,
      assigned_to: workOrder.assigned_to || undefined,
      pm_policy_id: workOrder.pm_policy_id || undefined,
    } : {
      kind: 'cm',
      priority: 'medium',
    },
  });

  const { data: assets } = useQuery({
    queryKey: ['assets-for-wo'],
    queryFn: () => assetService.getAssets({ per_page: 200 }),
  });

  const { data: operatorSuggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['operator-suggestions', selectedAssetId, scheduledFor],
    queryFn: () => workOrderService.getOperatorSuggestions({
      asset_id: selectedAssetId,
      scheduled_for: scheduledFor,
    }),
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateWorkOrderDto) => workOrderService.createWorkOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success('Work order created successfully');
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      const errorsPayload = error?.payload?.errors || error?.response?.data?.errors;
      if (errorsPayload) {
        applyServerErrors(setError, errorsPayload);
        const first = Object.keys(errorsPayload)[0];
        setTimeout(() => {
          const el = document.querySelector(`[name="${first}"]`);
          if (el && (el as HTMLElement).scrollIntoView) {
            (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
            (el as any).focus?.();
          }
        }, 200);
      } else {
        toast.error(error.response?.data?.message || 'Failed to create work order');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateWorkOrderDto) => workOrderService.updateWorkOrder(workOrder!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrder!.id] });
      toast.success('Work order updated successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      const errorsPayload = error?.payload?.errors || error?.response?.data?.errors;
      if (errorsPayload) {
        applyServerErrors(setError, errorsPayload);
        const first = Object.keys(errorsPayload)[0];
        setTimeout(() => {
          const el = document.querySelector(`[name="${first}"]`);
          if (el && (el as HTMLElement).scrollIntoView) {
            (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
            (el as any).focus?.();
          }
        }, 200);
      } else {
        toast.error(error.response?.data?.message || 'Failed to update work order');
      }
    },
  });

  const onSubmit = (data: CreateWorkOrderDto) => {
    const submitData = {
      ...data,
      assigned_to: selectedOperator,
    };
    if (isEdit) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleOperatorSelect = (operatorId: string) => {
    if (operatorId === 'none') {
      setSelectedOperator(undefined);
      setValue('assigned_to', undefined);
      return;
    }

    const isSuggested = operatorSuggestions?.suggested.some(op => op.id === operatorId);
    
    if (!isSuggested && operatorSuggestions?.has_suggestions) {
      setPendingOperator(operatorId);
      setShowOverrideConfirm(true);
    } else {
      setSelectedOperator(operatorId);
      setValue('assigned_to', operatorId);
    }
  };

  const confirmOverride = () => {
    if (pendingOperator) {
      setSelectedOperator(pendingOperator);
      setValue('assigned_to', pendingOperator);
      setPendingOperator(null);
    }
    setShowOverrideConfirm(false);
  };

  const cancelOverride = () => {
    setPendingOperator(null);
    setShowOverrideConfirm(false);
  };

  useEffect(() => {
    if (workOrder) {
      Object.keys(workOrder).forEach((key) => {
        setValue(key as keyof CreateWorkOrderDto, (workOrder as any)[key]);
      });
      setSelectedAssetId(workOrder.asset_id || undefined);
      setScheduledFor(workOrder.scheduled_for || undefined);
      setSelectedOperator(workOrder.assigned_to || undefined);
    } else {
      reset({ kind: 'cm', priority: 'medium' });
      setSelectedAssetId(undefined);
      setScheduledFor(undefined);
      setSelectedOperator(undefined);
    }
  }, [workOrder, setValue, reset]);

  useEffect(() => {
    if (operatorSuggestions?.suggested.length && !selectedOperator && !isEdit) {
      const topSuggestion = operatorSuggestions.suggested[0];
      setSelectedOperator(topSuggestion.id);
      setValue('assigned_to', topSuggestion.id);
    }
  }, [operatorSuggestions, selectedOperator, isEdit, setValue]);

  const getOperatorDisplayName = (operatorId: string) => {
    const suggested = operatorSuggestions?.suggested.find(op => op.id === operatorId);
    if (suggested) return suggested.name;
    const allOps = operatorSuggestions?.all_operators.find(op => op.id === operatorId);
    return allOps?.name || operatorId;
  };

  const getSuggestionBadge = (operator: { source: string; shift_name?: string; shift_ends_at?: string; route_name?: string }) => {
    if (operator.source === 'on_shift') {
      return (
        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
          <Clock className="w-3 h-3 mr-1" />
          On Shift {operator.shift_ends_at && `until ${operator.shift_ends_at}`}
        </Badge>
      );
    }
    if (operator.source === 'route_assigned') {
      return (
        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
          <MapPin className="w-3 h-3 mr-1" />
          Route: {operator.route_name}
        </Badge>
      );
    }
    return null;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Work Order' : 'Create New Work Order'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update work order details' : 'Schedule a new maintenance task'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kind">Type *</Label>
                <Select
                  onValueChange={(value) => setValue('kind', value as any)}
                  defaultValue={workOrder?.kind || 'cm'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pm">Preventive Maintenance</SelectItem>
                    <SelectItem value="cm">Corrective Maintenance</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  onValueChange={(value) => setValue('priority', value as any)}
                  defaultValue={workOrder?.priority || 'medium'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset_id">Related Asset</Label>
              <Select
                onValueChange={(value) => {
                  const assetId = value && value !== 'none' ? Number(value) : undefined;
                  setValue('asset_id', assetId);
                  setSelectedAssetId(assetId);
                }}
                defaultValue={workOrder?.asset_id?.toString() || 'none'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select asset (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {assets?.data.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id.toString()}>
                      {asset.code} - {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title', { required: true })}
                placeholder="e.g., Replace pump motor"
              />
              {errors.title && <p className="text-sm text-red-500">Required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Detailed description of the work to be done..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_for">Scheduled Date</Label>
                <Input
                  id="scheduled_for"
                  type="datetime-local"
                  {...register('scheduled_for')}
                  onChange={(e) => {
                    setValue('scheduled_for', e.target.value);
                    setScheduledFor(e.target.value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Assign To
                  </div>
                </Label>
                <Select
                  value={selectedOperator || 'none'}
                  onValueChange={handleOperatorSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    
                    {operatorSuggestions?.suggested && operatorSuggestions.suggested.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                          Recommended Operators
                        </div>
                        {operatorSuggestions.suggested.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            <div className="flex items-center">
                              <span>{operator.name}</span>
                              {getSuggestionBadge(operator)}
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                    
                    {operatorSuggestions?.all_operators && operatorSuggestions.all_operators.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                          All Operators
                        </div>
                        {operatorSuggestions.all_operators
                          .filter(op => !op.is_suggested)
                          .map((operator) => (
                            <SelectItem key={operator.id} value={operator.id}>
                              {operator.name}
                            </SelectItem>
                          ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                
                {selectedOperator && operatorSuggestions?.suggested.find(op => op.id === selectedOperator) && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Auto-assigned: {getOperatorDisplayName(selectedOperator)} 
                    {operatorSuggestions.suggested.find(op => op.id === selectedOperator)?.source === 'on_shift' 
                      ? ' (currently on shift)'
                      : ' (assigned to this route)'}
                  </p>
                )}
                
                {suggestionsLoading && (
                  <p className="text-xs text-muted-foreground">Loading suggested operators...</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showOverrideConfirm} onOpenChange={setShowOverrideConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Override Suggested Assignment?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You're selecting an operator who is not currently on shift or assigned to this route.
              </p>
              {operatorSuggestions?.suggested && operatorSuggestions.suggested.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 rounded-md">
                  <p className="text-sm font-medium text-green-800 mb-2">Recommended operators:</p>
                  <ul className="text-sm text-green-700 space-y-1">
                    {operatorSuggestions.suggested.slice(0, 3).map(op => (
                      <li key={op.id} className="flex items-center gap-2">
                        <span>{op.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {op.source === 'on_shift' ? 'On Shift' : 'Route Assigned'}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-3 text-sm">
                Are you sure you want to proceed with manual assignment?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelOverride}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmOverride}>
              Yes, Override Assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
