import { apiClient } from '../lib/api-client';
import type {
  WorkOrder,
  WorkOrderFilters,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  AddPartsToWorkOrderDto,
  AddLaborToWorkOrderDto,
  CompleteWorkOrderDto,
  PaginatedResponse,
  WoPart,
  WoLabor
} from '../types/cmms';

const BASE_URL = '/api/v1';

export const workOrderService = {
  getWorkOrders: (filters?: WorkOrderFilters) => {
    const params: Record<string, string> = {};
    
    if (filters?.search) params.search = filters.search;
    if (filters?.status) params.status = filters.status;
    if (filters?.kind) params.kind = filters.kind;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.asset_id) params.asset_id = filters.asset_id.toString();
    if (filters?.assigned_to) params.assigned_to = filters.assigned_to;
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    if (filters?.page) params.page = filters.page.toString();
    
    return apiClient.get<PaginatedResponse<WorkOrder>>(`${BASE_URL}/work-orders`, params);
  },

  getWorkOrder: (id: number) =>
    apiClient.get<WorkOrder>(`${BASE_URL}/work-orders/${id}`),

  createWorkOrder: (data: CreateWorkOrderDto) =>
    apiClient.post<WorkOrder>(`${BASE_URL}/work-orders`, data),

  updateWorkOrder: (id: number, data: UpdateWorkOrderDto) =>
    apiClient.put<WorkOrder>(`${BASE_URL}/work-orders/${id}`, data),

  deleteWorkOrder: (id: number) =>
    apiClient.delete(`${BASE_URL}/work-orders/${id}`),

  addParts: (id: number, data: AddPartsToWorkOrderDto) =>
    apiClient.post<WoPart[]>(`${BASE_URL}/work-orders/${id}/parts`, data),

  addLabor: (id: number, data: AddLaborToWorkOrderDto) =>
    apiClient.post<WoLabor>(`${BASE_URL}/work-orders/${id}/labor`, data),

  assignWorkOrder: (id: number, userId: string) =>
    apiClient.post<WorkOrder>(`${BASE_URL}/work-orders/${id}/assign`, { user_id: userId }),

  startWorkOrder: (id: number) =>
    apiClient.post<WorkOrder>(`${BASE_URL}/work-orders/${id}/start`),

  completeWorkOrder: (id: number, data: CompleteWorkOrderDto) =>
    apiClient.post<WorkOrder>(`${BASE_URL}/work-orders/${id}/complete`, data)
};
