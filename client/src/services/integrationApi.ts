// ============ DEVICE DELETE ============
export async function deleteDevice(id: string) {
  const response = await fetch(`/api/v1/integration/devices/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}
// API client for Integration Module endpoints

const API_BASE = '/api/v1/integration';

// ============ API GATEWAY ============

export async function createApiKey(appName: string, scopes: string[], rateLimit: number) {
  const response = await fetch(`${API_BASE}/api-keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appName, scopes, rateLimit }),
  });
  return response.json();
}

export async function rotateApiKey(keyId: string) {
  const response = await fetch(`${API_BASE}/api-keys/${keyId}/rotate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}

export async function listApiKeys() {
  const response = await fetch(`${API_BASE}/api-keys`);
  return response.json();
}

export async function revokeApiKey(keyId: string) {
  const response = await fetch(`${API_BASE}/api-keys/${keyId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}

export async function deleteApiKey(keyId: string) {
  const response = await fetch(`${API_BASE}/api-keys/${keyId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}

export async function createOAuthClient(clientName: string, grantTypes: string[], redirectUris: string[]) {
  const response = await fetch(`${API_BASE}/oauth-clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientName, grantTypes, redirectUris }),
  });
  return response.json();
}

// ============ MASTER DATA MANAGEMENT ============

export async function listMdmEntities(entityType: string) {
  const response = await fetch(`${API_BASE}/mdm/entities?entityType=${entityType}`);
  return response.json();
}

export async function mergeMdmEntities(id1: string, id2: string, survivorId: string) {
  const response = await fetch(`${API_BASE}/mdm/entities/${id1}/merge/${id2}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ survivorId }),
  });
  return response.json();
}

export async function unmergeMdmEntities(id1: string, mergeId: string) {
  const response = await fetch(`${API_BASE}/mdm/entities/${id1}/unmerge/${mergeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}

// ============ EDRMS ============

export async function uploadDocument(title: string, description: string, documentType: string, storageUrl: string) {
  const response = await fetch(`${API_BASE}/edrms/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, documentType, storageUrl }),
  });
  return response.json();
}

export async function getDocument(documentId: string) {
  const response = await fetch(`${API_BASE}/edrms/documents/${documentId}`);
  return response.json();
}

// ============ DATA WAREHOUSE ============

export async function listDataWarehouseTables() {
  const response = await fetch(`${API_BASE}/dw/tables`);
  return response.json();
}

export async function getDataLineage(sourceTableId: string, targetTableId: string) {
  const response = await fetch(`${API_BASE}/dw/lineage/${sourceTableId}/${targetTableId}`);
  return response.json();
}

export async function getDataQualityMetrics() {
  const response = await fetch(`${API_BASE}/dw/quality-metrics`);
  return response.json();
}

// ============ NOTIFICATIONS ============

export async function createNotificationChannel(channelName: string, channelType: string, configuration: any) {
  const response = await fetch(`${API_BASE}/notifications/channels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelName, channelType, configuration }),
  });
  return response.json();
}

export async function sendNotification(recipient: string, templateKey: string, variables: any, channel: string) {
  const response = await fetch(`${API_BASE}/notifications/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient, templateKey, variables, channel }),
  });
  return response.json();
}

export async function createNotificationTemplate(templateKey: string, templateName: string, subject: string, body: string, variables: string[]) {
  const response = await fetch(`${API_BASE}/notifications/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateKey, templateName, subject, body, variables }),
  });
  return response.json();
}

export async function getNotificationQueue() {
  const response = await fetch(`${API_BASE}/notifications/queue`);
  return response.json();
}

// ============ DEVICES ============

export async function registerDevice(deviceInfo: any) {
  const response = await fetch(`${API_BASE}/devices/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deviceInfo),
  });
  return response.json();
}

export async function listDevices() {
  const response = await fetch(`${API_BASE}/devices`);
  return response.json();
}

// ============ SYNC MONITOR & CONFLICTS ============
export async function getSyncConflicts() {
  // This should call the new integration endpoint for conflicts (if available)
  // For now, fallback to mobile if not yet migrated
  const response = await fetch('/api/v1/integration/conflicts');
  return response.json();
}

export async function getSyncBatches() {
  // Placeholder for sync monitor batches endpoint
  const response = await fetch('/api/v1/integration/sync-batches');
  return response.json();
}

export async function queueSyncOperation(deviceId: string, operation: string, entityType: string, entityId: string, payload: any) {
  const response = await fetch(`${API_BASE}/devices/${deviceId}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation, entityType, entityId, payload }),
  });
  return response.json();
}

export async function getPendingSyncOperations(deviceId: string) {
  const response = await fetch(`${API_BASE}/devices/sync/pending/${deviceId}`);
  return response.json();
}

export async function completeSyncOperation(syncOpId: string) {
  const response = await fetch(`${API_BASE}/devices/sync/${syncOpId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}

export async function resolveSyncConflict(syncOpId: string, resolution: 'server' | 'device' | 'merge') {
  const response = await fetch(`${API_BASE}/devices/sync/${syncOpId}/resolve-conflict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolution }),
  });
  return response.json();
}

// ============ OBSERVABILITY ============

export async function recordMetric(metricName: string, value: number, type: string, labels?: any) {
  const response = await fetch(`${API_BASE}/observability/metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: metricName, value, type, labels, timestamp: new Date().toISOString() }),
  });
  return response.json();
}

export async function getMetrics(metricName: string, startTime?: string, endTime?: string) {
  const params = new URLSearchParams();
  if (startTime) params.append('startTime', startTime);
  if (endTime) params.append('endTime', endTime);
  const response = await fetch(`${API_BASE}/observability/metrics/${metricName}?${params}`);
  return response.json();
}

export async function createAlertPolicy(policyName: string, condition: any, severity: string, notificationChannels: string[]) {
  const response = await fetch(`${API_BASE}/observability/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: policyName, condition, severity, notificationChannels, isActive: true }),
  });
  return response.json();
}

export async function listAlertPolicies() {
  const response = await fetch(`${API_BASE}/observability/alerts`);
  return response.json();
}

export async function acknowledgeIncident(incidentId: string) {
  const response = await fetch(`${API_BASE}/observability/incidents/${incidentId}/acknowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}

export async function resolveIncident(incidentId: string) {
  const response = await fetch(`${API_BASE}/observability/incidents/${incidentId}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}

export async function getObservabilityDashboard() {
  const response = await fetch(`${API_BASE}/observability/dashboard`);
  return response.json();
}

// ============ BACKUP & DISASTER RECOVERY ============

export async function createBackupPolicy(policyName: string, backupType: string, schedule: string, retentionDays: number, targetLocation: string) {
  const response = await fetch(`${API_BASE}/backup/policies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ policyName, backupType, schedule, retentionDays, targetLocation }),
  });
  return response.json();
}

export async function runBackup(policyId: string) {
  const response = await fetch(`${API_BASE}/backup/${policyId}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}

export async function getBackupJob(jobId: string) {
  const response = await fetch(`${API_BASE}/backup/jobs/${jobId}`);
  return response.json();
}

// ============ SECRETS VAULT ============

export async function createSecret(secretKey: string, secretType: string, value: string, rotationSchedule?: string, expiresAt?: string) {
  const response = await fetch(`${API_BASE}/secrets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secretKey, secretType, value, rotationSchedule, expiresAt }),
  });
  return response.json();
}

export async function getSecret(secretId: string) {
  const response = await fetch(`${API_BASE}/secrets/${secretId}`);
  return response.json();
}

export async function rotateSecret(secretId: string, newValue: string) {
  const response = await fetch(`${API_BASE}/secrets/${secretId}/rotate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newValue }),
  });
  return response.json();
}

export async function getSecretAuditLog() {
  const response = await fetch(`${API_BASE}/secrets/audit-log`);
  return response.json();
}
