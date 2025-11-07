import { apiClient } from '../lib/api-client';
import type { Address, PaginatedResponse } from '../types/core-registry';

export interface AddressFilters {
  q?: string;
  scheme_id?: string;
  city?: string;
  ward?: string;
  per_page?: number;
  page?: number;
}

export const addressService = {
  getAll: (filters?: AddressFilters) =>
    apiClient.get<PaginatedResponse<Address>>('/addresses', filters),

  getById: (id: string) =>
    apiClient.get<Address>(`/addresses/${id}`),

  create: (data: Partial<Address>) =>
    apiClient.post<Address>('/addresses', data),

  update: (id: string, data: Partial<Address>) =>
    apiClient.patch<Address>(`/addresses/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/addresses/${id}`),
};
