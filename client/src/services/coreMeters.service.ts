import { apiClient } from '../lib/api-client';
import type { Meter, PaginatedResponse } from '../types/core-registry';

export interface CoreMeterFilters {
  q?: string;
  facility_id?: string;
  per_page?: number;
  page?: number;
}

export const coreMeterService = {
  getAll: (filters?: CoreMeterFilters) => apiClient.get<PaginatedResponse<Meter>>('/core/meters', filters),

  getById: (id: string) => apiClient.get<Meter>(`/core/meters/${id}`),

  create: (data: Partial<Meter>) => apiClient.post<Meter>('/core/meters', data),

  update: (id: string, data: Partial<Meter>) => apiClient.patch<Meter>(`/core/meters/${id}`, data),

  delete: (id: string) => apiClient.delete(`/core/meters/${id}`),
};
