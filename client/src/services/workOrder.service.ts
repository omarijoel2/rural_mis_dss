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

const BASE_URL = '';

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
    apiClient.post<WorkOrder>(`${BASE_URL}/work-orders/${id}/complete`, data),

  cancelWorkOrder: (id: number, notes?: string) =>
    apiClient.post<WorkOrder>(`${BASE_URL}/work-orders/${id}/cancel`, { notes }),

  approveWorkOrder: (id: number, notes?: string) =>
    apiClient.post<WorkOrder>(`${BASE_URL}/work-orders/${id}/approve`, { notes }),

  qaWorkOrder: (id: number, data: { result: 'pass' | 'fail'; notes?: string }) =>
    apiClient.post<WorkOrder>(`${BASE_URL}/work-orders/${id}/qa`, data),

  addChecklist: (id: number, data: { checklist: Array<{ step: string }> }) =>
    apiClient.post(`${BASE_URL}/work-orders/${id}/checklist`, data),

  updateChecklistItem: (itemId: number, data: { result: 'pass' | 'fail' | 'na'; notes?: string }) =>
    apiClient.patch(`${BASE_URL}/work-orders/checklist-items/${itemId}`, data),

  addAttachment: (id: number, data: FormData) =>
    apiClient.post(`${BASE_URL}/work-orders/${id}/attachments`, data),

  addAssignment: (id: number, data: { user_id: string; role: 'primary' | 'secondary' | 'supervisor' | 'observer' }) =>
    apiClient.post(`${BASE_URL}/work-orders/${id}/assignments`, data),

  addComment: (id: number, data: { comment: string }) =>
    apiClient.post(`${BASE_URL}/work-orders/${id}/comments`, data),

  getOverdue: () =>
    apiClient.get<WorkOrder[]>(`${BASE_URL}/work-orders/overdue`),

  getStats: () =>
    apiClient.get<any>(`${BASE_URL}/work-orders/stats`),

  getOperatorSuggestions: (params?: { 
    asset_id?: number; 
    scheme_id?: string; 
    dma_id?: string; 
    scheduled_for?: string;
  }) => {
    const queryParams: Record<string, string> = {};
    if (params?.asset_id) queryParams.asset_id = params.asset_id.toString();
    if (params?.scheme_id) queryParams.scheme_id = params.scheme_id;
    if (params?.dma_id) queryParams.dma_id = params.dma_id;
    if (params?.scheduled_for) queryParams.scheduled_for = params.scheduled_for;
    return apiClient.get<{
      suggested: Array<{
        id: string;
        name: string;
        email: string;
        source: 'on_shift' | 'route_assigned';
        shift_name?: string;
        shift_ends_at?: string;
        route_name?: string;
        route_code?: string;
        priority: number;
      }>;
      all_operators: Array<{
        id: string;
        name: string;
        email: string;
        is_suggested: boolean;
        suggestion_reason: string | null;
      }>;
      has_suggestions: boolean;
    }>(`/cmms/operator-suggestions`, queryParams);
  }
};
