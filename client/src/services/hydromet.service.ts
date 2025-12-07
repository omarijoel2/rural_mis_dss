import { apiClient } from '../lib/api-client';

const BASE_URL = '/hydromet';

export interface SourceKind {
  id: number;
  name: string;
  description: string | null;
}

export interface SourceStatus {
  id: number;
  name: string;
  description: string | null;
}

export interface QualityRiskLevel {
  id: number;
  name: string;
  description: string | null;
}

export interface Source {
  id: number;
  tenant_id: string;
  scheme_id: string | null;
  code: string;
  name: string;
  kind_id: number;
  status_id: number;
  catchment: string | null;
  elevation_m: number | null;
  depth_m: number | null;
  static_level_m: number | null;
  dynamic_level_m: number | null;
  capacity_m3_per_day: number | null;
  permit_no: string | null;
  permit_expiry: string | null;
  quality_risk_id: number | null;
  location: { type: string; coordinates: [number, number] } | null;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  kind?: SourceKind;
  status?: SourceStatus;
  quality_risk?: QualityRiskLevel;
}

export interface AbstractionLog {
  id: number;
  source_id: number;
  scheme_id: string | null;
  logged_at: string;
  volume_m3: number;
  method: 'metered' | 'estimated' | 'calculated';
  quality: 'good' | 'fair' | 'poor';
  logged_by: string | null;
  meta: Record<string, any> | null;
  created_at: string;
}

export interface StationType {
  id: number;
  name: string;
  description: string | null;
}

export interface SensorType {
  id: number;
  name: string;
  unit: string;
  description: string | null;
}

export interface SensorStatus {
  id: number;
  name: string;
  description: string | null;
}

export interface HydrometStation {
  id: number;
  tenant_id: string;
  scheme_id: string | null;
  code: string;
  name: string;
  station_type_id: number;
  datasource_id: number;
  elevation_m: number | null;
  active: boolean;
  location: { type: string; coordinates: [number, number] } | null;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  station_type?: StationType;
  sensors?: HydrometSensor[];
}

export interface HydrometSensor {
  id: number;
  station_id: number;
  parameter_id: number;
  make: string | null;
  model: string | null;
  serial_number: string | null;
  multiplier: number | null;
  offset: number | null;
  installed_at: string | null;
  calibrated_at: string | null;
  active: boolean;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface SourceFilters {
  scheme_id?: string;
  kind_id?: number;
  status_id?: number;
  search?: string;
  per_page?: number;
}

export interface StationFilters {
  scheme_id?: string;
  station_type_id?: number;
  active?: boolean;
  search?: string;
  per_page?: number;
}

export interface SpatialQuery {
  lat: number;
  lon: number;
  radius?: number;
}

export interface BoundsQuery {
  min_lat: number;
  min_lon: number;
  max_lat: number;
  max_lon: number;
}

export interface CreateSourceData {
  name: string;
  code: string;
  kind_id: number;
  status_id: number;
  scheme_id?: string;
  catchment?: string;
  elevation_m?: number;
  depth_m?: number;
  static_level_m?: number;
  dynamic_level_m?: number;
  capacity_m3_per_day?: number;
  permit_no?: string;
  permit_expiry?: string;
  quality_risk_id?: number;
  latitude?: number;
  longitude?: number;
  meta?: Record<string, any>;
}

export interface CreateStationData {
  name: string;
  code: string;
  station_type_id: number;
  datasource_id: number;
  scheme_id?: string;
  elevation_m?: number;
  active?: boolean;
  latitude?: number;
  longitude?: number;
  meta?: Record<string, any>;
}

export interface CreateSensorData {
  parameter_id: number;
  make?: string;
  model?: string;
  serial_number?: string;
  multiplier?: number;
  offset?: number;
  installed_at?: string;
  calibrated_at?: string;
  active?: boolean;
  meta?: Record<string, any>;
}

export interface LogAbstractionData {
  scheme_id?: string;
  logged_at: string;
  volume_m3: number;
  method: 'metered' | 'estimated' | 'calculated';
  quality: 'good' | 'fair' | 'poor';
  logged_by?: string;
  meta?: Record<string, any>;
}

export const hydrometService = {
  getSources: (filters?: SourceFilters) => {
    const params: Record<string, string> = {};
    if (filters?.scheme_id) params.scheme_id = filters.scheme_id;
    if (filters?.kind_id) params.kind_id = filters.kind_id.toString();
    if (filters?.status_id) params.status_id = filters.status_id.toString();
    if (filters?.search) params.search = filters.search;
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    return apiClient.get<{ data: Source[] }>(`${BASE_URL}/sources`, params);
  },

  getSource: (id: number) =>
    apiClient.get<Source>(`${BASE_URL}/sources/${id}`),

  createSource: (data: CreateSourceData) =>
    apiClient.post<Source>(`${BASE_URL}/sources`, data),

  updateSource: (id: number, data: Partial<CreateSourceData>) =>
    apiClient.put<Source>(`${BASE_URL}/sources/${id}`, data),

  deleteSource: (id: number) =>
    apiClient.delete(`${BASE_URL}/sources/${id}`),

  bulkImportSources: (sources: Partial<CreateSourceData>[]) =>
    apiClient.post<{ imported: number; errors: string[]; sources: Source[] }>(
      `${BASE_URL}/sources/bulk-import`,
      { sources }
    ),

  getSourcesNearby: (query: SpatialQuery) => {
    const params: Record<string, string> = {
      lat: query.lat.toString(),
      lon: query.lon.toString(),
    };
    if (query.radius) params.radius = query.radius.toString();
    return apiClient.get<Source[]>(`${BASE_URL}/sources/nearby`, params);
  },

  getSourcesInBounds: (query: BoundsQuery) => {
    const params: Record<string, string> = {
      min_lat: query.min_lat.toString(),
      min_lon: query.min_lon.toString(),
      max_lat: query.max_lat.toString(),
      max_lon: query.max_lon.toString(),
    };
    return apiClient.get<Source[]>(`${BASE_URL}/sources/in-bounds`, params);
  },

  logAbstraction: (sourceId: number, data: LogAbstractionData) =>
    apiClient.post<AbstractionLog>(`${BASE_URL}/sources/${sourceId}/abstraction`, data),

  getAbstractionHistory: (sourceId: number, startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return apiClient.get<AbstractionLog[]>(`${BASE_URL}/sources/${sourceId}/abstraction/history`, params);
  },

  getTotalAbstraction: (sourceId: number, startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return apiClient.get<{ total_m3: number }>(`${BASE_URL}/sources/${sourceId}/abstraction/total`, params);
  },

  getStations: (filters?: StationFilters) => {
    const params: Record<string, string> = {};
    if (filters?.scheme_id) params.scheme_id = filters.scheme_id;
    if (filters?.station_type_id) params.station_type_id = filters.station_type_id.toString();
    if (filters?.active !== undefined) params.active = filters.active.toString();
    if (filters?.search) params.search = filters.search;
    if (filters?.per_page) params.per_page = filters.per_page.toString();
    return apiClient.get<{ data: HydrometStation[] }>(`${BASE_URL}/stations`, params);
  },

  getStation: (id: number) =>
    apiClient.get<HydrometStation>(`${BASE_URL}/stations/${id}`),

  createStation: (data: CreateStationData) =>
    apiClient.post<HydrometStation>(`${BASE_URL}/stations`, data),

  updateStation: (id: number, data: Partial<CreateStationData>) =>
    apiClient.put<HydrometStation>(`${BASE_URL}/stations/${id}`, data),

  deleteStation: (id: number) =>
    apiClient.delete(`${BASE_URL}/stations/${id}`),

  getStationsNearby: (query: SpatialQuery) => {
    const params: Record<string, string> = {
      lat: query.lat.toString(),
      lon: query.lon.toString(),
    };
    if (query.radius) params.radius = query.radius.toString();
    return apiClient.get<HydrometStation[]>(`${BASE_URL}/stations/nearby`, params);
  },

  getStationsInBounds: (query: BoundsQuery) => {
    const params: Record<string, string> = {
      min_lat: query.min_lat.toString(),
      min_lon: query.min_lon.toString(),
      max_lat: query.max_lat.toString(),
      max_lon: query.max_lon.toString(),
    };
    return apiClient.get<HydrometStation[]>(`${BASE_URL}/stations/in-bounds`, params);
  },

  activateStation: (id: number) =>
    apiClient.post<{ message: string }>(`${BASE_URL}/stations/${id}/activate`, {}),

  deactivateStation: (id: number) =>
    apiClient.post<{ message: string }>(`${BASE_URL}/stations/${id}/deactivate`, {}),

  getSensors: (stationId: number, activeOnly?: boolean) => {
    const params: Record<string, string> = {};
    if (activeOnly !== undefined) params.active = activeOnly.toString();
    return apiClient.get<HydrometSensor[]>(`${BASE_URL}/stations/${stationId}/sensors`, params);
  },

  createSensor: (stationId: number, data: CreateSensorData) =>
    apiClient.post<HydrometSensor>(`${BASE_URL}/stations/${stationId}/sensors`, data),

  updateSensor: (stationId: number, sensorId: number, data: Partial<CreateSensorData>) =>
    apiClient.put<HydrometSensor>(`${BASE_URL}/stations/${stationId}/sensors/${sensorId}`, data),

  deleteSensor: (stationId: number, sensorId: number) =>
    apiClient.delete(`${BASE_URL}/stations/${stationId}/sensors/${sensorId}`),
};
