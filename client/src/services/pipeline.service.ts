import { apiClient } from '../lib/api-client';
import type { Pipeline, PaginatedResponse } from '../types/core-registry';

export interface PipelineFilters {
  q?: string;
  scheme_id?: string;
  material?: string;
  status?: string;
  per_page?: number;
  page?: number;
}

export const pipelineService = {
  getAll: (filters?: PipelineFilters) =>
    apiClient.get<PaginatedResponse<Pipeline>>('/pipelines', filters),

  getById: (id: string) =>
    apiClient.get<Pipeline>(`/pipelines/${id}`),

  create: (data: Partial<Pipeline>) =>
    apiClient.post<Pipeline>('/pipelines', data),

  update: (id: string, data: Partial<Pipeline>) =>
    apiClient.patch<Pipeline>(`/pipelines/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/pipelines/${id}`),
};
