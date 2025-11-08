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

const BASE_URL = '/api/v1';

export const assetService = {
  async getClasses(): Promise<AssetClass[]> {
    const response = await apiClient.get<AssetClass[]>(`${BASE_URL}/asset-classes`);
    return response.data;
  },

  async getAssets(filters?: AssetFilters): Promise<PaginatedResponse<Asset>> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.class_id) params.append('class_id', filters.class_id.toString());
    if (filters?.scheme_id) params.append('scheme_id', filters.scheme_id);
    if (filters?.dma_id) params.append('dma_id', filters.dma_id);
    if (filters?.parent_id) params.append('parent_id', filters.parent_id.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    
    const queryString = params.toString();
    const url = queryString ? `${BASE_URL}/assets?${queryString}` : `${BASE_URL}/assets`;
    
    const response = await apiClient.get<PaginatedResponse<Asset>>(url);
    return response.data;
  },

  async getAsset(id: number): Promise<Asset> {
    const response = await apiClient.get<Asset>(`${BASE_URL}/assets/${id}`);
    return response.data;
  },

  async createAsset(data: CreateAssetDto): Promise<Asset> {
    const response = await apiClient.post<Asset>(`${BASE_URL}/assets`, data);
    return response.data;
  },

  async updateAsset(id: number, data: UpdateAssetDto): Promise<Asset> {
    const response = await apiClient.put<Asset>(`${BASE_URL}/assets/${id}`, data);
    return response.data;
  },

  async deleteAsset(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/assets/${id}`);
  },

  async getAssetMaintenanceHistory(id: number): Promise<WorkOrder[]> {
    const response = await apiClient.get<WorkOrder[]>(`${BASE_URL}/assets/${id}/maintenance-history`);
    return response.data;
  },

  async getAssetLocations(id: number): Promise<any[]> {
    const response = await apiClient.get<any[]>(`${BASE_URL}/assets/${id}/locations`);
    return response.data;
  }
};
