export interface NetworkNode {
  id: string;
  tenant_id: string;
  scheme_id: string;
  code: string;
  name: string;
  node_type: 'source' | 'reservoir' | 'treatment' | 'pump_station' | 'junction' | 'customer' | 'prv' | 'valve' | 'meter' | 'other';
  geom?: any;
  attributes?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NetworkEdge {
  id: string;
  tenant_id: string;
  scheme_id: string;
  code?: string;
  from_node_id: string;
  to_node_id: string;
  edge_type: 'pipe' | 'transmission' | 'distribution' | 'service' | 'virtual';
  diameter_mm?: number;
  length_m?: number;
  material?: string;
  geom?: any;
  attributes?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TelemetryTag {
  id: string;
  tenant_id: string;
  scheme_id?: string;
  asset_id?: string;
  facility_id?: string;
  tag_name: string;
  data_type: 'float' | 'int' | 'bool' | 'string';
  unit?: string;
  category?: string;
  thresholds?: {
    low_low?: number;
    low?: number;
    high?: number;
    high_high?: number;
  };
  enabled: boolean;
  created_at: string;
  updated_at: string;
  scheme?: any;
  asset?: any;
  facility?: any;
}

export interface TelemetryMeasurement {
  id: string;
  tag_id: string;
  timestamp: string;
  value: any;
  quality?: string;
  created_at: string;
}

export interface NrwSnapshot {
  id: string;
  tenant_id: string;
  dma_id: string;
  as_of: string;
  system_input_volume_m3: number;
  billed_authorized_m3: number;
  unbilled_authorized_m3?: number;
  apparent_losses_m3?: number;
  real_losses_m3?: number;
  nrw_m3: number;
  nrw_pct: number;
  created_at: string;
  updated_at: string;
  dma?: any;
}

export interface Intervention {
  id: string;
  tenant_id: string;
  dma_id?: string;
  asset_id?: string;
  type: 'leak_repair' | 'meter_replacement' | 'prv_tuning' | 'sectorization' | 'campaign' | 'other';
  date: string;
  estimated_savings_m3d?: number;
  cost?: number;
  responsible?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  dma?: any;
  asset?: any;
}

export interface Outage {
  id: string;
  tenant_id: string;
  scheme_id: string;
  dma_id?: string;
  code?: string;
  cause: 'planned' | 'fault' | 'water_quality' | 'power' | 'other';
  state: 'draft' | 'approved' | 'live' | 'restored' | 'post_mortem' | 'closed';
  starts_at: string;
  ends_at?: string;
  actual_restored_at?: string;
  estimated_customers_affected?: number;
  actual_customers_affected?: number;
  summary?: string;
  affected_geom?: any;
  affected_stats?: Record<string, any>;
  notifications?: Record<string, any>;
  isolation_plan?: Record<string, any>;
  created_at: string;
  updated_at: string;
  scheme?: any;
  dma?: any;
  audits?: OutageAudit[];
}

export interface OutageAudit {
  id: string;
  outage_id: string;
  event: string;
  meta?: Record<string, any>;
  user_id?: string;
  created_at: string;
  user?: any;
}

export interface DosePlan {
  id: string;
  tenant_id: string;
  scheme_id: string;
  asset_id?: string;
  chemical?: string;
  flow_bands?: Record<string, any>;
  thresholds?: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
  scheme?: any;
  asset?: any;
}

export interface ChemicalStock {
  id: string;
  tenant_id: string;
  scheme_id: string;
  facility_id?: string;
  chemical: string;
  qty_on_hand_kg: number;
  reorder_level_kg?: number;
  as_of: string;
  created_at: string;
  updated_at: string;
  scheme?: any;
  facility?: any;
}

export interface DoseChangeLog {
  id: string;
  dose_plan_id: string;
  user_id?: string;
  before: Record<string, any>;
  after: Record<string, any>;
  reason?: string;
  created_at: string;
  updated_at: string;
  dose_plan?: DosePlan;
  user?: any;
}

export interface PumpSchedule {
  id: string;
  tenant_id: string;
  asset_id: string;
  scheme_id: string;
  start_at: string;
  end_at: string;
  status: 'scheduled' | 'running' | 'completed' | 'cancelled';
  target_volume_m3?: number;
  actual_volume_m3?: number;
  energy_cost?: number;
  constraints?: Record<string, any>;
  source?: 'manual' | 'optimizer';
  created_at: string;
  updated_at: string;
  asset?: any;
  scheme?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface OperationsDashboard {
  active_outages: Outage[];
  active_schedules: PumpSchedule[];
  active_dose_plans: DosePlan[];
  alarm_tags: TelemetryTag[];
  kpis: {
    outages_count: number;
    schedules_count: number;
    dose_plans_count: number;
  };
}

export interface WaterBalanceCalculation {
  systemInput: number;
  authorizedConsumption: number;
  billedAuthorized: number;
  unbilledAuthorized: number;
  waterLosses: number;
  apparentLosses: number;
  realLosses: number;
  nrwVolume: number;
  nrwPercentage: number;
}
