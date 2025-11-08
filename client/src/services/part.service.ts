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
  getParts: (filters?: PartFilters) => {
    const params: Record<string, string> = {};
    
    if (filters?.search) params.search = filters.search;
    if (filters?.category) params.category = filters.category;
    if (filters?.supplier_id) params.supplier_id = filters.supplier_id.toString();
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    if (filters?.page) params.page = filters.page.toString();
    
    return apiClient.get<PaginatedResponse<Part>>(`${BASE_URL}/parts`, params);
  },

  getPart: (id: number) =>
    apiClient.get<Part>(`${BASE_URL}/parts/${id}`),

  createPart: (data: CreatePartDto) =>
    apiClient.post<Part>(`${BASE_URL}/parts`, data),

  updatePart: (id: number, data: UpdatePartDto) =>
    apiClient.put<Part>(`${BASE_URL}/parts/${id}`, data),

  deletePart: (id: number) =>
    apiClient.delete(`${BASE_URL}/parts/${id}`),

  getStockTransactions: (partId?: number) => {
    const params = partId ? { part_id: partId.toString() } : {};
    return apiClient.get<StockTxn[]>(`${BASE_URL}/stock-txns`, params);
  }
};
