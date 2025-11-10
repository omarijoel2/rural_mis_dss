import { apiClient } from '../lib/api-client';

const BASE_URL = '/api/v1';

// ===================================
// PROJECT MANAGEMENT INTERFACES
// ===================================

export interface Project {
  id: string;
  tenant_id: string;
  code: string;
  title: string;
  description: string | null;
  program_id: string | null;
  category_id: string | null;
  pipeline_id: string | null;
  pm_id: string | null;
  baseline_budget: number;
  revised_budget: number | null;
  baseline_start_date: string | null;
  baseline_end_date: string | null;
  revised_start_date: string | null;
  revised_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  physical_progress: number;
  financial_progress: number;
  status: 'planning' | 'tendering' | 'execution' | 'suspended' | 'completed' | 'closed';
  location: { type: string; coordinates: any } | null;
  created_by: string;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProjectFilters {
  status?: string;
  category_id?: string;
  program_id?: string;
  search?: string;
}

// ===================================
// INVESTMENT PLANNING INTERFACES
// ===================================

export interface InvestmentPipeline {
  id: string;
  tenant_id: string;
  code: string | null;
  title: string;
  description: string | null;
  program_id: string | null;
  category_id: string | null;
  estimated_cost: number;
  currency: string | null;
  connections_added: number | null;
  energy_savings: number | null;
  nrw_reduction: number | null;
  revenue_increase: number | null;
  bcr: number | null;
  npv: number | null;
  irr: number | null;
  risk_reduction_score: number | null;
  priority_score: number | null;
  status: 'active' | 'shortlisted' | 'approved' | 'rejected' | 'converted';
  location: { type: string; coordinates: any } | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineScore {
  id: string;
  pipeline_id: string;
  criterion_id: string;
  raw_score: number;
  weighted_score: number;
  rationale: string | null;
  scored_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvestmentAppraisal {
  id: string;
  pipeline_id: string;
  appraisal_no: string;
  appraiser_id: string;
  appraisal_date: string;
  executive_summary: string | null;
  capex: number;
  opex_annual: number | null;
  project_life_years: number;
  discount_rate: number;
  calculated_npv: number | null;
  calculated_bcr: number | null;
  calculated_irr: number | null;
  risks: string | null;
  assumptions: string | null;
  recommendation: 'approve' | 'reject' | 'defer' | 'revise' | null;
  recommendation_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  cash_flows: Record<string, any> | null;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface InvestmentFilters {
  status?: string;
  category_id?: string;
}

// ===================================
// LAND ADMINISTRATION INTERFACES
// ===================================

export interface LandParcel {
  id: string;
  tenant_id: string;
  ref_no: string;
  title_number: string | null;
  title_status: string | null;
  area_ha: number;
  owner_name: string;
  owner_contact: string | null;
  boundary: { type: string; coordinates: any };
  county: string | null;
  sub_county: string | null;
  ward: string | null;
  category_id: string | null;
  project_id: string | null;
  acquisition_status: 'identified' | 'valuation' | 'negotiation' | 'acquired' | 'disputed';
  notes: string | null;
  created_by: string;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Wayleave {
  id: string;
  tenant_id: string;
  parcel_id: string;
  wayleave_no: string;
  type: 'pipeline' | 'power_line' | 'access_road' | 'temporary' | 'other';
  width_m: number | null;
  length_m: number | null;
  agreement_date: string | null;
  expiry_date: string | null;
  status: 'pending' | 'active' | 'expired' | 'terminated' | 'disputed';
  annual_fee: number | null;
  terms: string | null;
  documents: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface Compensation {
  id: string;
  tenant_id: string;
  parcel_id: string;
  comp_no: string;
  valuation_amount: number;
  negotiated_amount: number | null;
  paid_amount: number;
  comp_type: 'land_acquisition' | 'crops' | 'structures' | 'disturbance' | 'other';
  valuation_date: string;
  payment_date: string | null;
  payment_reference: string | null;
  status: 'valued' | 'negotiated' | 'approved' | 'paid' | 'disputed';
  valuation_notes: string | null;
  valued_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface LandDispute {
  id: string;
  tenant_id: string;
  parcel_id: string;
  dispute_no: string;
  description: string;
  type: 'ownership' | 'boundary' | 'compensation' | 'wayleave' | 'other';
  raised_date: string;
  resolved_date: string | null;
  status: 'open' | 'mediation' | 'legal' | 'resolved' | 'closed';
  claimant_name: string | null;
  claimant_contact: string | null;
  resolution_notes: string | null;
  settlement_amount: number | null;
  handled_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LandFilters {
  status?: string;
  category_id?: string;
  project_id?: string;
  search?: string;
}

// ===================================
// PROJECT MANAGEMENT API
// ===================================

export const projectsService = {
  // Projects
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    const response = await apiClient.get(`${BASE_URL}/projects`, { params: filters });
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await apiClient.get(`${BASE_URL}/projects/${id}`);
    return response.data;
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const response = await apiClient.post(`${BASE_URL}/projects`, data);
    return response.data;
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await apiClient.patch(`${BASE_URL}/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/projects/${id}`);
  },

  async getProjectDashboard(): Promise<any> {
    const response = await apiClient.get(`${BASE_URL}/projects/dashboard`);
    return response.data;
  },

  // Investment Pipelines
  async getPipelines(filters?: InvestmentFilters): Promise<InvestmentPipeline[]> {
    const response = await apiClient.get(`${BASE_URL}/investments`, { params: filters });
    return response.data;
  },

  async getPipeline(id: string): Promise<InvestmentPipeline> {
    const response = await apiClient.get(`${BASE_URL}/investments/${id}`);
    return response.data;
  },

  async createPipeline(data: Partial<InvestmentPipeline>): Promise<InvestmentPipeline> {
    const response = await apiClient.post(`${BASE_URL}/investments`, data);
    return response.data;
  },

  async updatePipeline(id: string, data: Partial<InvestmentPipeline>): Promise<InvestmentPipeline> {
    const response = await apiClient.patch(`${BASE_URL}/investments/${id}`, data);
    return response.data;
  },

  async deletePipeline(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/investments/${id}`);
  },

  async scorePipeline(id: string, criterion_id: string, raw_score: number, weighted_score: number, rationale?: string): Promise<PipelineScore> {
    const response = await apiClient.post(`${BASE_URL}/investments/${id}/score`, {
      criterion_id,
      raw_score,
      weighted_score,
      rationale,
    });
    return response.data;
  },

  async getPipelineScores(id: string): Promise<PipelineScore[]> {
    const response = await apiClient.get(`${BASE_URL}/investments/${id}/scores`);
    return response.data;
  },

  async createAppraisal(
    id: string,
    data: {
      appraisal_no: string;
      capex: number;
      opex_annual?: number;
      project_life_years: number;
      discount_rate: number;
      executive_summary?: string;
      risks?: string;
      assumptions?: string;
      recommendation?: 'approve' | 'reject' | 'defer' | 'revise';
      recommendation_notes?: string;
      cash_flows?: Record<string, any>;
    }
  ): Promise<InvestmentAppraisal> {
    const response = await apiClient.post(`${BASE_URL}/investments/${id}/appraisal`, data);
    return response.data;
  },

  async getPipelineAppraisals(id: string): Promise<InvestmentAppraisal[]> {
    const response = await apiClient.get(`${BASE_URL}/investments/${id}/appraisals`);
    return response.data;
  },

  async convertToProject(id: string): Promise<Project> {
    const response = await apiClient.post(`${BASE_URL}/investments/${id}/convert`);
    return response.data;
  },

  // Land Parcels
  async getLandParcels(filters?: LandFilters): Promise<LandParcel[]> {
    const response = await apiClient.get(`${BASE_URL}/land`, { params: filters });
    return response.data;
  },

  async getLandParcel(id: string): Promise<LandParcel> {
    const response = await apiClient.get(`${BASE_URL}/land/${id}`);
    return response.data;
  },

  async createLandParcel(data: Partial<LandParcel>): Promise<LandParcel> {
    const response = await apiClient.post(`${BASE_URL}/land`, data);
    return response.data;
  },

  async updateLandParcel(id: string, data: Partial<LandParcel>): Promise<LandParcel> {
    const response = await apiClient.patch(`${BASE_URL}/land/${id}`, data);
    return response.data;
  },

  async deleteLandParcel(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/land/${id}`);
  },

  async getLandParcelsInBounds(bounds: {
    min_lat: number;
    max_lat: number;
    min_lng: number;
    max_lng: number;
  }): Promise<LandParcel[]> {
    const response = await apiClient.get(`${BASE_URL}/land/in-bounds`, { params: bounds });
    return response.data;
  },

  async getLandDashboard(): Promise<any> {
    const response = await apiClient.get(`${BASE_URL}/land/dashboard`);
    return response.data;
  },

  // Wayleaves
  async createWayleave(parcelId: string, data: Partial<Wayleave>): Promise<Wayleave> {
    const response = await apiClient.post(`${BASE_URL}/land/${parcelId}/wayleaves`, data);
    return response.data;
  },

  async updateWayleave(parcelId: string, id: string, data: Partial<Wayleave>): Promise<Wayleave> {
    const response = await apiClient.patch(`${BASE_URL}/land/${parcelId}/wayleaves/${id}`, data);
    return response.data;
  },

  async deleteWayleave(parcelId: string, id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/land/${parcelId}/wayleaves/${id}`);
  },

  // Compensations
  async createCompensation(parcelId: string, data: Partial<Compensation>): Promise<Compensation> {
    const response = await apiClient.post(`${BASE_URL}/land/${parcelId}/compensations`, data);
    return response.data;
  },

  async updateCompensation(parcelId: string, id: string, data: Partial<Compensation>): Promise<Compensation> {
    const response = await apiClient.patch(`${BASE_URL}/land/${parcelId}/compensations/${id}`, data);
    return response.data;
  },

  async updateCompensationPayment(
    parcelId: string,
    id: string,
    payment: { amount: number; payment_date: string; payment_reference: string }
  ): Promise<Compensation> {
    const response = await apiClient.patch(`${BASE_URL}/land/${parcelId}/compensations/${id}/payment`, payment);
    return response.data;
  },

  async deleteCompensation(parcelId: string, id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/land/${parcelId}/compensations/${id}`);
  },

  // Disputes
  async createDispute(parcelId: string, data: Partial<LandDispute>): Promise<LandDispute> {
    const response = await apiClient.post(`${BASE_URL}/land/${parcelId}/disputes`, data);
    return response.data;
  },

  async updateDispute(parcelId: string, id: string, data: Partial<LandDispute>): Promise<LandDispute> {
    const response = await apiClient.patch(`${BASE_URL}/land/${parcelId}/disputes/${id}`, data);
    return response.data;
  },

  async deleteDispute(parcelId: string, id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/land/${parcelId}/disputes/${id}`);
  },
};
