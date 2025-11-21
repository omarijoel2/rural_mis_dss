import { apiClient } from '../lib/api-client';

const BASE_URL = '/crm';

// Tariff Types
export interface Tariff {
  id: number;
  tenant_id: string;
  name: string;
  valid_from: string;
  valid_to: string | null;
  blocks: TariffBlock[];
  fixed_charge: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface TariffBlock {
  min: number;
  max: number | null;
  rate: number;
  lifeline?: boolean;
}

export interface TariffCalculation {
  tariff: string;
  consumption: number;
  fixed_charge: number;
  variable_charge: number;
  total_charge: number;
  currency: string;
  breakdown: Array<{
    block: string;
    consumption: number;
    rate: number;
    charge: number;
    lifeline: boolean;
  }>;
}

// Billing Types
export interface BillingRun {
  period: string;
  period_start: string;
  period_end: string;
  invoice_count: number;
  total_amount: number;
  created_at: string;
}

export interface BillingPreview {
  period_start: string;
  period_end: string;
  preview_count: number;
  total_estimated: number;
  accounts: Array<{
    account_no: string;
    customer_name: string;
    consumption: number;
    estimated_charge: number;
    tariff: string;
  }>;
}

// Payment Reconciliation Types
export interface Payment {
  id: number;
  tenant_id: string;
  account_no: string;
  paid_at: string;
  amount: number;
  channel: 'cash' | 'bank' | 'mpesa' | 'online' | 'adjustment';
  ref: string | null;
  meta: any;
  created_at: string;
  updated_at: string;
  connection?: any;
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
  dso: number;
  top_debtors: Array<{
    account_no: string;
    customer_name: string;
    balance: number;
    days_30: number;
    days_60: number;
    days_90: number;
    over_90: number;
    last_payment_date: string;
  }>;
  aging_buckets: Array<{
    bucket: string;
    amount: number;
  }>;
}

// Meter Route Types
export interface MeterRoute {
  id: number;
  route_code: string;
  area: string;
  assigned_to: string | null;
  meters_count: number;
  status: 'active' | 'unassigned' | 'inactive';
  last_read_date: string | null;
  completion_rate: number;
  created_at: string;
}

// Connection Types
export interface ConnectionApplication {
  id: number;
  application_no: string;
  applicant_name: string;
  phone: string;
  address: string;
  status: 'kyc_pending' | 'pending_approval' | 'approved' | 'rejected' | 'connected';
  estimated_cost: number;
  applied_date: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
}

// Kiosk Types
export interface Kiosk {
  id: number;
  kiosk_code: string;
  vendor_name: string;
  vendor_phone: string;
  location: string;
  coordinates: { lat: number; lng: number };
  status: 'active' | 'suspended' | 'inactive';
  daily_target: number;
  today_sales: number;
  balance: number;
  last_sale_date: string | null;
  created_at: string;
}

export interface KioskSales {
  kiosk_id: number;
  sales: Array<{
    date: string;
    volume: number;
    amount: number;
    transactions: number;
  }>;
  total_volume: number;
  total_amount: number;
  total_transactions: number;
  average_daily: number;
}

export const commercialService = {
  // Tariff Services
  getTariffs: (params?: { status?: 'active' | 'expired' | 'future'; search?: string; per_page?: number }) =>
    apiClient.get<any>(`${BASE_URL}/tariffs`, { params }),
  
  getTariff: (id: number) =>
    apiClient.get<Tariff>(`${BASE_URL}/tariffs/${id}`),
  
  createTariff: (data: Partial<Tariff>) =>
    apiClient.post<Tariff>(`${BASE_URL}/tariffs`, data),
  
  updateTariff: (id: number, data: Partial<Tariff>) =>
    apiClient.patch<Tariff>(`${BASE_URL}/tariffs/${id}`, data),
  
  deleteTariff: (id: number) =>
    apiClient.delete(`${BASE_URL}/tariffs/${id}`),
  
  calculateTariff: (tariffId: number, consumption: number) =>
    apiClient.post<TariffCalculation>(`${BASE_URL}/tariffs/calculate`, { tariff_id: tariffId, consumption }),

  // Billing Services
  getBillingRuns: (params?: { per_page?: number }) =>
    apiClient.get<any>(`${BASE_URL}/billing/runs`, { params }),
  
  previewBilling: (data: { period_start: string; period_end: string; segment?: string; limit?: number }) =>
    apiClient.post<BillingPreview>(`${BASE_URL}/billing/preview`, data),
  
  executeBilling: (data: { period_start: string; period_end: string; due_date: string; segment?: string }) =>
    apiClient.post<any>(`${BASE_URL}/billing/execute`, data),

  // Payment Reconciliation Services
  getPayments: (params?: { channel?: string; date_from?: string; date_to?: string; status?: string; search?: string; per_page?: number }) =>
    apiClient.get<any>(`${BASE_URL}/reconciliation/payments`, { params }),
  
  reconcilePayment: (paymentId: number, invoiceIds: number[]) =>
    apiClient.post<any>(`${BASE_URL}/reconciliation/reconcile`, { payment_id: paymentId, invoice_ids: invoiceIds }),
  
  getAgingReport: () =>
    apiClient.get<AgingReport>(`${BASE_URL}/reconciliation/aging`),

  // Meter Route Services
  getMeterRoutes: (params?: { per_page?: number }) =>
    apiClient.get<any>(`${BASE_URL}/meter-routes`, { params }),
  
  createMeterRoute: (data: { route_code: string; area: string; assigned_to?: string; meters_count: number }) =>
    apiClient.post<MeterRoute>(`${BASE_URL}/meter-routes`, data),
  
  updateMeterRoute: (id: number, data: Partial<MeterRoute>) =>
    apiClient.patch<MeterRoute>(`${BASE_URL}/meter-routes/${id}`, data),
  
  deleteMeterRoute: (id: number) =>
    apiClient.delete(`${BASE_URL}/meter-routes/${id}`),
  
  downloadOfflinePackage: (id: number) =>
    apiClient.get<any>(`${BASE_URL}/meter-routes/${id}/offline`),
  
  uploadMeterReads: (id: number, reads: any[]) =>
    apiClient.post<any>(`${BASE_URL}/meter-routes/${id}/upload`, { reads }),

  // Connection Services
  getConnectionApplications: (params?: { status?: string; per_page?: number }) =>
    apiClient.get<any>(`${BASE_URL}/connections/applications`, { params }),
  
  submitApplication: (data: any) =>
    apiClient.post<ConnectionApplication>(`${BASE_URL}/connections/apply`, data),
  
  updateApplication: (id: number, data: { status?: string; kyc_status?: string; notes?: string }) =>
    apiClient.patch<any>(`${BASE_URL}/connections/applications/${id}`, data),
  
  getDisconnections: (params?: { reason?: string; per_page?: number }) =>
    apiClient.get<any>(`${BASE_URL}/connections/disconnections`, { params }),
  
  requestDisconnection: (data: { account_no: string; reason: string; scheduled_date: string; notes?: string }) =>
    apiClient.post<any>(`${BASE_URL}/connections/disconnect`, data),
  
  reconnectAccount: (data: { account_no: string; reconnection_fee: number; notes?: string }) =>
    apiClient.post<any>(`${BASE_URL}/connections/reconnect`, data),

  // Kiosk Services
  getKiosks: (params?: { status?: string; per_page?: number }) =>
    apiClient.get<any>(`${BASE_URL}/kiosks`, { params }),
  
  createKiosk: (data: Partial<Kiosk>) =>
    apiClient.post<Kiosk>(`${BASE_URL}/kiosks`, data),
  
  updateKiosk: (id: number, data: Partial<Kiosk>) =>
    apiClient.patch<Kiosk>(`${BASE_URL}/kiosks/${id}`, data),
  
  deleteKiosk: (id: number) =>
    apiClient.delete(`${BASE_URL}/kiosks/${id}`),
  
  getKioskSales: (id: number, params?: any) =>
    apiClient.get<KioskSales>(`${BASE_URL}/kiosks/${id}/sales`, { params }),
  
  getTrucks: (params?: any) =>
    apiClient.get<any>(`${BASE_URL}/kiosks/trucks`, { params }),
};
