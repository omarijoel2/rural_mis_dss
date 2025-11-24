// Laravel API Integration Layer
const LARAVEL_API = 'http://127.0.0.1:8001/api/v1';

export async function apiCall(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${LARAVEL_API}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Laravel API unavailable (${endpoint}), using fallback`);
    return null;
  }
}

// Schemes API
export const schemesAPI = {
  list: () => apiCall('/schemes'),
  create: (data: any) => apiCall('/schemes', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: number) => apiCall(`/schemes/${id}`),
  update: (id: number, data: any) => apiCall(`/schemes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Assets API
export const assetsAPI = {
  list: (schemeId?: number) => apiCall(`/assets${schemeId ? `?scheme_id=${schemeId}` : ''}`),
  create: (data: any) => apiCall('/assets', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: number) => apiCall(`/assets/${id}`),
  update: (id: number, data: any) => apiCall(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// DMAs API
export const dmasAPI = {
  list: (schemeId?: number) => apiCall(`/dmas${schemeId ? `?scheme_id=${schemeId}` : ''}`),
  create: (data: any) => apiCall('/dmas', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: number) => apiCall(`/dmas/${id}`),
  update: (id: number, data: any) => apiCall(`/dmas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Telemetry API
export const telemetryAPI = {
  tags: () => apiCall('/telemetry/tags'),
  measurements: (tagId?: number, limit?: number) => 
    apiCall(`/telemetry/measurements${tagId ? `?tag_id=${tagId}&limit=${limit || 100}` : ''}`),
  recordMeasurement: (tagId: number, value: string) => 
    apiCall('/telemetry/measurements', { method: 'POST', body: JSON.stringify({ tag_id: tagId, value }) }),
};

// Predictions API
export const predictionsAPI = {
  assetFailures: () => apiCall('/predictions/asset-failures'),
  nrwAnomalies: () => apiCall('/predictions/nrw-anomalies'),
  demandForecast: (schemeId: number) => apiCall(`/predictions/demand-forecast/${schemeId}`),
  pumpSchedules: () => apiCall('/predictions/pump-schedule'),
  outageImpact: () => apiCall('/predictions/outage-impact'),
};

// Network Topology API
export const topologyAPI = {
  nodes: (schemeId: number) => apiCall(`/topology/schemes/${schemeId}/nodes`),
  edges: (schemeId: number) => apiCall(`/topology/schemes/${schemeId}/edges`),
};
