import { apiClient } from '../lib/api-client';
import type { Zone, PaginatedResponse } from '../types/core-registry';

export interface CoreZoneFilters {
  q?: string;
  scheme_id?: string;
  per_page?: number;
  page?: number;
}

export const coreZoneService = {
  getAll: (filters?: CoreZoneFilters) => apiClient.get<PaginatedResponse<Zone>>('/core/zones', filters),

  getById: (id: string) => apiClient.get<Zone>(`/core/zones/${id}`),

  create: (data: Partial<Zone>) => apiClient.post<Zone>('/core/zones', data),

  update: (id: string, data: Partial<Zone>) => apiClient.patch<Zone>(`/core/zones/${id}`, data),

  delete: (id: string) => apiClient.delete(`/core/zones/${id}`),
};
