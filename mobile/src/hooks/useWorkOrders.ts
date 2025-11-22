import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Q } from '@nozbe/watermelondb';
import { database } from '../database';
import WorkOrder from '../database/models/WorkOrder';
import { syncEngine } from '../lib/sync-engine';
import { useAuthStore } from '../lib/auth-store';

interface SerializedWorkOrder {
  id: string;
  serverId: string;
  code: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: string;
  dueDate?: Date;
  tenantId: string;
  syncedAt?: number;
  createdAt: Date;
  updatedAt: Date;
}

function serializeWorkOrder(workOrder: WorkOrder): SerializedWorkOrder {
  return {
    id: workOrder.id as string,
    serverId: workOrder.serverId,
    code: workOrder.code,
    title: workOrder.title,
    description: workOrder.description,
    status: workOrder.status,
    priority: workOrder.priority,
    assignedTo: workOrder.assignedTo,
    dueDate: workOrder.dueDate instanceof Date ? workOrder.dueDate : (workOrder.dueDate ? new Date(workOrder.dueDate) : undefined),
    tenantId: workOrder.tenantId,
    syncedAt: workOrder.syncedAt,
    createdAt: workOrder.createdAt,
    updatedAt: workOrder.updatedAt,
  };
}

export function useWorkOrders(statusFilter?: string) {
  const { activeTenant } = useAuthStore();

  return useQuery({
    queryKey: ['work-orders', activeTenant?.id, statusFilter],
    queryFn: async () => {
      const workOrdersCollection = database.get<WorkOrder>('work_orders');
      
      let query = workOrdersCollection.query(
        Q.where('tenant_id', activeTenant?.id || '')
      );

      if (statusFilter && statusFilter !== 'all') {
        query = query.extend(Q.where('status', statusFilter));
      }

      const workOrders = await query.fetch();
      return workOrders.map(serializeWorkOrder);
    },
    enabled: !!activeTenant,
  });
}

export function useWorkOrder(id: string) {
  const { activeTenant } = useAuthStore();

  return useQuery({
    queryKey: ['work-order', id],
    queryFn: async () => {
      const workOrdersCollection = database.get<WorkOrder>('work_orders');
      const workOrder = await workOrdersCollection.find(id);
      
      if (workOrder.tenantId !== activeTenant?.id) {
        throw new Error('Work order not found in active tenant');
      }
      
      return serializeWorkOrder(workOrder);
    },
    enabled: !!activeTenant,
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  const { activeTenant } = useAuthStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SerializedWorkOrder> }) => {
      const workOrdersCollection = database.get<WorkOrder>('work_orders');
      const workOrder = await workOrdersCollection.find(id);

      await database.write(async () => {
        await workOrder.update((record) => {
          if (data.title) record.title = data.title;
          if (data.description !== undefined) record.description = data.description;
          if (data.status) record.status = data.status;
          if (data.priority) record.priority = data.priority;
          if (data.assignedTo !== undefined) record.assignedTo = data.assignedTo;
          if (data.dueDate !== undefined) record.dueDate = data.dueDate;
        });
      });

      await syncEngine.queueMutation(
        'work_orders',
        workOrder.serverId,
        'update',
        data as Record<string, unknown>,
        activeTenant?.id || ''
      );

      return serializeWorkOrder(workOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}

export function useSyncWorkOrders() {
  const queryClient = useQueryClient();
  const { activeTenant } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (!activeTenant) throw new Error('No active tenant');
      await syncEngine.processSyncQueue(activeTenant.id);
      await syncEngine.pullWorkOrdersFromServer(activeTenant.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}
