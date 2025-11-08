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
  async getWorkOrders(filters?: WorkOrderFilters): Promise<PaginatedResponse<WorkOrder>> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.kind) params.append('kind', filters.kind);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.asset_id) params.append('asset_id', filters.asset_id.toString());
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    
    const queryString = params.toString();
    const url = queryString ? `${BASE_URL}/work-orders?${queryString}` : `${BASE_URL}/work-orders`;
    
    const response = await apiClient.get<PaginatedResponse<WorkOrder>>(url);
    return response.data;
  },

  async getWorkOrder(id: number): Promise<WorkOrder> {
    const response = await apiClient.get<WorkOrder>(`${BASE_URL}/work-orders/${id}`);
    return response.data;
  },

  async createWorkOrder(data: CreateWorkOrderDto): Promise<WorkOrder> {
    const response = await apiClient.post<WorkOrder>(`${BASE_URL}/work-orders`, data);
    return response.data;
  },

  async updateWorkOrder(id: number, data: UpdateWorkOrderDto): Promise<WorkOrder> {
    const response = await apiClient.put<WorkOrder>(`${BASE_URL}/work-orders/${id}`, data);
    return response.data;
  },

  async deleteWorkOrder(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/work-orders/${id}`);
  },

  async addParts(id: number, data: AddPartsToWorkOrderDto): Promise<WoPart[]> {
    const response = await apiClient.post<WoPart[]>(`${BASE_URL}/work-orders/${id}/parts`, data);
    return response.data;
  },

  async addLabor(id: number, data: AddLaborToWorkOrderDto): Promise<WoLabor> {
    const response = await apiClient.post<WoLabor>(`${BASE_URL}/work-orders/${id}/labor`, data);
    return response.data;
  },

  async assignWorkOrder(id: number, userId: string): Promise<WorkOrder> {
    const response = await apiClient.post<WorkOrder>(`${BASE_URL}/work-orders/${id}/assign`, {
      user_id: userId
    });
    return response.data;
  },

  async startWorkOrder(id: number): Promise<WorkOrder> {
    const response = await apiClient.post<WorkOrder>(`${BASE_URL}/work-orders/${id}/start`);
    return response.data;
  },

  async completeWorkOrder(id: number, data: CompleteWorkOrderDto): Promise<WorkOrder> {
    const response = await apiClient.post<WorkOrder>(`${BASE_URL}/work-orders/${id}/complete`, data);
    return response.data;
  }
};
