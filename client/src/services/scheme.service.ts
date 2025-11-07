import { apiClient } from '../lib/api-client';
import type { Scheme, PaginatedResponse } from '../types/core-registry';

export interface SchemeFilters {
  q?: string;
  type?: string;
  status?: string;
  org_id?: string;
  per_page?: number;
  page?: number;
}

export const schemeService = {
  getAll: (filters?: SchemeFilters) =>
    apiClient.get<PaginatedResponse<Scheme>>('/schemes', filters),

  getById: (id: string) =>
    apiClient.get<Scheme>(`/schemes/${id}`),

  create: (data: Partial<Scheme>) =>
    apiClient.post<Scheme>('/schemes', data),

  update: (id: string, data: Partial<Scheme>) =>
    apiClient.patch<Scheme>(`/schemes/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/schemes/${id}`),
};
