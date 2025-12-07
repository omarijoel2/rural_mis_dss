import { apiClient } from '../lib/api-client';

const BASE_URL = '/crm';

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

export interface Complaint {
  id: number;
  tenant_id: number;
  customer_id: number;
  account_no: string;
  category: 'billing' | 'water_quality' | 'supply' | 'meter' | 'leak' | 'customer_service' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'triage' | 'field' | 'resolved' | 'closed';
  description?: string;
  resolution?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: number;
  tenant_id: number;
  customer_id: number;
  account_no: string;
  channel: 'phone' | 'email' | 'sms' | 'web_portal' | 'walk_in' | 'field_visit';
  subject: string;
  message: string;
  status: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  tenant_id: number;
  customer_id: number;
  account_no: string;
  content: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  createdBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface TicketCategory {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sla_response_hours: number;
  sla_resolution_hours: number;
  created_at: string;
  updated_at: string;
}

export interface CrmTicket {
  id: string;
  tenant_id: string;
  ticket_no: string;
  customer_id: string | null;
  category_id: string;
  channel: 'sms' | 'ussd' | 'whatsapp' | 'email' | 'phone' | 'app' | 'walk_in';
  subject: string;
  description: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'new' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  assigned_to: string | null;
  sla_response_due: string | null;
  sla_resolution_due: string | null;
  responded_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  csat_score: number | null;
  created_at: string;
  updated_at: string;
  category?: TicketCategory;
  customer?: Customer;
  assigned_to_user?: {
    id: string;
    name: string;
    email: string;
  };
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

  getComplaints: (filters?: { status?: string; category?: string; priority?: string; account_no?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.category) params.category = filters.category;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.account_no) params.account_no = filters.account_no;
    return apiClient.get<{ data: Complaint[] }>(`${BASE_URL}/complaints`, params);
  },

  getComplaint: (id: number) =>
    apiClient.get<Complaint>(`${BASE_URL}/complaints/${id}`),

  createComplaint: (data: Partial<Complaint>) =>
    apiClient.post<Complaint>(`${BASE_URL}/complaints`, data),

  updateComplaint: (id: number, data: Partial<Complaint>) =>
    apiClient.patch<Complaint>(`${BASE_URL}/complaints/${id}`, data),

  getInteractions: (filters?: { channel?: string; account_no?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.channel) params.channel = filters.channel;
    if (filters?.account_no) params.account_no = filters.account_no;
    return apiClient.get<{ data: Interaction[] }>(`${BASE_URL}/interactions`, params);
  },

  getInteraction: (id: number) =>
    apiClient.get<Interaction>(`${BASE_URL}/interactions/${id}`),

  createInteraction: (data: Partial<Interaction>) =>
    apiClient.post<Interaction>(`${BASE_URL}/interactions`, data),

  getNotes: (filters?: { account_no?: string; customer_id?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.account_no) params.account_no = filters.account_no;
    if (filters?.customer_id) params.customer_id = filters.customer_id.toString();
    return apiClient.get<{ data: Note[] }>(`${BASE_URL}/notes`, params);
  },

  getNote: (id: number) =>
    apiClient.get<Note>(`${BASE_URL}/notes/${id}`),

  createNote: (data: Partial<Note>) =>
    apiClient.post<Note>(`${BASE_URL}/notes`, data),

  updateNote: (id: number, data: Partial<Note>) =>
    apiClient.patch<Note>(`${BASE_URL}/notes/${id}`, data),

  deleteNote: (id: number) =>
    apiClient.delete(`${BASE_URL}/notes/${id}`),

  getTickets: (filters?: { status?: string; priority?: string; assigned_to?: string; per_page?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.assigned_to) params.assigned_to = filters.assigned_to;
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    return apiClient.get<{ data: CrmTicket[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }>(`${BASE_URL}/tickets`, params);
  },

  getTicket: (id: string) =>
    apiClient.get<{ data: CrmTicket }>(`${BASE_URL}/tickets/${id}`),

  createTicket: (data: { category_id: string; channel: string; subject: string; description?: string; priority?: string; customer_id?: string }) =>
    apiClient.post<{ data: CrmTicket }>(`${BASE_URL}/tickets`, data),

  updateTicket: (id: string, data: { status?: string; priority?: string; assigned_to?: string }) =>
    apiClient.patch<{ data: CrmTicket }>(`${BASE_URL}/tickets/${id}`, data),

  deleteTicket: (id: string) =>
    apiClient.delete(`${BASE_URL}/tickets/${id}`),

  getTicketCategories: () =>
    apiClient.get<{ data: TicketCategory[] }>(`${BASE_URL}/tickets/categories`),
};
