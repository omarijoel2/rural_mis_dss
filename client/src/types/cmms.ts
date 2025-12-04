export interface AssetClass {
  id: number;
  code: string;
  name: string;
  category?: string;
  parent_id?: number;
  criticality?: 'low' | 'medium' | 'high';
  attributes_schema?: Record<string, any>;
  icon?: string;
  description?: string;
  specs?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: number;
  tenant_id: string;
  code: string;
  name: string;
  class_id: number;
  scheme_id?: string;
  dma_id?: string;
  parent_id?: number;
  source_id?: number;
  kiosk_id?: number;
  status: 'active' | 'inactive' | 'retired' | 'under_maintenance';
  install_date?: string;
  barcode?: string;
  serial?: string;
  manufacturer?: string;
  model?: string;
  specs?: Record<string, any>;
  geom?: {
    type: 'Point';
    coordinates: [number, number];
  };
  created_at: string;
  updated_at: string;
  
  asset_class?: AssetClass;
  scheme?: {
    id: string;
    name: string;
  };
  dma?: {
    id: string;
    name: string;
  };
  parent?: Asset;
  children?: Asset[];
  work_orders?: WorkOrder[];
  pm_policies?: PmPolicy[];
  source?: {
    id: number;
    name: string;
    code: string;
  };
  kiosk?: {
    id: number;
    kiosk_code: string;
    vendor_name: string;
    location?: string;
  };
}

export interface Part {
  id: number;
  tenant_id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  unit_cost?: number;
  reorder_level?: number;
  supplier_id?: number;
  specs?: Record<string, any>;
  created_at: string;
  updated_at: string;
  
  supplier?: Supplier;
  stock_balance?: number;
}

export interface Supplier {
  id: number;
  tenant_id: string;
  code: string;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface PmPolicy {
  id: number;
  tenant_id: string;
  asset_id: number;
  title: string;
  description?: string;
  frequency_days: number;
  task_list?: string[];
  parts_required?: Array<{
    part_id: number;
    qty: number;
  }>;
  active: boolean;
  created_at: string;
  updated_at: string;
  
  asset?: Asset;
}

export interface WorkOrder {
  id: number;
  tenant_id: string;
  wo_num: string;
  kind: 'pm' | 'cm' | 'emergency' | 'project';
  asset_id?: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_for?: string;
  started_at?: string;
  completed_at?: string;
  completion_notes?: string;
  created_by: string;
  assigned_to?: string;
  pm_policy_id?: number;
  geom?: {
    type: 'Point';
    coordinates: [number, number];
  };
  created_at: string;
  updated_at: string;
  
  asset?: Asset;
  created_by_user?: {
    id: string;
    name: string;
  };
  assigned_to_user?: {
    id: string;
    name: string;
  };
  pm_policy?: PmPolicy;
  wo_parts?: WoPart[];
  wo_labor?: WoLabor[];
  total_cost?: number;
}

export interface WoPart {
  id: number;
  work_order_id: number;
  part_id: number;
  qty: number;
  unit_cost: number;
  created_at: string;
  updated_at: string;
  
  part?: Part;
}

export interface WoLabor {
  id: number;
  work_order_id: number;
  user_id: string;
  hours: number;
  hourly_rate: number;
  created_at: string;
  updated_at: string;
  
  user?: {
    id: string;
    name: string;
  };
}

export interface StockTxn {
  id: number;
  tenant_id: string;
  part_id: number;
  kind: 'receipt' | 'issue' | 'adjustment' | 'transfer';
  qty: number;
  unit_cost?: number;
  ref_type?: string;
  ref_id?: number;
  work_order_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  part?: Part;
  work_order?: WorkOrder;
}

export interface Failure {
  id: number;
  tenant_id: string;
  asset_id: number;
  work_order_id?: number;
  failure_date: string;
  description: string;
  cause?: string;
  corrective_action?: string;
  downtime_hours?: number;
  created_at: string;
  updated_at: string;
  
  asset?: Asset;
  work_order?: WorkOrder;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface AssetFilters {
  search?: string;
  status?: Asset['status'];
  class_id?: number;
  scheme_id?: string;
  dma_id?: string;
  parent_id?: number;
  per_page?: number;
  page?: number;
}

export interface WorkOrderFilters {
  search?: string;
  status?: WorkOrder['status'];
  kind?: WorkOrder['kind'];
  priority?: WorkOrder['priority'];
  asset_id?: number;
  assigned_to?: string;
  per_page?: number;
  page?: number;
}

export interface PartFilters {
  search?: string;
  category?: string;
  supplier_id?: number;
  per_page?: number;
  page?: number;
}

export interface CreateAssetDto {
  code: string;
  name: string;
  class_id: number;
  scheme_id?: string;
  dma_id?: string;
  parent_id?: number;
  source_id?: number;
  kiosk_id?: number;
  status: Asset['status'];
  install_date?: string;
  barcode?: string;
  serial?: string;
  manufacturer?: string;
  model?: string;
  specs?: Record<string, any>;
  geom?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface UpdateAssetDto extends Partial<CreateAssetDto> {}

export interface CreateWorkOrderDto {
  kind: WorkOrder['kind'];
  asset_id?: number;
  title: string;
  description?: string;
  priority: WorkOrder['priority'];
  scheduled_for?: string;
  assigned_to?: string;
  pm_policy_id?: number;
  geom?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface UpdateWorkOrderDto extends Partial<CreateWorkOrderDto> {
  status?: WorkOrder['status'];
}

export interface CreatePartDto {
  code: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  unit_cost?: number;
  reorder_level?: number;
  supplier_id?: number;
  specs?: Record<string, any>;
}

export interface UpdatePartDto extends Partial<CreatePartDto> {}

export interface AddPartsToWorkOrderDto {
  parts: Array<{
    part_id: number;
    qty: number;
    unit_cost: number;
  }>;
}

export interface AddLaborToWorkOrderDto {
  user_id: string;
  hours: number;
  hourly_rate: number;
}

export interface CompleteWorkOrderDto {
  completion_notes?: string;
}

export interface JobPlan {
  id: number;
  tenant_id: string;
  code: string;
  name: string;
  description?: string;
  asset_class_id?: number;
  version: number;
  status: 'draft' | 'active' | 'archived';
  sop?: string;
  checklist?: string[];
  required_tools?: string[];
  labor_roles?: string[];
  required_parts?: Array<{ part_id: number; qty: number }>;
  risk_notes?: string;
  permit_type?: string;
  estimated_hours?: number;
  estimated_cost?: number;
  created_at: string;
  updated_at: string;
  
  asset_class?: AssetClass;
}

export interface PmTemplate {
  id: number;
  tenant_id: string;
  asset_class_id: number;
  job_plan_id?: number;
  name: string;
  description?: string;
  trigger_type: 'time_based' | 'usage_based' | 'combined';
  frequency_days?: number;
  tolerance_days?: number;
  usage_counters?: Record<string, number>;
  is_active: boolean;
  checklist?: string[];
  kit?: Record<string, any>;
  next_gen_date?: string;
  created_at: string;
  updated_at: string;
  
  asset_class?: AssetClass;
  job_plan?: JobPlan;
}

export interface PmGenerationLog {
  id: number;
  pm_template_id: number;
  work_order_id?: number;
  asset_id: number;
  scheduled_date: string;
  status: 'generated' | 'completed' | 'deferred' | 'skipped';
  generated_at: string;
  created_at: string;
  updated_at: string;
  
  pm_template?: PmTemplate;
  work_order?: WorkOrder;
  asset?: Asset;
}

export interface PmDeferral {
  id: number;
  pm_generation_log_id: number;
  original_date: string;
  deferred_to: string;
  reason_code: string;
  notes?: string;
  deferred_by: string;
  deferred_at: string;
  created_at: string;
  updated_at: string;
}

export interface PmComplianceMetric {
  id: number;
  tenant_id: string;
  period_start: string;
  period_end: string;
  pm_scheduled: number;
  pm_completed_on_time: number;
  pm_completed_late: number;
  pm_deferred: number;
  pm_skipped: number;
  breakdown_wo: number;
  compliance_pct: number;
  pm_breakdown_ratio: number;
  created_at: string;
  updated_at: string;
}

export interface ConditionTag {
  id: number;
  asset_id: number;
  tag: string;
  parameter: string;
  unit: string;
  thresholds: {
    critical_low?: number;
    alarm_low?: number;
    warning_low?: number;
    warning_high?: number;
    alarm_high?: number;
    critical_high?: number;
  };
  last_value?: number;
  last_reading_at?: string;
  health_status: 'normal' | 'warning' | 'alarm' | 'critical';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  asset?: Asset;
  readings?: ConditionReading[];
  alarms?: ConditionAlarm[];
}

export interface ConditionReading {
  id: number;
  tag_id: number;
  value: number;
  source: string;
  read_at: string;
  created_at: string;
  updated_at: string;
  
  tag?: ConditionTag;
}

export interface ConditionAlarm {
  id: number;
  tag_id: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  state: 'active' | 'acknowledged' | 'cleared';
  raised_at: string;
  ack_by?: string;
  ack_at?: string;
  ack_notes?: string;
  cleared_at?: string;
  created_at: string;
  updated_at: string;
  
  tag?: ConditionTag;
}

export interface AssetHealthScore {
  id: number;
  asset_id: number;
  overall_score: number;
  condition_score: number;
  age_score: number;
  mtbf_days?: number;
  rul_days?: number;
  factors?: Record<string, any>;
  calculated_at: string;
  created_at: string;
  updated_at: string;
  
  asset?: Asset;
}

export interface PredictiveRule {
  id: number;
  tenant_id: string;
  asset_class_id: number;
  name: string;
  conditions: Array<{
    parameter: string;
    operator: string;
    threshold: number;
  }>;
  action: 'alert' | 'work_order' | 'alarm';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  asset_class?: AssetClass;
}

export interface PredictiveTrigger {
  id: number;
  rule_id: number;
  asset_id: number;
  triggered_at: string;
  details?: Record<string, any>;
  created_at: string;
  updated_at: string;
  
  rule?: PredictiveRule;
  asset?: Asset;
}

export interface Store {
  id: number;
  tenant_id: string;
  scheme_id?: string;
  name: string;
  type: 'central' | 'regional' | 'mobile' | 'quarantine';
  location?: string;
  manager_id?: string;
  created_at: string;
  updated_at: string;
  
  manager?: { id: string; name: string };
  bins?: Bin[];
}

export interface Bin {
  id: number;
  store_id: number;
  code: string;
  location?: string;
  type: 'shelf' | 'bin' | 'cage' | 'yard';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  store?: Store;
}

export interface InventoryLocation {
  id: number;
  part_id: number;
  bin_id: number;
  qty_on_hand: number;
  reorder_point: number;
  reorder_qty: number;
  created_at: string;
  updated_at: string;
  
  part?: Part;
  bin?: Bin;
}

export interface Kit {
  id: number;
  tenant_id: string;
  code: string;
  name: string;
  description?: string;
  items?: Array<{ part_id: number; qty: number }>;
  created_at: string;
  updated_at: string;
}

export interface FleetAsset {
  id: number;
  tenant_id: string;
  registration: string;
  type: 'truck' | 'van' | 'bike' | 'generator' | 'pump' | 'excavator' | 'other';
  make?: string;
  model?: string;
  year?: number;
  status: 'active' | 'maintenance' | 'retired';
  home_scheme_id?: string;
  operator_id?: string;
  odometer?: number;
  fuel_type?: string;
  created_at: string;
  updated_at: string;
  
  operator?: { id: string; name: string };
  home_scheme?: { id: string; name: string };
  service_schedules?: FleetServiceSchedule[];
  fuel_logs?: FuelLog[];
}

export interface FleetServiceSchedule {
  id: number;
  fleet_asset_id: number;
  service_type: string;
  interval_km?: number;
  interval_days?: number;
  next_service_km?: number;
  next_service_date?: string;
  created_at: string;
  updated_at: string;
  
  fleet_asset?: FleetAsset;
}

export interface FuelLog {
  id: number;
  fleet_asset_id: number;
  odometer: number;
  liters: number;
  cost: number;
  km_since_last?: number;
  consumption_rate?: number;
  filled_at: string;
  created_at: string;
  updated_at: string;
  
  fleet_asset?: FleetAsset;
}

export interface FleetUptimeLog {
  id: number;
  fleet_asset_id: number;
  date: string;
  hours_available: number;
  hours_used: number;
  hours_down: number;
  uptime_pct: number;
  down_reason?: string;
  created_at: string;
  updated_at: string;
  
  fleet_asset?: FleetAsset;
}

export interface ServiceContract {
  id: number;
  tenant_id: string;
  contract_num: string;
  vendor_name: string;
  type: 'maintenance' | 'construction' | 'supply' | 'consulting';
  scope?: string;
  start_date: string;
  end_date: string;
  value: number;
  status: 'draft' | 'active' | 'completed' | 'terminated';
  sla_response_hours?: number;
  sla_resolution_hours?: number;
  paid_to_date?: number;
  created_at: string;
  updated_at: string;
  
  violations?: SlaViolation[];
  payments?: ContractPayment[];
}

export interface SlaViolation {
  id: number;
  service_contract_id: number;
  violation_type: 'response_time' | 'resolution_time' | 'quality' | 'safety';
  description: string;
  occurred_at: string;
  severity: 'minor' | 'major' | 'critical';
  created_at: string;
  updated_at: string;
  
  service_contract?: ServiceContract;
}

export interface ContractPayment {
  id: number;
  service_contract_id: number;
  amount: number;
  payment_date: string;
  invoice_ref?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  service_contract?: ServiceContract;
}

export interface VendorScorecard {
  id: number;
  tenant_id: string;
  vendor_name: string;
  period_start: string;
  period_end: string;
  work_orders_completed: number;
  work_orders_on_time: number;
  sla_violations: number;
  quality_score: number;
  timeliness_score: number;
  compliance_score: number;
  overall_score: number;
  created_at: string;
  updated_at: string;
}

export interface Permit {
  id: number;
  tenant_id: string;
  work_order_id?: number;
  permit_type: 'hot_work' | 'confined_space' | 'loto' | 'working_at_height' | 'excavation';
  description: string;
  precautions?: string[];
  valid_from: string;
  valid_until: string;
  status: 'pending' | 'approved' | 'rejected' | 'closed';
  requested_by: string;
  approved_by?: string;
  approved_at?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
  
  work_order?: WorkOrder;
  requested_by_user?: { id: string; name: string };
  approvals?: PermitApproval[];
}

export interface PermitApproval {
  id: number;
  permit_id: number;
  approver_id: string;
  approved: boolean;
  comments?: string;
  approved_at: string;
  created_at: string;
  updated_at: string;
  
  permit?: Permit;
  approver?: { id: string; name: string };
}

export interface RiskAssessment {
  id: number;
  tenant_id: string;
  work_order_id?: number;
  hazard: string;
  likelihood: number;
  severity: number;
  risk_level: 'low' | 'medium' | 'high';
  controls?: string[];
  residual_likelihood?: number;
  residual_severity?: number;
  created_at: string;
  updated_at: string;
  
  work_order?: WorkOrder;
}

export interface Incident {
  id: number;
  tenant_id: string;
  occurred_at: string;
  location: string;
  category: 'injury' | 'near_miss' | 'property_damage' | 'environmental' | 'other';
  severity: 'minor' | 'moderate' | 'serious' | 'fatal';
  description: string;
  immediate_actions?: string;
  root_cause?: string;
  corrective_actions?: string;
  status: 'open' | 'investigated' | 'closed';
  reported_by: string;
  investigated_at?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
  
  reported_by_user?: { id: string; name: string };
}

export interface Capa {
  id: number;
  tenant_id: string;
  incident_id?: number;
  type: 'corrective' | 'preventive';
  description: string;
  assigned_to?: string;
  due_date: string;
  status: 'open' | 'completed';
  completion_notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  
  incident?: Incident;
  assigned_to_user?: { id: string; name: string };
}

export interface WoChecklistItem {
  id: number;
  work_order_id: number;
  seq: number;
  step: string;
  result: 'pass' | 'fail' | 'na' | 'pending';
  notes?: string;
  photo_path?: string;
  completed_by?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  
  work_order?: WorkOrder;
  completed_by_user?: { id: string; name: string };
}

export interface WoAttachment {
  id: number;
  work_order_id: number;
  type: 'photo' | 'video' | 'drawing' | 'telemetry_trace' | 'redline' | 'document';
  file_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  caption?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  
  work_order?: WorkOrder;
  uploaded_by_user?: { id: string; name: string };
}

export interface WoTransition {
  id: number;
  work_order_id: number;
  from_status: string;
  to_status: string;
  transitioned_by: string;
  notes?: string;
  transitioned_at: string;
  created_at: string;
  updated_at: string;
  
  work_order?: WorkOrder;
  transitioned_by_user?: { id: string; name: string };
}

export interface WoAssignment {
  id: number;
  work_order_id: number;
  user_id: string;
  role: 'primary' | 'secondary' | 'supervisor' | 'observer';
  assigned_at: string;
  assigned_by: string;
  created_at: string;
  updated_at: string;
  
  work_order?: WorkOrder;
  user?: { id: string; name: string };
  assigned_by_user?: { id: string; name: string };
}

export interface WoComment {
  id: number;
  work_order_id: number;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  
  work_order?: WorkOrder;
  user?: { id: string; name: string };
}
