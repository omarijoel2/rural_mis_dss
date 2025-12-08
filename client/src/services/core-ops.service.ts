import { apiClient } from '../lib/api-client';
import type {
  NetworkNode,
  NetworkEdge,
  TelemetryTag,
  TelemetryMeasurement,
  NrwSnapshot,
  Intervention,
  Outage,
  DosePlan,
  ChemicalStock,
  DoseChangeLog,
  PumpSchedule,
  PaginatedResponse,
  OperationsDashboard,
  WaterBalanceCalculation,
} from '../types/core-ops';

export interface TopologyFilters {
  scheme_id?: string;
  node_type?: string;
  per_page?: number;
  page?: number;
}

export interface EdgeFilters {
  scheme_id?: string;
  edge_type?: string;
  from_node_id?: string;
  to_node_id?: string;
  per_page?: number;
  page?: number;
}

export interface TelemetryFilters {
  scheme_id?: string;
  asset_id?: string;
  facility_id?: string;
  category?: string;
  enabled?: boolean;
  per_page?: number;
  page?: number;
}

export interface MeasurementFilters {
  tag_id?: string;
  from?: string;
  to?: string;
  per_page?: number;
  page?: number;
}

export interface NrwFilters {
  dma_id?: string;
  from?: string;
  to?: string;
  per_page?: number;
  page?: number;
}

export interface InterventionFilters {
  dma_id?: string;
  type?: string;
  per_page?: number;
  page?: number;
}

export interface OutageFilters {
  scheme_id?: string;
  state?: string;
  cause?: string;
  active?: boolean;
  per_page?: number;
  page?: number;
}

export interface DosePlanFilters {
  scheme_id?: string;
  active?: boolean;
  per_page?: number;
  page?: number;
}

export interface ChemicalStockFilters {
  scheme_id?: string;
  chemical?: string;
  per_page?: number;
  page?: number;
}

export interface ScheduleFilters {
  asset_id?: string;
  scheme_id?: string;
  status?: string;
  from?: string;
  to?: string;
  per_page?: number;
  page?: number;
}

export const coreOpsService = {
  topology: {
    getNodes: (filters?: TopologyFilters) =>
      apiClient.get<PaginatedResponse<NetworkNode>>('/core-ops/network/nodes', filters),

    createNode: (data: Partial<NetworkNode>) =>
      apiClient.post<NetworkNode>('/core-ops/network/nodes', data),

    getEdges: (filters?: EdgeFilters) =>
      apiClient.get<PaginatedResponse<NetworkEdge>>('/core-ops/network/edges', filters),

    createEdge: (data: Partial<NetworkEdge>) =>
      apiClient.post<NetworkEdge>('/core-ops/network/edges', data),

    trace: (from_node_id: string, to_node_id: string) =>
      apiClient.post<{ path: NetworkNode[]; edges: NetworkEdge[] }>('/core-ops/network/trace', {
        from_node_id,
        to_node_id,
      }),
  },

  telemetry: {
    getTags: (filters?: TelemetryFilters) =>
      apiClient.get<PaginatedResponse<TelemetryTag>>('/core-ops/telemetry/tags', filters),

    createTag: (data: Partial<TelemetryTag>) =>
      apiClient.post<TelemetryTag>('/core-ops/telemetry/tags', data),

    updateTag: (id: string, data: Partial<TelemetryTag>) =>
      apiClient.patch<TelemetryTag>(`/core-ops/telemetry/tags/${id}`, data),

    getMeasurements: (filters?: MeasurementFilters) =>
      apiClient.get<PaginatedResponse<TelemetryMeasurement>>('/core-ops/telemetry/measurements', filters),

    ingestBatch: (measurements: Array<{ tag_name: string; timestamp: string; value: any; quality?: string }>) =>
      apiClient.post('/core-ops/telemetry/ingest', { measurements }),
  },

  nrw: {
    getSnapshots: (filters?: NrwFilters) =>
      apiClient.get<PaginatedResponse<NrwSnapshot>>('/core-ops/nrw/snapshots', filters),

    createSnapshot: (data: Partial<NrwSnapshot>) =>
      apiClient.post<NrwSnapshot>('/core-ops/nrw/snapshots', data),

    calculateBalance: (snapshot_id: string) =>
      apiClient.post<WaterBalanceCalculation>(`/core-ops/nrw/calculate/${snapshot_id}`),

    getInterventions: (filters?: InterventionFilters) =>
      apiClient.get<PaginatedResponse<Intervention>>('/core-ops/nrw/interventions', filters),

    createIntervention: (data: Partial<Intervention>) =>
      apiClient.post<Intervention>('/core-ops/nrw/interventions', data),
  },

  outages: {
    getAll: (filters?: OutageFilters) =>
      apiClient.get<PaginatedResponse<Outage>>('/core-ops/outages', filters),

    getById: (id: string) =>
      apiClient.get<Outage>(`/core-ops/outages/${id}`),

    create: (data: Partial<Outage>) =>
      apiClient.post<Outage>('/core-ops/outages', data),

    update: (id: string, data: Partial<Outage>) =>
      apiClient.patch<Outage>(`/core-ops/outages/${id}`, data),

    changeState: (id: string, state: string, notes?: string) =>
      apiClient.post<Outage>(`/core-ops/outages/${id}/state`, { state, notes }),
  },

  dosing: {
    getPlans: (filters?: DosePlanFilters) =>
      apiClient.get<PaginatedResponse<DosePlan>>('/core-ops/dosing/plans', filters),

    createPlan: (data: Partial<DosePlan>) =>
      apiClient.post<DosePlan>('/core-ops/dosing/plans', data),

    getStocks: (filters?: ChemicalStockFilters) =>
      apiClient.get<PaginatedResponse<ChemicalStock>>('/core-ops/dosing/stocks', filters),

    createStock: (data: Partial<ChemicalStock>) =>
      apiClient.post<ChemicalStock>('/core-ops/dosing/stocks', data),

    getChangeLogs: (filters?: { per_page?: number; dose_plan_id?: string }) =>
      apiClient.get<PaginatedResponse<DoseChangeLog>>('/core-ops/dosing/change-logs', filters),
  },

  scheduling: {
    getSchedules: (filters?: ScheduleFilters) =>
      apiClient.get<PaginatedResponse<PumpSchedule>>('/core-ops/schedule', filters),

    create: (data: Partial<PumpSchedule>) =>
      apiClient.post<PumpSchedule>('/core-ops/schedule', data),

    update: (id: string, data: Partial<PumpSchedule>) =>
      apiClient.patch<PumpSchedule>(`/core-ops/schedule/${id}`, data),
  },

  operations: {
    getDashboard: () =>
      apiClient.get<OperationsDashboard>('/core-ops/dashboard'),

    getAlarms: () =>
      apiClient.get<{ alarms: any[]; message?: string }>('/core-ops/alarms'),
  },

  shifts: {
    list: (filters?: any) =>
      apiClient.get<PaginatedResponse<any>>('/operations/shifts', filters),

    create: (data: any) =>
      apiClient.post<any>('/operations/shifts', data),

    get: (id: string) =>
      apiClient.get<any>(`/operations/shifts/${id}`),

    close: (id: string, data: any) =>
      apiClient.post<any>(`/operations/shifts/${id}/close`, data),

    getEntries: (id: string, filters?: any) =>
      apiClient.get<PaginatedResponse<any>>(`/operations/shifts/${id}/entries`, filters),

    addEntry: (id: string, data: any) =>
      apiClient.post<any>(`/operations/shifts/${id}/entries`, data),
  },

  events: {
    list: (filters?: any) =>
      apiClient.get<PaginatedResponse<any>>('/operations/events', filters),

    create: (data: any) =>
      apiClient.post<any>('/operations/events', data),

    get: (id: string) =>
      apiClient.get<any>(`/operations/events/${id}`),

    acknowledge: (id: string, data: any) =>
      apiClient.post<any>(`/operations/events/${id}/acknowledge`, data),

    resolve: (id: string, data: any) =>
      apiClient.post<any>(`/operations/events/${id}/resolve`, data),

    link: (id: string, data: any) =>
      apiClient.post<any>(`/operations/events/${id}/link`, data),
  },

  checklists: {
    list: (filters?: any) =>
      apiClient.get<PaginatedResponse<any>>('/operations/checklists', filters),

    create: (data: any) =>
      apiClient.post<any>('/operations/checklists', data),

    get: (id: string) =>
      apiClient.get<any>(`/operations/checklists/${id}`),

    update: (id: string, data: any) =>
      apiClient.patch<any>(`/operations/checklists/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<any>(`/operations/checklists/${id}`),

    startRun: (id: string, data: any) =>
      apiClient.post<any>(`/operations/checklists/${id}/start`, data),

    listRuns: (filters?: any) =>
      apiClient.get<PaginatedResponse<any>>('/operations/checklist-runs', filters),

    updateRun: (id: string, data: any) =>
      apiClient.patch<any>(`/operations/checklist-runs/${id}`, data),

    completeRun: (id: string, data: any) =>
      apiClient.post<any>(`/operations/checklist-runs/${id}/complete`, data),
  },

  playbooks: {
    list: (filters?: any) =>
      apiClient.get<PaginatedResponse<any>>('/operations/playbooks', filters),

    create: (data: any) =>
      apiClient.post<any>('/operations/playbooks', data),

    get: (id: string) =>
      apiClient.get<any>(`/operations/playbooks/${id}`),

    update: (id: string, data: any) =>
      apiClient.patch<any>(`/operations/playbooks/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<any>(`/operations/playbooks/${id}`),

    findMatching: (filters?: any) =>
      apiClient.get<any>('/operations/playbooks/find-matching', filters),
  },

  escalationPolicies: {
    list: (filters?: any) =>
      apiClient.get<PaginatedResponse<any>>('/operations/escalation-policies', filters),

    create: (data: any) =>
      apiClient.post<any>('/operations/escalation-policies', data),

    get: (id: number) =>
      apiClient.get<any>(`/operations/escalation-policies/${id}`),

    update: (id: number, data: any) =>
      apiClient.patch<any>(`/operations/escalation-policies/${id}`, data),

    delete: (id: number) =>
      apiClient.delete<any>(`/operations/escalation-policies/${id}`),
  },
};
