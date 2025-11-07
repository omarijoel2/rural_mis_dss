import { apiClient } from '../lib/api-client';
import type { Dma, PaginatedResponse } from '../types/core-registry';

export interface DmaFilters {
  q?: string;
  scheme_id?: string;
  status?: string;
  per_page?: number;
  page?: number;
}

export const dmaService = {
  getAll: (filters?: DmaFilters) =>
    apiClient.get<PaginatedResponse<Dma>>('/dmas', filters),

  getById: (id: string) =>
    apiClient.get<Dma>(`/dmas/${id}`),

  create: (data: Partial<Dma>) =>
    apiClient.post<Dma>('/dmas', data),

  update: (id: string, data: Partial<Dma>) =>
    apiClient.patch<Dma>(`/dmas/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/dmas/${id}`),
};
