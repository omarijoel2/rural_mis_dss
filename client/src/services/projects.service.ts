import { apiClient } from '../lib/api-client';

const BASE_URL = '/api/v1';

// ===================================
// PROJECT MANAGEMENT INTERFACES
// ===================================

export interface Project {
  id: number;
  tenant_id: string;
  code: string;
  name: string;
  description: string | null;
  category: 'new_scheme' | 'extension' | 'rehabilitation' | 'upgrade' | 'emergency';
  estimated_cost: number;
  budget_year: number;
  start_date: string | null;
  end_date: string | null;
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
  category?: string;
  budget_year?: number;
  search?: string;
}

// ===================================
// INVESTMENT PLANNING INTERFACES
// ===================================

export interface InvestmentPipeline {
  id: number;
  tenant_id: string;
  name: string;
  description: string | null;
  category: 'new_scheme' | 'extension' | 'rehabilitation' | 'upgrade' | 'emergency';
  priority: 'high' | 'medium' | 'low';
  estimated_cost: number;
  estimated_benefits: number | null;
  discount_rate: number | null;
  project_life_years: number | null;
  location: { type: string; coordinates: [number, number] } | null;
  beneficiaries: number | null;
  status: 'active' | 'shortlisted' | 'approved' | 'rejected' | 'converted';
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineScore {
  id: number;
  pipeline_id: number;
  criteria_id: number;
  score: number;
  scored_by: string | null;
  scored_at: string;
  notes: string | null;
}

export interface Appraisal {
  id: number;
  pipeline_id: number;
  costs: Record<string, any>;
  benefits: Record<string, any>;
  discount_rate: number;
  project_life: number;
  npv: number;
  bcr: number;
  irr: number | null;
  payback_period: number | null;
  appraiser_id: string | null;
  appraisal_date: string;
  notes: string | null;
  created_at: string;
}

export interface InvestmentFilters {
  status?: string;
  category?: string;
  priority?: string;
}

// ===================================
// LAND ADMINISTRATION INTERFACES
// ===================================

export interface LandParcel {
  id: number;
  tenant_id: string;
  ref_no: string;
  title_deed_no: string | null;
  area_ha: number;
  owner_name: string;
  owner_contact: string | null;
  boundary: { type: string; coordinates: any };
  county: string | null;
  sub_county: string | null;
  ward: string | null;
  category_id: number | null;
  project_id: number | null;
  acquisition_status: 'identified' | 'valuation' | 'negotiation' | 'acquired' | 'disputed';
  notes: string | null;
  created_by: string;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Wayleave {
  id: number;
  tenant_id: string;
  parcel_id: number;
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
  id: number;
  tenant_id: string;
  parcel_id: number;
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
  id: number;
  tenant_id: string;
  parcel_id: number;
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
  category_id?: number;
  project_id?: number;
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

  async getProject(id: number): Promise<Project> {
    const response = await apiClient.get(`${BASE_URL}/projects/${id}`);
    return response.data;
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const response = await apiClient.post(`${BASE_URL}/projects`, data);
    return response.data;
  },

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    const response = await apiClient.patch(`${BASE_URL}/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: number): Promise<void> {
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

  async getPipeline(id: number): Promise<InvestmentPipeline> {
    const response = await apiClient.get(`${BASE_URL}/investments/${id}`);
    return response.data;
  },

  async createPipeline(data: Partial<InvestmentPipeline>): Promise<InvestmentPipeline> {
    const response = await apiClient.post(`${BASE_URL}/investments`, data);
    return response.data;
  },

  async updatePipeline(id: number, data: Partial<InvestmentPipeline>): Promise<InvestmentPipeline> {
    const response = await apiClient.patch(`${BASE_URL}/investments/${id}`, data);
    return response.data;
  },

  async deletePipeline(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/investments/${id}`);
  },

  async scorePipeline(id: number, criteria_id: number, score: number, notes?: string): Promise<PipelineScore> {
    const response = await apiClient.post(`${BASE_URL}/investments/${id}/score`, {
      criteria_id,
      score,
      notes,
    });
    return response.data;
  },

  async getPipelineScores(id: number): Promise<PipelineScore[]> {
    const response = await apiClient.get(`${BASE_URL}/investments/${id}/scores`);
    return response.data;
  },

  async createAppraisal(
    id: number,
    costs: Record<string, any>,
    benefits: Record<string, any>,
    discount_rate: number,
    project_life: number
  ): Promise<Appraisal> {
    const response = await apiClient.post(`${BASE_URL}/investments/${id}/appraisal`, {
      costs,
      benefits,
      discount_rate,
      project_life,
    });
    return response.data;
  },

  async getPipelineAppraisals(id: number): Promise<Appraisal[]> {
    const response = await apiClient.get(`${BASE_URL}/investments/${id}/appraisals`);
    return response.data;
  },

  async convertToProject(id: number): Promise<Project> {
    const response = await apiClient.post(`${BASE_URL}/investments/${id}/convert`);
    return response.data;
  },

  // Land Parcels
  async getLandParcels(filters?: LandFilters): Promise<LandParcel[]> {
    const response = await apiClient.get(`${BASE_URL}/land`, { params: filters });
    return response.data;
  },

  async getLandParcel(id: number): Promise<LandParcel> {
    const response = await apiClient.get(`${BASE_URL}/land/${id}`);
    return response.data;
  },

  async createLandParcel(data: Partial<LandParcel>): Promise<LandParcel> {
    const response = await apiClient.post(`${BASE_URL}/land`, data);
    return response.data;
  },

  async updateLandParcel(id: number, data: Partial<LandParcel>): Promise<LandParcel> {
    const response = await apiClient.patch(`${BASE_URL}/land/${id}`, data);
    return response.data;
  },

  async deleteLandParcel(id: number): Promise<void> {
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
  async createWayleave(parcelId: number, data: Partial<Wayleave>): Promise<Wayleave> {
    const response = await apiClient.post(`${BASE_URL}/land/${parcelId}/wayleaves`, data);
    return response.data;
  },

  async updateWayleave(parcelId: number, id: number, data: Partial<Wayleave>): Promise<Wayleave> {
    const response = await apiClient.patch(`${BASE_URL}/land/${parcelId}/wayleaves/${id}`, data);
    return response.data;
  },

  async deleteWayleave(parcelId: number, id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/land/${parcelId}/wayleaves/${id}`);
  },

  // Compensations
  async createCompensation(parcelId: number, data: Partial<Compensation>): Promise<Compensation> {
    const response = await apiClient.post(`${BASE_URL}/land/${parcelId}/compensations`, data);
    return response.data;
  },

  async updateCompensation(parcelId: number, id: number, data: Partial<Compensation>): Promise<Compensation> {
    const response = await apiClient.patch(`${BASE_URL}/land/${parcelId}/compensations/${id}`, data);
    return response.data;
  },

  async updateCompensationPayment(
    parcelId: number,
    id: number,
    payment: { amount: number; payment_date: string; payment_reference: string }
  ): Promise<Compensation> {
    const response = await apiClient.patch(`${BASE_URL}/land/${parcelId}/compensations/${id}/payment`, payment);
    return response.data;
  },

  async deleteCompensation(parcelId: number, id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/land/${parcelId}/compensations/${id}`);
  },

  // Disputes
  async createDispute(parcelId: number, data: Partial<LandDispute>): Promise<LandDispute> {
    const response = await apiClient.post(`${BASE_URL}/land/${parcelId}/disputes`, data);
    return response.data;
  },

  async updateDispute(parcelId: number, id: number, data: Partial<LandDispute>): Promise<LandDispute> {
    const response = await apiClient.patch(`${BASE_URL}/land/${parcelId}/disputes/${id}`, data);
    return response.data;
  },

  async deleteDispute(parcelId: number, id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/land/${parcelId}/disputes/${id}`);
  },
};
