import { apiClient } from '../lib/api-client';
import type { Facility, PaginatedResponse } from '../types/core-registry';

export interface FacilityFilters {
  q?: string;
  scheme_id?: string;
  category?: string;
  status?: string;
  per_page?: number;
  page?: number;
}

export const facilityService = {
  getAll: (filters?: FacilityFilters) =>
    apiClient.get<PaginatedResponse<Facility>>('/facilities', filters),

  getById: (id: string) =>
    apiClient.get<Facility>(`/facilities/${id}`),

  create: (data: Partial<Facility>) =>
    apiClient.post<Facility>('/facilities', data),

  update: (id: string, data: Partial<Facility>) =>
    apiClient.patch<Facility>(`/facilities/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/facilities/${id}`),
};
