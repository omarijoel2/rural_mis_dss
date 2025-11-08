export interface AssetClass {
  id: number;
  name: string;
  category: string;
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
