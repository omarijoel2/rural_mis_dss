import { apiClient } from '../lib/api-client';
import type { Dma, PaginatedResponse } from '../types/core-registry';

export interface CoreDmaFilters {
  q?: string;
  scheme_id?: string;
  status?: string;
  per_page?: number;
  page?: number;
}

export const coreDmaService = {
  getAll: (filters?: CoreDmaFilters) => apiClient.get<PaginatedResponse<Dma>>('/core/dmas', filters),

  getById: (id: string) => apiClient.get<Dma>(`/core/dmas/${id}`),

  create: (data: Partial<Dma>) => apiClient.post<Dma>('/core/dmas', data),

  update: (id: string, data: Partial<Dma>) => apiClient.patch<Dma>(`/core/dmas/${id}`, data),

  delete: (id: string) => apiClient.delete(`/core/dmas/${id}`),
};
