import { apiClient } from '../lib/api-client';

const BASE_URL = '/api/v1/crm';

export interface Customer {
  id: number;
  tenant_id: number;
  first_name: string;
  last_name: string;
  id_number: string;
  phone: string;
  email: string | null;
  customer_type: 'residential' | 'commercial' | 'industrial' | 'public';
  created_at: string;
  updated_at: string;
  service_connections?: ServiceConnection[];
}

export interface Premise {
  id: number;
  tenant_id: number;
  scheme_id: number;
  dma_id: number | null;
  address: string;
  category: 'residential' | 'commercial' | 'industrial' | 'public';
  location: { type: string; coordinates: [number, number] };
  created_at: string;
  updated_at: string;
}

export interface ServiceConnection {
  id: number;
  premise_id: number;
  customer_id: number;
  account_no: string;
  tariff_id: number;
  status: 'active' | 'suspended' | 'disconnected';
  connected_at: string;
}

export interface AccountOverview {
  connection: ServiceConnection;
  customer: Customer;
  premise: Premise;
  balance: {
    balance: number;
    current: number;
    days_30: number;
    days_60: number;
    days_90: number;
    over_90: number;
  } | null;
  recent_invoices: any[];
  recent_payments: any[];
  latest_meter: any | null;
  recent_reads: any[];
  active_cases_count: number;
  open_complaints_count: number;
}

export interface BillingHistory {
  invoices: any[];
  payments: any[];
  balance_history: any[];
}

export interface ConsumptionAnalytics {
  consumption: Array<{
    period_start: string;
    period_end: string;
    consumption: number;
  }>;
  average: number;
  trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
}

export interface RaCase {
  id: number;
  account_no: string;
  rule_id: number;
  status: 'new' | 'triage' | 'field' | 'resolved' | 'closed_valid' | 'closed_false_positive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  detected_at: string;
  evidence: any;
}

export interface AgingReport {
  summary: {
    total_accounts: number;
    total_balance: number;
    current: number;
    days_30: number;
    days_60: number;
    days_90: number;
    over_90: number;
  };
  by_category: Record<string, any>;
}

export const crmService = {
  getCustomers: (filters?: { search?: string; per_page?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    return apiClient.get<{ data: Customer[] }>(`${BASE_URL}/customers`, params);
  },

  getCustomer: (id: number) =>
    apiClient.get<Customer>(`${BASE_URL}/customers/${id}`),

  createCustomer: (data: Partial<Customer>) =>
    apiClient.post<Customer>(`${BASE_URL}/customers`, data),

  updateCustomer: (id: number, data: Partial<Customer>) =>
    apiClient.put<Customer>(`${BASE_URL}/customers/${id}`, data),

  getPremises: (filters?: { search?: string; scheme_id?: number; category?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.scheme_id) params.scheme_id = filters.scheme_id.toString();
    if (filters?.category) params.category = filters.category;
    return apiClient.get<{ data: Premise[] }>(`${BASE_URL}/premises`, params);
  },

  getPremise: (id: number) =>
    apiClient.get<Premise>(`${BASE_URL}/premises/${id}`),

  getAccountOverview: (accountNo: string) =>
    apiClient.get<AccountOverview>(`${BASE_URL}/accounts/${accountNo}/overview`),

  getBillingHistory: (accountNo: string, months?: number) => {
    const params: Record<string, string> = {};
    if (months) params.months = months.toString();
    return apiClient.get<BillingHistory>(`${BASE_URL}/accounts/${accountNo}/billing`, params);
  },

  getConsumptionAnalytics: (accountNo: string, months?: number) => {
    const params: Record<string, string> = {};
    if (months) params.months = months.toString();
    return apiClient.get<ConsumptionAnalytics>(`${BASE_URL}/accounts/${accountNo}/analytics`, params);
  },

  getRaCases: (status?: string) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    return apiClient.get<{ data: RaCase[] }>(`${BASE_URL}/ra/cases`, params);
  },

  getHighPriorityCases: (limit = 20) => {
    const params = { limit: limit.toString() };
    return apiClient.get<{ data: RaCase[] }>(`${BASE_URL}/ra/cases/high-priority`, params);
  },

  triageCase: (caseId: number, data: { decision: string; notes?: string }) =>
    apiClient.post(`${BASE_URL}/ra/cases/${caseId}/triage`, data),

  getAgingReport: () =>
    apiClient.get<AgingReport>(`${BASE_URL}/dunning/aging`),

  getDisconnectionList: () =>
    apiClient.get<any[]>(`${BASE_URL}/dunning/disconnection-list`),

  generateDunningNotices: (agingBucket: string) =>
    apiClient.post(`${BASE_URL}/dunning/notices`, { aging_bucket: agingBucket }),

  importBilling: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`${BASE_URL}/import/billing`, formData);
  },

  importMpesa: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`${BASE_URL}/import/mpesa`, formData);
  },
};
