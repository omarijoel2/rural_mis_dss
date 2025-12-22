import { apiClient } from '../lib/api-client';
import type { Address, PaginatedResponse } from '../types/core-registry';

export interface CoreAddressFilters {
  q?: string;
  facility_id?: string;
  per_page?: number;
  page?: number;
}

export const coreAddressService = {
  getAll: (filters?: CoreAddressFilters) =>
    apiClient.get<PaginatedResponse<Address>>('/core/addresses', filters),

  getById: (id: string) => apiClient.get<Address>(`/core/addresses/${id}`),

  create: (data: Partial<Address>) => apiClient.post<Address>('/core/addresses', data),

  update: (id: string, data: Partial<Address>) => apiClient.patch<Address>(`/core/addresses/${id}`, data),

  delete: (id: string) => apiClient.delete(`/core/addresses/${id}`),
};
