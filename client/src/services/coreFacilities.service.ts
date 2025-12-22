import { apiClient } from '../lib/api-client';
import type { Facility, PaginatedResponse } from '../types/core-registry';

export interface CoreFacilityFilters {
  q?: string;
  scheme_id?: string;
  category?: string;
  status?: string;
  per_page?: number;
  page?: number;
}

export const coreFacilityService = {
  getAll: (filters?: CoreFacilityFilters) =>
    apiClient.get<PaginatedResponse<Facility>>('/core/facilities', filters),

  getById: (id: string) => apiClient.get<Facility>(`/core/facilities/${id}`),

  create: (data: Partial<Facility>) => apiClient.post<Facility>('/core/facilities', data),

  update: (id: string, data: Partial<Facility>) => apiClient.patch<Facility>(`/core/facilities/${id}`, data),

  delete: (id: string) => apiClient.delete(`/core/facilities/${id}`),
};
