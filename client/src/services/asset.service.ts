import { apiClient } from '../lib/api-client';
import type {
  Asset,
  AssetClass,
  AssetFilters,
  CreateAssetDto,
  UpdateAssetDto,
  PaginatedResponse,
  WorkOrder
} from '../types/cmms';

const BASE_URL = '';

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
    apiClient.get<any[]>(`${BASE_URL}/assets/${id}/locations`)
};
