import { apiClient } from '../lib/api-client';
import type { Zone, PaginatedResponse } from '../types/core-registry';

export interface ZoneFilters {
  q?: string;
  scheme_id?: string;
  type?: string;
  per_page?: number;
  page?: number;
}

export const zoneService = {
  getAll: (filters?: ZoneFilters) =>
    apiClient.get<PaginatedResponse<Zone>>('/zones', filters),

  getById: (id: string) =>
    apiClient.get<Zone>(`/zones/${id}`),

  create: (data: Partial<Zone>) =>
    apiClient.post<Zone>('/zones', data),

  update: (id: string, data: Partial<Zone>) =>
    apiClient.patch<Zone>(`/zones/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/zones/${id}`),
};
