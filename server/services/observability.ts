// Observability and metrics collection service

export interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  value: number;
  labels?: Record<string, string>;
  timestamp: string;
}

export interface AlertPolicy {
  id: string;
  name: string;
  condition: {
    metric: string;
    operator: '<' | '>' | '==' | '!=' | '<=' | '>=';
    threshold: number;
  };
  severity: 'info' | 'warning' | 'critical';
  notificationChannels: string[];
  isActive: boolean;
}

export interface AlertIncident {
  id: string;
  policyId: string;
  status: 'open' | 'acknowledged' | 'resolved';
  severity: string;
  message: string;
  firedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

// In-memory storage for demo
const metricsData: Metric[] = [];
const alertPolicies = new Map<string, AlertPolicy>();
const alertIncidents: AlertIncident[] = [];

/**
 * Record a metric
 */
export function recordMetric(metric: Metric): Metric {
  metricsData.push(metric);
  // Keep only last 1000 metrics
  if (metricsData.length > 1000) {
    metricsData.shift();
  }
  return metric;
}

/**
 * Get metrics by name and time range
 */
export function getMetrics(
  metricName: string,
  startTime?: string,
  endTime?: string
): Metric[] {
  let filtered = metricsData.filter(m => m.name === metricName);

  if (startTime || endTime) {
    const start = startTime ? new Date(startTime) : new Date(0);
    const end = endTime ? new Date(endTime) : new Date();

    filtered = filtered.filter(m => {
      const mTime = new Date(m.timestamp);
      return mTime >= start && mTime <= end;
    });
  }

  return filtered;
}

/**
 * Create alert policy
 */
export function createAlertPolicy(policy: AlertPolicy): AlertPolicy {
  alertPolicies.set(policy.id, policy);
  console.log(`🚨 Alert policy created: ${policy.name}`);
  return policy;
}

/**
 * Get alert policy
 */
export function getAlertPolicy(policyId: string): AlertPolicy | null {
  return alertPolicies.get(policyId) || null;
}

/**
 * List all alert policies
 */
export function listAlertPolicies(): AlertPolicy[] {
  const policies: AlertPolicy[] = [];
  for (const policy of alertPolicies.values()) {
    policies.push(policy);
  }
  return policies;
}

/**
 * Update alert policy
 */
export function updateAlertPolicy(policyId: string, updates: Partial<AlertPolicy>): AlertPolicy | null {
  const policy = alertPolicies.get(policyId);
  if (policy) {
    Object.assign(policy, updates);
    console.log(`✓ Alert policy updated: ${policyId}`);
    return policy;
  }
  return null;
}

/**
 * Delete alert policy
 */
export function deleteAlertPolicy(policyId: string): boolean {
  const deleted = alertPolicies.delete(policyId);
  if (deleted) {
    console.log(`✓ Alert policy deleted: ${policyId}`);
  }
  return deleted;
}

/**
 * Check metrics against policies and fire alerts
 */
export function evaluateAlertPolicies(metric: Metric): AlertIncident[] {
  const firedIncidents: AlertIncident[] = [];

  for (const policy of alertPolicies.values()) {
    if (!policy.isActive || policy.condition.metric !== metric.name) continue;

    let conditionMet = false;

    switch (policy.condition.operator) {
      case '>':
        conditionMet = metric.value > policy.condition.threshold;
        break;
      case '<':
        conditionMet = metric.value < policy.condition.threshold;
        break;
      case '==':
        conditionMet = metric.value === policy.condition.threshold;
        break;
      case '!=':
        conditionMet = metric.value !== policy.condition.threshold;
        break;
      case '>=':
        conditionMet = metric.value >= policy.condition.threshold;
        break;
      case '<=':
        conditionMet = metric.value <= policy.condition.threshold;
        break;
    }

    if (conditionMet) {
      const incident: AlertIncident = {
        id: `incident_${Date.now()}`,
        policyId: policy.id,
        status: 'open',
        severity: policy.severity,
        message: `${policy.name}: ${metric.name}=${metric.value} (threshold: ${policy.condition.threshold})`,
        firedAt: new Date().toISOString(),
      };

      alertIncidents.push(incident);
      firedIncidents.push(incident);
      console.log(`🚨 Alert fired: ${policy.name}`);
    }
  }

  return firedIncidents;
}

/**
 * Acknowledge an incident
 */
export function acknowledgeIncident(incidentId: string): AlertIncident | null {
  const incident = alertIncidents.find(i => i.id === incidentId);
  if (incident) {
    incident.status = 'acknowledged';
    incident.acknowledgedAt = new Date().toISOString();
    console.log(`✓ Incident acknowledged: ${incidentId}`);
    return incident;
  }
  return null;
}

/**
 * Resolve an incident
 */
export function resolveIncident(incidentId: string): AlertIncident | null {
  const incident = alertIncidents.find(i => i.id === incidentId);
  if (incident) {
    incident.status = 'resolved';
    incident.resolvedAt = new Date().toISOString();
    console.log(`✓ Incident resolved: ${incidentId}`);
    return incident;
  }
  return null;
}

/**
 * Get incidents
 */
export function getIncidents(
  status?: 'open' | 'acknowledged' | 'resolved'
): AlertIncident[] {
  if (status) {
    return alertIncidents.filter(i => i.status === status);
  }
  return alertIncidents;
}

/**
 * Get observability dashboard stats
 */
export function getDashboardStats() {
  const openIncidents = alertIncidents.filter(i => i.status === 'open').length;
  const acknowledgedIncidents = alertIncidents.filter(i => i.status === 'acknowledged').length;
  const resolvedIncidents = alertIncidents.filter(i => i.status === 'resolved').length;

  // Calculate CPU, memory from recent metrics (mock values)
  const cpuMetric = metricsData
    .filter(m => m.name === 'cpu_usage')
    .slice(-1)[0];
  const memoryMetric = metricsData
    .filter(m => m.name === 'memory_usage')
    .slice(-1)[0];

  return {
    cpu: cpuMetric?.value || 42,
    memory: memoryMetric?.value || 68,
    apiLatency: 127,
    errorRate: 0.2,
    openIncidents,
    acknowledgedIncidents,
    resolvedIncidents,
    totalIncidents: alertIncidents.length,
  };
}
