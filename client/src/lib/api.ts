// Laravel API Integration Layer - Updated to use Express proxy with authentication
const API_BASE = '/api/v1';

export async function apiCall(endpoint: string, options?: RequestInit) {
  try {
    const token = localStorage.getItem('auth_token');
    // Normalize endpoint: if callers used '/api/...' (without v1) treat it as relative
    let ep = endpoint;
    if (typeof ep === 'string' && ep.startsWith('/api/') && !ep.startsWith('/api/v1')) {
      // strip the '/api' prefix so it becomes a relative path handled by API_BASE
      ep = ep.replace(/^\/api/, '');
    }

    // Allow absolute server paths or full URLs (keep /api/v1/* or absolute URLs untouched)
    const url = (typeof ep === 'string' && (ep.startsWith('http') || ep.startsWith('/api/v1')))
      ? ep
      : `${API_BASE}${ep.startsWith('/') ? ep : `/${ep}`}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      credentials: 'include',
      ...options,
    });
    if (!response.ok) {
      // Attempt to surface server validation/messages and attach payload
      let errMsg = `API error: ${response.status}`;
      let payload: any = null;
      try {
        payload = await response.json();
        if (payload?.message) errMsg = payload.message;
        else if (payload?.error) errMsg = payload.error;
        else if (payload?.errors) errMsg = Object.values(payload.errors).flat().join('; ');
      } catch (_) {
        // ignore JSON parse errors
      }
      const err: any = new Error(errMsg);
      err.status = response.status;
      err.payload = payload;
      throw err;
    }

    // 204 No Content
    if (response.status === 204) return null;

    // Try to parse JSON, but not all endpoints return JSON (files, etc.)
    try {
      return await response.json();
    } catch (_) {
      return null;
    }
  } catch (error: any) {
    console.warn(`Laravel API unavailable (${endpoint}), using fallback`);
    // Re-throw so callers can react to specific messages
    throw error;
  }
}

// ============ SCHEMES API ============
export const schemesAPI = {
  list: (filters?: { status?: string; county?: string; page?: number; per_page?: number; search?: string }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall(`/schemes${params.toString() ? `?${params}` : ''}`);
  },
  create: (data: any) => apiCall('/schemes', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: number) => apiCall(`/schemes/${id}`),
  update: (id: number, data: any) => apiCall(`/schemes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/schemes/${id}`, { method: 'DELETE' }),
};

export const lookupsAPI = {
  list: (domain?: string) => {
    const params = new URLSearchParams(domain ? { domain } : {} as any);
    return apiCall(`/lookup-values${params.toString() ? `?${params}` : ''}`);
  },
};

// ============ ASSETS API ============
export const assetsAPI = {
  list: (filters?: { schemeId?: number; status?: string; condition?: string }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall(`/assets${params.toString() ? `?${params}` : ''}`);
  },
  create: (data: any) => apiCall('/assets', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: number) => apiCall(`/assets/${id}`),
  update: (id: number, data: any) => apiCall(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/assets/${id}`, { method: 'DELETE' }),
  getByScheme: (schemeId: number) => apiCall(`/schemes/${schemeId}/assets`),
};

// ============ DMAs API ============
export const dmasAPI = {
  list: (filters?: { schemeId?: number }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall(`/dmas${params.toString() ? `?${params}` : ''}`);
  },
  create: (data: any) => apiCall('/dmas', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: number) => apiCall(`/dmas/${id}`),
  update: (id: number, data: any) => apiCall(`/dmas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/dmas/${id}`, { method: 'DELETE' }),
};

// ============ CORE/FACILITIES, CORE/ADDRESSES, CORE/METERS, CORE/ZONES API ============
export const coreFacilitiesAPI = {
  list: (filters?: { schemeId?: number }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall(`/core/facilities${params.toString() ? `?${params}` : ''}`);
  },
  create: (data: any) => apiCall('/core/facilities', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: number) => apiCall(`/core/facilities/${id}`),
  update: (id: number, data: any) => apiCall(`/core/facilities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/core/facilities/${id}`, { method: 'DELETE' }),
};

export const coreAddressesAPI = {
  list: (filters?: { facilityId?: number }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall(`/core/addresses${params.toString() ? `?${params}` : ''}`);
  },
  create: (data: any) => apiCall('/core/addresses', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: number) => apiCall(`/core/addresses/${id}`),
  update: (id: number, data: any) => apiCall(`/core/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/core/addresses/${id}`, { method: 'DELETE' }),
};

export const coreMetersAPI = {
  list: (filters?: { facilityId?: number }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall(`/core/meters${params.toString() ? `?${params}` : ''}`);
  },
  create: (data: any) => apiCall('/core/meters', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: number) => apiCall(`/core/meters/${id}`),
  update: (id: number, data: any) => apiCall(`/core/meters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id:number) => apiCall(`/core/meters/${id}`, { method: 'DELETE' }),
};

export const coreZonesAPI = {
  list: (filters?: { schemeId?: number }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall(`/core/zones${params.toString() ? `?${params}` : ''}`);
  },
  create: (data: any) => apiCall('/core/zones', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: number) => apiCall(`/core/zones/${id}`),
  update: (id: number, data: any) => apiCall(`/core/zones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/core/zones/${id}`, { method: 'DELETE' }),
};

// ============ TELEMETRY API ============
export const telemetryAPI = {
  tags: (filters?: { assetId?: number }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall(`/api/core-ops/telemetry/tags${params.toString() ? `?${params}` : ''}`);
  },
  createTag: (data: any) => apiCall('/api/core-ops/telemetry/tags', { method: 'POST', body: JSON.stringify(data) }),
  updateTag: (id: number, data: any) => apiCall(`/api/core-ops/telemetry/tags/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  measurements: (tagId?: number, filters?: { limit?: number; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams(filters as any);
    const path = tagId ? `/api/core-ops/telemetry/tags/${tagId}/measurements` : '/api/core-ops/telemetry/measurements';
    return apiCall(`${path}${params.toString() ? `?${params}` : ''}`);
  },
  recordMeasurement: (tagId: number, value: string, metadata?: any) => 
    apiCall('/api/core-ops/telemetry/measurements', { 
      method: 'POST', 
      body: JSON.stringify({ tag_id: tagId, value, metadata }) 
    }),
  recordBatch: (measurements: Array<{ tag_id: number; value: string; timestamp?: string }>) =>
    apiCall('/api/core-ops/telemetry/measurements/batch', {
      method: 'POST',
      body: JSON.stringify({ measurements })
    }),
};

// ============ OUTAGES API ============
export const outagesAPI = {
  list: (filters?: { schemeId?: number; state?: string; cause?: string }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall(`/outages${params.toString() ? `?${params}` : ''}`);
  },
  create: (data: any) => apiCall('/outages', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: number) => apiCall(`/outages/${id}`),
  update: (id: number, data: any) => apiCall(`/outages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateState: (id: number, state: string, notes?: string) =>
    apiCall(`/outages/${id}/state`, { 
      method: 'PATCH', 
      body: JSON.stringify({ state, notes }) 
    }),
  delete: (id: number) => apiCall(`/outages/${id}`, { method: 'DELETE' }),
};

// ============ PREDICTIONS API ============
export const predictionsAPI = {
  assetFailures: (filters?: { schemeId?: number; riskLevel?: string }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall(`/predictions/asset-failures${params.toString() ? `?${params}` : ''}`);
  },
  nrwAnomalies: (filters?: { dmaId?: number }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall(`/predictions/nrw-anomalies${params.toString() ? `?${params}` : ''}`);
  },
  demandForecast: (schemeId: number, days?: number) => 
    apiCall(`/predictions/demand-forecast/${schemeId}${days ? `?days=${days}` : ''}`),
  pumpSchedules: (filters?: { schemeId?: number }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall(`/predictions/pump-schedule${params.toString() ? `?${params}` : ''}`);
  },
  outageImpact: (schemeId?: number) =>
    apiCall(`/predictions/outage-impact${schemeId ? `?scheme_id=${schemeId}` : ''}`),
};

// ============ NETWORK TOPOLOGY API ============
export const topologyAPI = {
  nodes: (schemeId: number) => apiCall(`/topology/schemes/${schemeId}/nodes`),
  createNode: (schemeId: number, data: any) => 
    apiCall(`/topology/schemes/${schemeId}/nodes`, { method: 'POST', body: JSON.stringify(data) }),
  updateNode: (schemeId: number, nodeId: number, data: any) =>
    apiCall(`/topology/schemes/${schemeId}/nodes/${nodeId}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  edges: (schemeId: number) => apiCall(`/topology/schemes/${schemeId}/edges`),
  createEdge: (schemeId: number, data: any) =>
    apiCall(`/topology/schemes/${schemeId}/edges`, { method: 'POST', body: JSON.stringify(data) }),
  updateEdge: (schemeId: number, edgeId: number, data: any) =>
    apiCall(`/topology/schemes/${schemeId}/edges/${edgeId}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  // Spatial queries
  nodesNearby: (schemeId: number, lat: number, lon: number, radiusKm: number = 5) =>
    apiCall(`/topology/schemes/${schemeId}/nodes/nearby?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`),
  pathBetweenNodes: (schemeId: number, fromNodeId: number, toNodeId: number) =>
    apiCall(`/topology/schemes/${schemeId}/path?from=${fromNodeId}&to=${toNodeId}`),
};

// ============ WEBSOCKET SERVICE ============
let wsConnection: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

export const telemetryWS = {
  connect: (onMessage: (data: any) => void, onError?: (error: any) => void) => {
    if (wsConnection?.readyState === WebSocket.OPEN) return;

    const wsUrl = (import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8001').replace('http', 'ws') + '/telemetry';
    
    wsConnection = new WebSocket(wsUrl);

    wsConnection.onopen = () => {
      console.log('📡 Telemetry WebSocket connected');
      reconnectAttempts = 0;
    };

    wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) onError(error);
    };

    wsConnection.onclose = () => {
      console.warn('Telemetry WebSocket disconnected');
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        setTimeout(() => telemetryWS.connect(onMessage, onError), RECONNECT_DELAY);
      }
    };
  },

  subscribe: (tagIds: number[]) => {
    if (wsConnection?.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({ action: 'subscribe', tag_ids: tagIds }));
    }
  },

  unsubscribe: (tagIds: number[]) => {
    if (wsConnection?.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({ action: 'unsubscribe', tag_ids: tagIds }));
    }
  },

  disconnect: () => {
    if (wsConnection) {
      wsConnection.close();
      wsConnection = null;
    }
  },
};
