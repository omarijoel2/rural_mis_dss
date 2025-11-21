import { apiClient } from '../lib/api-client';
import type {
  JobPlan,
  PmTemplate,
  PmGenerationLog,
  PmComplianceMetric,
  ConditionTag,
  ConditionReading,
  ConditionAlarm,
  AssetHealthScore,
  Store,
  Bin,
  Kit,
  FleetAsset,
  FleetServiceSchedule,
  FuelLog,
  FleetUptimeLog,
  ServiceContract,
  SlaViolation,
  VendorScorecard,
  Permit,
  RiskAssessment,
  Incident,
  Capa,
  PaginatedResponse
} from '../types/cmms';

const BASE_URL = '/cmms';

export const jobPlanService = {
  getJobPlans: (filters?: { search?: string; status?: string; page?: number; per_page?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.status) params.status = filters.status;
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    return apiClient.get<PaginatedResponse<JobPlan>>(`${BASE_URL}/job-plans`, params);
  },

  getJobPlan: (id: number) =>
    apiClient.get<JobPlan>(`${BASE_URL}/job-plans/${id}`),

  createJobPlan: (data: Partial<JobPlan>) =>
    apiClient.post<JobPlan>(`${BASE_URL}/job-plans`, data),

  updateJobPlan: (id: number, data: Partial<JobPlan>) =>
    apiClient.put<JobPlan>(`${BASE_URL}/job-plans/${id}`, data),

  deleteJobPlan: (id: number) =>
    apiClient.delete(`${BASE_URL}/job-plans/${id}`),

  createVersion: (id: number) =>
    apiClient.post<JobPlan>(`${BASE_URL}/job-plans/${id}/version`),

  activate: (id: number) =>
    apiClient.post<JobPlan>(`${BASE_URL}/job-plans/${id}/activate`)
};

export const pmService = {
  getTemplates: (filters?: { asset_class_id?: number; is_active?: boolean; page?: number; per_page?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.asset_class_id) params.asset_class_id = filters.asset_class_id.toString();
    if (filters?.is_active !== undefined) params.is_active = filters.is_active.toString();
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    return apiClient.get<PaginatedResponse<PmTemplate>>(`${BASE_URL}/pm/templates`, params);
  },

  getTemplate: (id: number) =>
    apiClient.get<PmTemplate>(`${BASE_URL}/pm/templates/${id}`),

  createTemplate: (data: Partial<PmTemplate>) =>
    apiClient.post<PmTemplate>(`${BASE_URL}/pm/templates`, data),

  updateTemplate: (id: number, data: Partial<PmTemplate>) =>
    apiClient.put<PmTemplate>(`${BASE_URL}/pm/templates/${id}`, data),

  deleteTemplate: (id: number) =>
    apiClient.delete(`${BASE_URL}/pm/templates/${id}`),

  generateWorkOrders: (data: { template_ids?: number[]; from_date?: string; to_date?: string }) =>
    apiClient.post<{ generated: number; work_orders: any[] }>(`${BASE_URL}/pm/generate`, data),

  deferPm: (logId: number, data: { deferred_to: string; reason_code: string; notes?: string }) =>
    apiClient.post<PmGenerationLog>(`${BASE_URL}/pm/logs/${logId}/defer`, data),

  getCompliance: (filters?: { period_start?: string; period_end?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.period_start) params.period_start = filters.period_start;
    if (filters?.period_end) params.period_end = filters.period_end;
    return apiClient.get<PmComplianceMetric[]>(`${BASE_URL}/pm/compliance`, params);
  }
};

export const conditionMonitoringService = {
  getTags: (filters?: { asset_id?: number; is_active?: boolean; page?: number; per_page?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.asset_id) params.asset_id = filters.asset_id.toString();
    if (filters?.is_active !== undefined) params.is_active = filters.is_active.toString();
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    return apiClient.get<PaginatedResponse<ConditionTag>>(`${BASE_URL}/condition-monitoring/tags`, params);
  },

  getTag: (id: number) =>
    apiClient.get<ConditionTag>(`${BASE_URL}/condition-monitoring/tags/${id}`),

  createTag: (data: Partial<ConditionTag>) =>
    apiClient.post<ConditionTag>(`${BASE_URL}/condition-monitoring/tags`, data),

  updateTag: (id: number, data: Partial<ConditionTag>) =>
    apiClient.put<ConditionTag>(`${BASE_URL}/condition-monitoring/tags/${id}`, data),

  deleteTag: (id: number) =>
    apiClient.delete(`${BASE_URL}/condition-monitoring/tags/${id}`),

  ingestReading: (tagId: number, data: { value: number; source: string; read_at?: string }) =>
    apiClient.post<ConditionReading>(`${BASE_URL}/condition-monitoring/tags/${tagId}/readings`, data),

  acknowledgeAlarm: (alarmId: number, data: { ack_notes?: string }) =>
    apiClient.post<ConditionAlarm>(`${BASE_URL}/condition-monitoring/alarms/${alarmId}/acknowledge`, data),

  clearAlarm: (alarmId: number) =>
    apiClient.post<ConditionAlarm>(`${BASE_URL}/condition-monitoring/alarms/${alarmId}/clear`),

  getAssetHealth: (assetId: number) =>
    apiClient.get<AssetHealthScore>(`${BASE_URL}/condition-monitoring/assets/${assetId}/health`),

  evaluateRules: () =>
    apiClient.post<{ evaluated: number; triggered: number }>(`${BASE_URL}/condition-monitoring/rules/evaluate`)
};

export const storesService = {
  getStores: (filters?: { type?: string; page?: number; per_page?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.type) params.type = filters.type;
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    return apiClient.get<PaginatedResponse<Store>>(`${BASE_URL}/stores`, params);
  },

  getStore: (id: number) =>
    apiClient.get<Store>(`${BASE_URL}/stores/${id}`),

  createStore: (data: Partial<Store>) =>
    apiClient.post<Store>(`${BASE_URL}/stores`, data),

  updateStore: (id: number, data: Partial<Store>) =>
    apiClient.put<Store>(`${BASE_URL}/stores/${id}`, data),

  createBin: (storeId: number, data: Partial<Bin>) =>
    apiClient.post<Bin>(`${BASE_URL}/stores/${storeId}/bins`, data),

  receiveStock: (data: { part_id: number; bin_id: number; qty: number; unit_cost: number; notes?: string }) =>
    apiClient.post(`${BASE_URL}/stores/receive`, data),

  issueStock: (data: { part_id: number; bin_id: number; qty: number; work_order_id?: number; notes?: string }) =>
    apiClient.post(`${BASE_URL}/stores/issue`, data),

  getValuation: () =>
    apiClient.get<{ total_value: number; by_category: any[] }>(`${BASE_URL}/stores/valuation`),

  getLowStock: () =>
    apiClient.get<any[]>(`${BASE_URL}/stores/low-stock`)
};

export const fleetService = {
  getFleetAssets: (filters?: { type?: string; status?: string; page?: number; per_page?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.type) params.type = filters.type;
    if (filters?.status) params.status = filters.status;
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    return apiClient.get<PaginatedResponse<FleetAsset>>(`${BASE_URL}/fleet`, params);
  },

  getFleetAsset: (id: number) =>
    apiClient.get<FleetAsset>(`${BASE_URL}/fleet/${id}`),

  createFleetAsset: (data: Partial<FleetAsset>) =>
    apiClient.post<FleetAsset>(`${BASE_URL}/fleet`, data),

  updateFleetAsset: (id: number, data: Partial<FleetAsset>) =>
    apiClient.put<FleetAsset>(`${BASE_URL}/fleet/${id}`, data),

  createServiceSchedule: (fleetAssetId: number, data: Partial<FleetServiceSchedule>) =>
    apiClient.post<FleetServiceSchedule>(`${BASE_URL}/fleet/${fleetAssetId}/service-schedules`, data),

  logFuel: (fleetAssetId: number, data: { odometer: number; liters: number; cost: number; filled_at: string }) =>
    apiClient.post<FuelLog>(`${BASE_URL}/fleet/${fleetAssetId}/fuel-logs`, data),

  logUptime: (fleetAssetId: number, data: Partial<FleetUptimeLog>) =>
    apiClient.post<FleetUptimeLog>(`${BASE_URL}/fleet/${fleetAssetId}/uptime-logs`, data),

  getUtilization: (filters?: { from_date?: string; to_date?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.from_date) params.from_date = filters.from_date;
    if (filters?.to_date) params.to_date = filters.to_date;
    return apiClient.get<any[]>(`${BASE_URL}/fleet/utilization`, params);
  },

  getFuelEfficiency: (fleetAssetId: number, filters?: { from_date?: string; to_date?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.from_date) params.from_date = filters.from_date;
    if (filters?.to_date) params.to_date = filters.to_date;
    return apiClient.get<any>(`${BASE_URL}/fleet/${fleetAssetId}/fuel-efficiency`, params);
  }
};

export const contractorService = {
  getContracts: (filters?: { status?: string; type?: string; page?: number; per_page?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.type) params.type = filters.type;
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    return apiClient.get<PaginatedResponse<ServiceContract>>(`${BASE_URL}/contractors/contracts`, params);
  },

  getContract: (id: number) =>
    apiClient.get<ServiceContract>(`${BASE_URL}/contractors/contracts/${id}`),

  createContract: (data: Partial<ServiceContract>) =>
    apiClient.post<ServiceContract>(`${BASE_URL}/contractors/contracts`, data),

  updateContract: (id: number, data: Partial<ServiceContract>) =>
    apiClient.put<ServiceContract>(`${BASE_URL}/contractors/contracts/${id}`, data),

  recordViolation: (contractId: number, data: Partial<SlaViolation>) =>
    apiClient.post<SlaViolation>(`${BASE_URL}/contractors/contracts/${contractId}/violations`, data),

  recordPayment: (contractId: number, data: { amount: number; payment_date: string; invoice_ref?: string; notes?: string }) =>
    apiClient.post(`${BASE_URL}/contractors/contracts/${contractId}/payments`, data),

  getVendorScore: (filters?: { vendor_name?: string; period_start?: string; period_end?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.vendor_name) params.vendor_name = filters.vendor_name;
    if (filters?.period_start) params.period_start = filters.period_start;
    if (filters?.period_end) params.period_end = filters.period_end;
    return apiClient.get<VendorScorecard[]>(`${BASE_URL}/contractors/vendor-score`, params);
  },

  getActiveContracts: () =>
    apiClient.get<ServiceContract[]>(`${BASE_URL}/contractors/active`),

  getExpiringContracts: (filters?: { days?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.days) params.days = filters.days.toString();
    return apiClient.get<ServiceContract[]>(`${BASE_URL}/contractors/expiring`, params);
  }
};

export const hseService = {
  getPermits: (filters?: { status?: string; permit_type?: string; page?: number; per_page?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.permit_type) params.permit_type = filters.permit_type;
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    return apiClient.get<PaginatedResponse<Permit>>(`${BASE_URL}/hse/permits`, params);
  },

  getPermit: (id: number) =>
    apiClient.get<Permit>(`${BASE_URL}/hse/permits/${id}`),

  createPermit: (data: Partial<Permit>) =>
    apiClient.post<Permit>(`${BASE_URL}/hse/permits`, data),

  approvePermit: (id: number, data?: { comments?: string }) =>
    apiClient.post<Permit>(`${BASE_URL}/hse/permits/${id}/approve`, data || {}),

  closePermit: (id: number) =>
    apiClient.post<Permit>(`${BASE_URL}/hse/permits/${id}/close`),

  createRiskAssessment: (data: Partial<RiskAssessment>) =>
    apiClient.post<RiskAssessment>(`${BASE_URL}/hse/risk-assessments`, data),

  updateRiskAssessment: (id: number, data: Partial<RiskAssessment>) =>
    apiClient.put<RiskAssessment>(`${BASE_URL}/hse/risk-assessments/${id}`, data),

  getIncidents: (filters?: { category?: string; severity?: string; status?: string; page?: number; per_page?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.severity) params.severity = filters.severity;
    if (filters?.status) params.status = filters.status;
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    return apiClient.get<PaginatedResponse<Incident>>(`${BASE_URL}/hse/incidents`, params);
  },

  createIncident: (data: Partial<Incident>) =>
    apiClient.post<Incident>(`${BASE_URL}/hse/incidents`, data),

  investigateIncident: (id: number, data: { root_cause: string; corrective_actions: string }) =>
    apiClient.post<Incident>(`${BASE_URL}/hse/incidents/${id}/investigate`, data),

  closeIncident: (id: number) =>
    apiClient.post<Incident>(`${BASE_URL}/hse/incidents/${id}/close`),

  getIncidentStats: (filters?: { from_date?: string; to_date?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.from_date) params.from_date = filters.from_date;
    if (filters?.to_date) params.to_date = filters.to_date;
    return apiClient.get<any>(`${BASE_URL}/hse/incidents/stats`, params);
  },

  getCapas: (filters?: { status?: string; page?: number; per_page?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    return apiClient.get<PaginatedResponse<Capa>>(`${BASE_URL}/hse/capas`, params);
  },

  createCapa: (data: Partial<Capa>) =>
    apiClient.post<Capa>(`${BASE_URL}/hse/capas`, data),

  completeCapa: (id: number, data: { completion_notes?: string }) =>
    apiClient.post<Capa>(`${BASE_URL}/hse/capas/${id}/complete`, data)
};
