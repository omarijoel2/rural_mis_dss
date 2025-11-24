// Laravel API Integration Layer - Updated for real backend
const LARAVEL_API = process.env.REACT_APP_LARAVEL_API || 'http://127.0.0.1:8001/api/v1';

export async function apiCall(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${LARAVEL_API}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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

// ============ SCHEMES API ============
export const schemesAPI = {
  list: (filters?: { status?: string; county?: string }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall(`/schemes${params.toString() ? `?${params}` : ''}`);
  },
  create: (data: any) => apiCall('/schemes', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: number) => apiCall(`/schemes/${id}`),
  update: (id: number, data: any) => apiCall(`/schemes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/schemes/${id}`, { method: 'DELETE' }),
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

// ============ TELEMETRY API ============
export const telemetryAPI = {
  tags: (filters?: { assetId?: number }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall(`/telemetry/tags${params.toString() ? `?${params}` : ''}`);
  },
  createTag: (data: any) => apiCall('/telemetry/tags', { method: 'POST', body: JSON.stringify(data) }),
  updateTag: (id: number, data: any) => apiCall(`/telemetry/tags/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  measurements: (tagId?: number, filters?: { limit?: number; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams(filters as any);
    const path = tagId ? `/telemetry/tags/${tagId}/measurements` : '/telemetry/measurements';
    return apiCall(`${path}${params.toString() ? `?${params}` : ''}`);
  },
  recordMeasurement: (tagId: number, value: string, metadata?: any) => 
    apiCall('/telemetry/measurements', { 
      method: 'POST', 
      body: JSON.stringify({ tag_id: tagId, value, metadata }) 
    }),
  recordBatch: (measurements: Array<{ tag_id: number; value: string; timestamp?: string }>) =>
    apiCall('/telemetry/measurements/batch', {
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

    const wsUrl = (process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:8001').replace('http', 'ws') + '/telemetry';
    
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
