import { apiClient } from '../lib/api-client';
import type {
  Part,
  PartFilters,
  CreatePartDto,
  UpdatePartDto,
  PaginatedResponse,
  StockTxn
} from '../types/cmms';

const BASE_URL = '/api/v1';

export const partService = {
  async getParts(filters?: PartFilters): Promise<PaginatedResponse<Part>> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.supplier_id) params.append('supplier_id', filters.supplier_id.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    
    const queryString = params.toString();
    const url = queryString ? `${BASE_URL}/parts?${queryString}` : `${BASE_URL}/parts`;
    
    const response = await apiClient.get<PaginatedResponse<Part>>(url);
    return response.data;
  },

  async getPart(id: number): Promise<Part> {
    const response = await apiClient.get<Part>(`${BASE_URL}/parts/${id}`);
    return response.data;
  },

  async createPart(data: CreatePartDto): Promise<Part> {
    const response = await apiClient.post<Part>(`${BASE_URL}/parts`, data);
    return response.data;
  },

  async updatePart(id: number, data: UpdatePartDto): Promise<Part> {
    const response = await apiClient.put<Part>(`${BASE_URL}/parts/${id}`, data);
    return response.data;
  },

  async deletePart(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/parts/${id}`);
  },

  async getStockTransactions(partId?: number): Promise<StockTxn[]> {
    const url = partId 
      ? `${BASE_URL}/stock-txns?part_id=${partId}` 
      : `${BASE_URL}/stock-txns`;
    
    const response = await apiClient.get<StockTxn[]>(url);
    return response.data;
  }
};
