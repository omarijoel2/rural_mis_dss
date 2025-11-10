import { apiClient } from '../lib/api-client';

const BASE_URL = '/api/v1/costing';

export interface GlAccount {
  id: number;
  tenant_id: number;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id: number | null;
  active: boolean;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface CostCenter {
  id: number;
  tenant_id: number;
  code: string;
  name: string;
  parent_id: number | null;
  owner_id: number | null;
  active: boolean;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetVersion {
  id: number;
  tenant_id: number;
  name: string;
  fiscal_year: number;
  status: 'draft' | 'submitted' | 'approved' | 'archived';
  is_rolling: boolean;
  base_version_id: number | null;
  approved_by: number | null;
  approved_at: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
  };
  approver?: {
    id: number;
    name: string;
  } | null;
  base_version?: BudgetVersion | null;
  lines?: BudgetLine[];
}

export interface BudgetLine {
  id: number;
  version_id: number;
  cost_center_id: number;
  gl_account_id: number;
  project_id: number | null;
  scheme_id: number | null;
  dma_id: number | null;
  class: string | null;
  period: string;
  amount: number;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  cost_center?: CostCenter;
  gl_account?: GlAccount;
}

export interface AllocationRule {
  id: number;
  tenant_id: number;
  name: string;
  basis: 'driver' | 'percentage' | 'equal' | 'formula';
  driver_id: number | null;
  percentage: number | null;
  formula: string | null;
  applies_to: string;
  active: boolean;
  scope_filter: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  driver?: {
    id: number;
    code: string;
    name: string;
  } | null;
}

export interface AllocRun {
  id: number;
  tenant_id: number;
  version_id: number | null;
  forecast_id: number | null;
  period_from: string;
  period_to: string;
  status: 'running' | 'completed' | 'failed';
  meta: Record<string, any> | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  version?: BudgetVersion | null;
  results?: AllocResult[];
}

export interface AllocResult {
  id: number;
  run_id: number;
  gl_account_id: number;
  cost_center_id: number;
  scheme_id: number | null;
  dma_id: number | null;
  class: string | null;
  period: string;
  amount: number;
  driver_value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  gl_account?: GlAccount;
  cost_center?: CostCenter;
}

export interface CostToServe {
  id: number;
  tenant_id: number;
  period: string;
  scheme_id: number | null;
  dma_id: number | null;
  class: string | null;
  production_m3: number;
  billed_m3: number;
  opex_cost: number;
  capex_depr: number;
  energy_kwh: number;
  energy_cost: number;
  chemical_cost: number;
  other_cost: number;
  cost_per_m3: number;
  revenue_per_m3: number;
  margin_per_m3: number;
  created_at: string;
  updated_at: string;
}

export interface CostToServeSummary {
  avg_cost_per_m3: number;
  min_cost_per_m3: number;
  max_cost_per_m3: number;
  avg_margin_per_m3: number;
  total_production_m3: number;
  total_billed_m3: number;
  total_opex: number;
  total_energy_cost: number;
  nrw_percentage: number;
}

export interface DmaLeagueEntry {
  rank: number;
  dma_id: number;
  cost_per_m3: number;
  margin_per_m3: number;
  production_m3: number;
  billed_m3: number;
  nrw_percentage: number;
}

export interface TrendDataPoint {
  period: string;
  avg_cost_per_m3: number;
  avg_revenue_per_m3: number;
  avg_margin_per_m3: number;
  total_production: number;
  total_billed: number;
}

export interface BudgetSummary {
  id: number;
  code: string;
  name: string;
  total_amount: number;
  account_count: number;
}

export const costingService = {
  // Budget Versions
  getBudgetVersions: (filters?: { fiscal_year?: number; status?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.fiscal_year) params.fiscal_year = filters.fiscal_year.toString();
    if (filters?.status) params.status = filters.status;
    return apiClient.get<{ data: BudgetVersion[]; meta: { total: number } }>(
      `${BASE_URL}/budgets`,
      params
    );
  },

  getBudgetVersion: (id: number, includeLines = true) => {
    const params: Record<string, string> = {};
    if (includeLines !== undefined) params.include_lines = includeLines.toString();
    return apiClient.get<{ data: BudgetVersion }>(`${BASE_URL}/budgets/${id}`, params);
  },

  createBudgetVersion: (data: {
    name: string;
    fiscal_year: number;
    status?: string;
    is_rolling?: boolean;
    base_version_id?: number;
  }) => apiClient.post<{ data: BudgetVersion; message: string }>(`${BASE_URL}/budgets`, data),

  updateBudgetVersion: (
    id: number,
    data: {
      name?: string;
      fiscal_year?: number;
      status?: string;
      is_rolling?: boolean;
    }
  ) =>
    apiClient.patch<{ data: BudgetVersion; message: string }>(`${BASE_URL}/budgets/${id}`, data),

  deleteBudgetVersion: (id: number) => apiClient.delete(`${BASE_URL}/budgets/${id}`),

  approveBudgetVersion: (id: number) =>
    apiClient.post<{ data: BudgetVersion; message: string }>(`${BASE_URL}/budgets/${id}/approve`),

  // Budget Lines
  getBudgetLines: (
    versionId: number,
    filters?: {
      cost_center_id?: number;
      gl_account_id?: number;
      period_from?: string;
      period_to?: string;
    }
  ) => {
    const params: Record<string, string> = {};
    if (filters?.cost_center_id) params.cost_center_id = filters.cost_center_id.toString();
    if (filters?.gl_account_id) params.gl_account_id = filters.gl_account_id.toString();
    if (filters?.period_from) params.period_from = filters.period_from;
    if (filters?.period_to) params.period_to = filters.period_to;
    return apiClient.get<{ data: BudgetLine[]; meta: { total: number } }>(
      `${BASE_URL}/budgets/${versionId}/lines`,
      params
    );
  },

  upsertBudgetLines: (
    versionId: number,
    lines: Array<{
      cost_center_id: number;
      gl_account_id: number;
      period: string;
      amount: number;
      class?: string;
      scheme_id?: number;
      dma_id?: number;
      project_id?: number;
      meta?: Record<string, any>;
    }>
  ) =>
    apiClient.post<{ message: string }>(`${BASE_URL}/budgets/${versionId}/lines`, { lines }),

  getBudgetSummary: (versionId: number) =>
    apiClient.get<{ data: BudgetSummary[] }>(`${BASE_URL}/budgets/${versionId}/summary`),

  // Allocation Rules
  getAllocationRules: (filters?: { active?: boolean }) => {
    const params: Record<string, string> = {};
    if (filters?.active !== undefined) params.active = filters.active.toString();
    return apiClient.get<{ data: AllocationRule[]; meta: { total: number } }>(
      `${BASE_URL}/allocation-rules`,
      params
    );
  },

  createAllocationRule: (data: {
    name: string;
    basis: 'driver' | 'percentage' | 'equal' | 'formula';
    driver_id?: number;
    percentage?: number;
    formula?: string;
    applies_to: string;
    active?: boolean;
    scope_filter?: Record<string, any>;
  }) =>
    apiClient.post<{ data: AllocationRule; message: string }>(
      `${BASE_URL}/allocation-rules`,
      data
    ),

  updateAllocationRule: (
    id: number,
    data: {
      name?: string;
      basis?: 'driver' | 'percentage' | 'equal' | 'formula';
      driver_id?: number;
      percentage?: number;
      formula?: string;
      applies_to?: string;
      active?: boolean;
      scope_filter?: Record<string, any>;
    }
  ) =>
    apiClient.patch<{ data: AllocationRule; message: string }>(
      `${BASE_URL}/allocation-rules/${id}`,
      data
    ),

  deleteAllocationRule: (id: number) => apiClient.delete(`${BASE_URL}/allocation-rules/${id}`),

  // Allocation Runs
  getAllocationRuns: (filters?: { status?: string; period_from?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.period_from) params.period_from = filters.period_from;
    return apiClient.get<{ data: AllocRun[]; meta: { total: number } }>(
      `${BASE_URL}/allocation-runs`,
      params
    );
  },

  getAllocationRun: (id: number, includeResults = true) => {
    const params: Record<string, string> = {};
    if (includeResults !== undefined) params.include_results = includeResults.toString();
    return apiClient.get<{ data: AllocRun }>(`${BASE_URL}/allocation-runs/${id}`, params);
  },

  executeAllocationRun: (data: {
    version_id?: number;
    forecast_id?: number;
    period_from: string;
    period_to: string;
  }) =>
    apiClient.post<{ data: AllocRun; message: string }>(`${BASE_URL}/allocation-runs`, data),

  deleteAllocationRun: (id: number) => apiClient.delete(`${BASE_URL}/allocation-runs/${id}`),

  // Cost-to-Serve
  getCostToServeMetrics: (filters?: {
    period_from?: string;
    period_to?: string;
    scheme_id?: number;
    dma_id?: number;
    class?: string;
  }) => {
    const params: Record<string, string> = {};
    if (filters?.period_from) params.period_from = filters.period_from;
    if (filters?.period_to) params.period_to = filters.period_to;
    if (filters?.scheme_id) params.scheme_id = filters.scheme_id.toString();
    if (filters?.dma_id) params.dma_id = filters.dma_id.toString();
    if (filters?.class) params.class = filters.class;
    return apiClient.get<{ data: CostToServe[]; meta: { total: number } }>(
      `${BASE_URL}/cost-to-serve`,
      params
    );
  },

  calculateCostToServe: (data: {
    period: string;
    scheme_id?: number;
    dma_id?: number;
    class?: string;
    production_m3: number;
    billed_m3: number;
    revenue?: number;
  }) =>
    apiClient.post<{ data: CostToServe; message: string }>(`${BASE_URL}/cost-to-serve`, data),

  getCostToServeSummary: (filters?: {
    period_from?: string;
    period_to?: string;
    scheme_id?: number;
  }) => {
    const params: Record<string, string> = {};
    if (filters?.period_from) params.period_from = filters.period_from;
    if (filters?.period_to) params.period_to = filters.period_to;
    if (filters?.scheme_id) params.scheme_id = filters.scheme_id.toString();
    return apiClient.get<{ data: CostToServeSummary }>(
      `${BASE_URL}/cost-to-serve/summary`,
      params
    );
  },

  getDmaLeagueTable: (period: string) =>
    apiClient.get<{ data: DmaLeagueEntry[] }>(`${BASE_URL}/cost-to-serve/dma-league/${period}`),

  getCostToServeTrends: (filters?: {
    period_from?: string;
    period_to?: string;
    scheme_id?: number;
    dma_id?: number;
  }) => {
    const params: Record<string, string> = {};
    if (filters?.period_from) params.period_from = filters.period_from;
    if (filters?.period_to) params.period_to = filters.period_to;
    if (filters?.scheme_id) params.scheme_id = filters.scheme_id.toString();
    if (filters?.dma_id) params.dma_id = filters.dma_id.toString();
    return apiClient.get<{ data: TrendDataPoint[] }>(
      `${BASE_URL}/cost-to-serve/trends`,
      params
    );
  },
};
