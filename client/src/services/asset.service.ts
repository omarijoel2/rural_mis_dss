import { apiClient } from '../lib/api-client';
import type {
  Asset,
  AssetClass,
  AssetFilters,
  CreateAssetDto,
  UpdateAssetDto,
  PaginatedResponse,
  WorkOrder,
  PmTemplate,
  PmGenerationLog,
  PmComplianceMetric,
  PmDeferral
} from '../types/cmms';

export interface CreatePmTemplateDto {
  asset_class_id: number;
  job_plan_id?: number;
  name: string;
  description?: string;
  trigger_type: 'time_based' | 'usage_based' | 'combined';
  frequency_days?: number;
  tolerance_days?: number;
  usage_counters?: Record<string, number>;
  is_active?: boolean;
  checklist?: string[];
  kit?: Record<string, any>;
}

export interface UpdatePmTemplateDto extends Partial<CreatePmTemplateDto> {}

export interface PmTemplateFilters {
  is_active?: boolean;
  asset_class_id?: number;
  trigger_type?: 'time_based' | 'usage_based' | 'combined';
}

const BASE_URL = '/api';

export const assetService = {
  getClasses: () =>
    apiClient.get<AssetClass[]>(`${BASE_URL}/asset-classes`),

  getAssets: (filters?: AssetFilters) => {
    const params: Record<string, string> = {};
    
    if (filters?.search) params.search = filters.search;
    if (filters?.status) params.status = filters.status;
    if (filters?.class_id) params.class_id = filters.class_id.toString();
    if (filters?.scheme_id) params.scheme_id = filters.scheme_id;
    if (filters?.dma_id) params.dma_id = filters.dma_id;
    if (filters?.parent_id) params.parent_id = filters.parent_id.toString();
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    if (filters?.page) params.page = filters.page.toString();
    
    return apiClient.get<PaginatedResponse<Asset>>(`${BASE_URL}/assets`, params);
  },

  getAsset: (id: number) =>
    apiClient.get<Asset>(`${BASE_URL}/assets/${id}`),

  createAsset: (data: CreateAssetDto) =>
    apiClient.post<Asset>(`${BASE_URL}/assets`, data),

  updateAsset: (id: number, data: UpdateAssetDto) =>
    apiClient.put<Asset>(`${BASE_URL}/assets/${id}`, data),

  deleteAsset: (id: number) =>
    apiClient.delete(`${BASE_URL}/assets/${id}`),

  getAssetMaintenanceHistory: (id: number) =>
    apiClient.get<WorkOrder[]>(`${BASE_URL}/assets/${id}/maintenance-history`),

  getAssetLocations: (id: number) =>
    apiClient.get<any[]>(`${BASE_URL}/assets/${id}/locations`),

  getPmTemplates: (filters?: PmTemplateFilters) => {
    const params: Record<string, string> = {};
    if (filters?.is_active !== undefined) params.is_active = filters.is_active.toString();
    if (filters?.asset_class_id) params.asset_class_id = filters.asset_class_id.toString();
    if (filters?.trigger_type) params.trigger_type = filters.trigger_type;
    return apiClient.get<PmTemplate[]>(`${BASE_URL}/cmms/pm/templates`, params);
  },

  getPmTemplate: (id: number) =>
    apiClient.get<PmTemplate>(`${BASE_URL}/cmms/pm/templates/${id}`),

  createPmTemplate: (data: CreatePmTemplateDto) =>
    apiClient.post<PmTemplate>(`${BASE_URL}/cmms/pm/templates`, data),

  updatePmTemplate: (id: number, data: UpdatePmTemplateDto) =>
    apiClient.put<PmTemplate>(`${BASE_URL}/cmms/pm/templates/${id}`, data),

  deletePmTemplate: (id: number) =>
    apiClient.delete(`${BASE_URL}/cmms/pm/templates/${id}`),

  generatePmWorkOrders: (templateId?: number) =>
    apiClient.post<{ message: string; count: number; work_orders: WorkOrder[] }>(
      `${BASE_URL}/cmms/pm/generate`,
      templateId ? { template_id: templateId } : {}
    ),

  deferPm: (logId: number, data: { deferred_to: string; reason_code: string; notes?: string }) =>
    apiClient.post<PmDeferral>(`${BASE_URL}/cmms/pm/logs/${logId}/defer`, data),

  getPmCompliance: (periodStart: string, periodEnd: string) =>
    apiClient.get<PmComplianceMetric>(`${BASE_URL}/cmms/pm/compliance`, {
      period_start: periodStart,
      period_end: periodEnd
    })
};
