export interface Tenant {
  id: string;
  name: string;
  short_code: string;
  country: string;
  timezone: string;
  currency: string;
  logo_path?: string;
  status: 'active' | 'suspended';
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  tenant_id: string;
  org_code: string;
  name: string;
  type: 'authority' | 'utility' | 'department';
  email?: string;
  phone?: string;
  address?: string;
  geom?: GeoJSON.Polygon;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Scheme {
  id: string;
  tenant_id: string;
  org_id?: string;
  code: string;
  name: string;
  type: 'urban' | 'rural' | 'mixed';
  population_estimate?: number;
  status: 'active' | 'planning' | 'decommissioned';
  geom?: GeoJSON.Polygon;
  centroid?: GeoJSON.Point;
  elevation_m?: number;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
  organization?: Organization;
  tenant?: Tenant;
}

export interface Facility {
  id: string;
  tenant_id: string;
  scheme_id: string;
  code: string;
  name: string;
  category: 'source' | 'treatment' | 'pumpstation' | 'reservoir' | 'office' | 'workshop' | 'warehouse' | 'lab';
  status: 'active' | 'standby' | 'decommissioned';
  location?: GeoJSON.Point;
  address?: string;
  commissioned_on?: string;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
  scheme?: Scheme;
  tenant?: Tenant;
}

export interface Dma {
  id: string;
  tenant_id: string;
  scheme_id: string;
  code: string;
  name: string;
  status: 'active' | 'planned' | 'retired';
  geom?: GeoJSON.Polygon;
  nightline_threshold_m3h?: number;
  pressure_target_bar?: number;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
  scheme?: Scheme;
  tenant?: Tenant;
}

export interface Pipeline {
  id: string;
  tenant_id: string;
  scheme_id: string;
  code: string;
  material: 'uPVC' | 'HDPE' | 'DI' | 'AC' | 'GI' | 'Steel' | 'Other';
  diameter_mm: number;
  install_year?: number;
  status: 'active' | 'leak' | 'rehab' | 'abandoned';
  geom?: GeoJSON.LineString;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
  scheme?: Scheme;
  tenant?: Tenant;
}

export interface Zone {
  id: string;
  tenant_id: string;
  scheme_id?: string;
  type: string;
  code: string;
  name: string;
  geom?: GeoJSON.Polygon;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
  scheme?: Scheme;
  tenant?: Tenant;
}

export interface Address {
  id: string;
  tenant_id: string;
  scheme_id?: string;
  premise_code: string;
  street?: string;
  village?: string;
  ward?: string;
  subcounty?: string;
  city?: string;
  postcode?: string;
  country: string;
  location?: GeoJSON.Point;
  what3words?: string;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
  scheme?: Scheme;
  tenant?: Tenant;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}
