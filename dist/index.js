// server/index.ts
import express2 from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

// server/routes.ts
import { createServer } from "http";

// server/routes/integration.ts
import { Router } from "express";

// server/services/secrets.ts
import crypto from "crypto";
var ENCRYPTION_METHOD = "aes-256-gcm";
var ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
var IV_LENGTH = 16;
function encryptSecret(value) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");
    const cipher = crypto.createCipheriv(ENCRYPTION_METHOD, keyBuffer, iv);
    let encryptedData = cipher.update(value, "utf8", "hex");
    encryptedData += cipher.final("hex");
    const authTag = cipher.getAuthTag();
    return {
      encryptedValue: encryptedData,
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex")
    };
  } catch (error) {
    throw new Error(`Failed to encrypt secret: ${error}`);
  }
}
function generateSecretKey(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

// server/services/notifications.ts
async function sendEmailNotification(recipient, subject, body) {
  try {
    console.log(`\u{1F4E7} Sending email to ${recipient}:
 Subject: ${subject}
 Body: ${body}`);
    return {
      success: true,
      messageId: `email_${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: `Email notification failed: ${error}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
}
async function sendSmsNotification(phoneNumber, message) {
  try {
    console.log(`\u{1F4F1} Sending SMS to ${phoneNumber}: ${message}`);
    return {
      success: true,
      messageId: `sms_${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: `SMS notification failed: ${error}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
}
async function sendSlackNotification(webhookUrl, message, channel) {
  try {
    console.log(`\u{1F4AC} Sending Slack message to ${channel || "default"}:
${message}`);
    return {
      success: true,
      messageId: `slack_${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: `Slack notification failed: ${error}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
}
async function sendWebhookNotification(webhookUrl, payload) {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }
    return {
      success: true,
      messageId: `webhook_${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: `Webhook notification failed: ${error}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
}
async function sendNotification(payload) {
  switch (payload.channel) {
    case "email":
      return sendEmailNotification(
        payload.recipient,
        payload.variables.subject || "Notification",
        payload.variables.body || ""
      );
    case "sms":
      return sendSmsNotification(payload.recipient, payload.variables.message || "");
    case "slack":
      return sendSlackNotification(
        payload.variables.webhookUrl || "",
        payload.variables.message || "",
        payload.variables.channel
      );
    case "webhook":
      return sendWebhookNotification(payload.variables.webhookUrl || "", payload);
    default:
      return {
        success: false,
        error: `Unknown notification channel: ${payload.channel}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
  }
}

// server/services/devices.ts
var deviceRegistry = /* @__PURE__ */ new Map();
var syncQueue = [];
function registerDevice(device) {
  deviceRegistry.set(device.deviceId, device);
  console.log(`\u2713 Device registered: ${device.deviceName} (${device.deviceId})`);
  return device;
}
function listDevices() {
  return Array.from(deviceRegistry.values());
}
function queueSyncOperation(deviceId, operation, entityType, entityId, payload) {
  const syncOp = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    deviceId,
    operation,
    entityType,
    entityId,
    payload,
    status: "pending",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  syncQueue.push(syncOp);
  console.log(`\u{1F4E4} Queued ${operation} operation for ${entityType} from device ${deviceId}`);
  return syncOp;
}
function getPendingSyncOperations(deviceId) {
  return syncQueue.filter((op) => op.deviceId === deviceId && op.status === "pending");
}
function resolveSyncConflict(syncOpId, resolution) {
  const syncOp = syncQueue.find((op) => op.id === syncOpId);
  if (syncOp) {
    syncOp.status = "synced";
    syncOp.conflictResolution = resolution;
    console.log(`\u2713 Conflict resolved using ${resolution} strategy`);
    return syncOp;
  }
  return null;
}
function completeSyncOperation(syncOpId) {
  const syncOp = syncQueue.find((op) => op.id === syncOpId);
  if (syncOp) {
    syncOp.status = "synced";
    const device = deviceRegistry.get(syncOp.deviceId);
    if (device) {
      device.lastSyncedAt = (/* @__PURE__ */ new Date()).toISOString();
    }
    console.log(`\u2713 Sync operation completed: ${syncOpId}`);
    return syncOp;
  }
  return null;
}

// server/services/observability.ts
var metricsData = [];
var alertPolicies = /* @__PURE__ */ new Map();
var alertIncidents = [];
function recordMetric(metric) {
  metricsData.push(metric);
  if (metricsData.length > 1e3) {
    metricsData.shift();
  }
  return metric;
}
function getMetrics(metricName, startTime, endTime) {
  let filtered = metricsData.filter((m) => m.name === metricName);
  if (startTime || endTime) {
    const start = startTime ? new Date(startTime) : /* @__PURE__ */ new Date(0);
    const end = endTime ? new Date(endTime) : /* @__PURE__ */ new Date();
    filtered = filtered.filter((m) => {
      const mTime = new Date(m.timestamp);
      return mTime >= start && mTime <= end;
    });
  }
  return filtered;
}
function createAlertPolicy(policy) {
  alertPolicies.set(policy.id, policy);
  console.log(`\u{1F6A8} Alert policy created: ${policy.name}`);
  return policy;
}
function listAlertPolicies() {
  const policies = [];
  for (const policy of alertPolicies.values()) {
    policies.push(policy);
  }
  return policies;
}
function evaluateAlertPolicies(metric) {
  const firedIncidents = [];
  for (const policy of alertPolicies.values()) {
    if (!policy.isActive || policy.condition.metric !== metric.name) continue;
    let conditionMet = false;
    switch (policy.condition.operator) {
      case ">":
        conditionMet = metric.value > policy.condition.threshold;
        break;
      case "<":
        conditionMet = metric.value < policy.condition.threshold;
        break;
      case "==":
        conditionMet = metric.value === policy.condition.threshold;
        break;
      case "!=":
        conditionMet = metric.value !== policy.condition.threshold;
        break;
      case ">=":
        conditionMet = metric.value >= policy.condition.threshold;
        break;
      case "<=":
        conditionMet = metric.value <= policy.condition.threshold;
        break;
    }
    if (conditionMet) {
      const incident = {
        id: `incident_${Date.now()}`,
        policyId: policy.id,
        status: "open",
        severity: policy.severity,
        message: `${policy.name}: ${metric.name}=${metric.value} (threshold: ${policy.condition.threshold})`,
        firedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      alertIncidents.push(incident);
      firedIncidents.push(incident);
      console.log(`\u{1F6A8} Alert fired: ${policy.name}`);
    }
  }
  return firedIncidents;
}
function acknowledgeIncident(incidentId) {
  const incident = alertIncidents.find((i) => i.id === incidentId);
  if (incident) {
    incident.status = "acknowledged";
    incident.acknowledgedAt = (/* @__PURE__ */ new Date()).toISOString();
    console.log(`\u2713 Incident acknowledged: ${incidentId}`);
    return incident;
  }
  return null;
}
function resolveIncident(incidentId) {
  const incident = alertIncidents.find((i) => i.id === incidentId);
  if (incident) {
    incident.status = "resolved";
    incident.resolvedAt = (/* @__PURE__ */ new Date()).toISOString();
    console.log(`\u2713 Incident resolved: ${incidentId}`);
    return incident;
  }
  return null;
}
function getDashboardStats() {
  const openIncidents = alertIncidents.filter((i) => i.status === "open").length;
  const acknowledgedIncidents = alertIncidents.filter((i) => i.status === "acknowledged").length;
  const resolvedIncidents = alertIncidents.filter((i) => i.status === "resolved").length;
  const cpuMetric = metricsData.filter((m) => m.name === "cpu_usage").slice(-1)[0];
  const memoryMetric = metricsData.filter((m) => m.name === "memory_usage").slice(-1)[0];
  return {
    cpu: cpuMetric?.value || 42,
    memory: memoryMetric?.value || 68,
    apiLatency: 127,
    errorRate: 0.2,
    openIncidents,
    acknowledgedIncidents,
    resolvedIncidents,
    totalIncidents: alertIncidents.length
  };
}

// server/routes/integration.ts
var router = Router();
router.post("/api/v1/integration/api-keys", (req, res) => {
  const { appName, scopes, rateLimit } = req.body;
  const keyId = `sk_live_${generateSecretKey(16).substring(0, 16)}`;
  const keySecret = generateSecretKey(32);
  res.json({
    success: true,
    keyId,
    keySecret,
    appName,
    scopes,
    rateLimit,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.post("/api/v1/integration/api-keys/:keyId/rotate", (req, res) => {
  const { keyId } = req.params;
  const newKeySecret = generateSecretKey(32);
  res.json({
    success: true,
    keyId,
    newKeySecret,
    rotatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.delete("/api/v1/integration/api-keys/:keyId", (req, res) => {
  const { keyId } = req.params;
  res.json({
    success: true,
    message: `API key ${keyId} revoked`
  });
});
router.post("/api/v1/integration/oauth-clients", (req, res) => {
  const { clientName, grantTypes, redirectUris } = req.body;
  const clientId = `oauth_${Date.now()}`;
  const clientSecret = generateSecretKey(32);
  res.json({
    success: true,
    clientId,
    clientSecret,
    clientName,
    grantTypes,
    redirectUris,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.get("/api/v1/integration/mdm/entities", (req, res) => {
  const { entityType } = req.query;
  res.json({
    success: true,
    data: [
      { id: 1, type: entityType, sourceSystem: "CIS", status: "active", trustScore: 92 },
      { id: 2, type: entityType, sourceSystem: "Field App", status: "active", trustScore: 78 }
    ]
  });
});
router.post("/api/v1/integration/mdm/entities/:id1/merge/:id2", (req, res) => {
  const { id1, id2 } = req.params;
  const { survivorId } = req.body;
  res.json({
    success: true,
    message: `Entities merged: ${id1} + ${id2}`,
    goldenRecordId: survivorId,
    mergedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.post("/api/v1/integration/mdm/entities/:id1/unmerge/:mergeId", (req, res) => {
  const { id1, mergeId } = req.params;
  res.json({
    success: true,
    message: `Merge reversed: ${mergeId}`,
    reversedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.post("/api/v1/integration/edrms/documents", (req, res) => {
  const { title, description, documentType, storageUrl } = req.body;
  const documentId = `doc_${Date.now()}`;
  res.json({
    success: true,
    documentId,
    title,
    documentType,
    version: 1,
    status: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.get("/api/v1/integration/edrms/documents/:documentId", (req, res) => {
  const { documentId } = req.params;
  res.json({
    success: true,
    documentId,
    title: "Document Title",
    documentType: "contract",
    version: 3,
    status: "active",
    retentionSchedule: "7 years",
    versions: [
      { version: 1, uploadedAt: "2025-11-01", uploadedBy: "admin" },
      { version: 2, uploadedAt: "2025-11-15", uploadedBy: "admin" },
      { version: 3, uploadedAt: "2025-11-24", uploadedBy: "admin" }
    ]
  });
});
router.get("/api/v1/integration/dw/tables", (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, tableName: "customers_raw", schema: "raw", rows: 45230, quality: 94 },
      { id: 2, tableName: "billing_transactions", schema: "staging", rows: 128456, quality: 97 },
      { id: 3, tableName: "customer_mart", schema: "mart", rows: 45230, quality: 99 }
    ]
  });
});
router.get("/api/v1/integration/dw/lineage/:sourceTableId/:targetTableId", (req, res) => {
  const { sourceTableId, targetTableId } = req.params;
  res.json({
    success: true,
    sourceTableId,
    targetTableId,
    transformationType: "aggregate",
    transformationLogic: { fields: ["*"] }
  });
});
router.get("/api/v1/integration/dw/quality-metrics", (req, res) => {
  res.json({
    success: true,
    metrics: {
      completeness: 99.2,
      accuracy: 98.7,
      consistency: 97.1,
      timeliness: 100
    }
  });
});
router.post("/api/v1/integration/notifications/channels", (req, res) => {
  const { channelName, channelType, configuration } = req.body;
  const channelId = `channel_${Date.now()}`;
  res.json({
    success: true,
    channelId,
    channelName,
    channelType,
    isActive: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.post("/api/v1/integration/notifications/send", async (req, res) => {
  const { recipient, templateKey, variables, channel } = req.body;
  const result = await sendNotification({
    recipient,
    templateKey,
    variables,
    channel
  });
  res.json(result);
});
router.post("/api/v1/integration/notifications/templates", (req, res) => {
  const { templateKey, templateName, subject, body, variables } = req.body;
  res.json({
    success: true,
    templateId: `template_${Date.now()}`,
    templateKey,
    templateName,
    subject,
    body,
    variables,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.get("/api/v1/integration/notifications/queue", (req, res) => {
  res.json({
    success: true,
    queue: [
      { id: 1, templateKey: "alert_system_down", recipient: "admin@example.com", status: "sent" },
      { id: 2, templateKey: "report_generated", recipient: "+254712345678", status: "pending", attempts: 2 }
    ],
    stats: { total: 2, sent: 1, pending: 1, failed: 0 }
  });
});
router.post("/api/v1/integration/devices/register", (req, res) => {
  const device = registerDevice(req.body);
  res.json({
    success: true,
    device,
    registeredAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.get("/api/v1/integration/devices", (req, res) => {
  const devices = listDevices();
  res.json({
    success: true,
    devices,
    total: devices.length
  });
});
router.post("/api/v1/integration/devices/:deviceId/sync", (req, res) => {
  const { deviceId } = req.params;
  const { operation, entityType, entityId, payload } = req.body;
  const syncOp = queueSyncOperation(deviceId, operation, entityType, entityId, payload);
  res.json({
    success: true,
    syncOperation: syncOp
  });
});
router.get("/api/v1/integration/devices/sync/pending/:deviceId", (req, res) => {
  const { deviceId } = req.params;
  const pending = getPendingSyncOperations(deviceId);
  res.json({
    success: true,
    pending,
    count: pending.length
  });
});
router.post("/api/v1/integration/devices/sync/:syncOpId/complete", (req, res) => {
  const { syncOpId } = req.params;
  const completed = completeSyncOperation(syncOpId);
  res.json({
    success: !!completed,
    operation: completed
  });
});
router.post("/api/v1/integration/devices/sync/:syncOpId/resolve-conflict", (req, res) => {
  const { syncOpId } = req.params;
  const { resolution } = req.body;
  const resolved = resolveSyncConflict(syncOpId, resolution);
  res.json({
    success: !!resolved,
    operation: resolved
  });
});
router.post("/api/v1/integration/observability/metrics", (req, res) => {
  const metric = recordMetric(req.body);
  const firedIncidents = evaluateAlertPolicies(metric);
  res.json({
    success: true,
    metric,
    alertsFired: firedIncidents.length,
    incidents: firedIncidents
  });
});
router.get("/api/v1/integration/observability/metrics/:metricName", (req, res) => {
  const { metricName } = req.params;
  const { startTime, endTime } = req.query;
  const metrics = getMetrics(
    metricName,
    startTime,
    endTime
  );
  res.json({
    success: true,
    metricName,
    data: metrics
  });
});
router.post("/api/v1/integration/observability/alerts", (req, res) => {
  const policy = createAlertPolicy({
    id: `policy_${Date.now()}`,
    ...req.body
  });
  res.json({
    success: true,
    policy
  });
});
router.get("/api/v1/integration/observability/alerts", (req, res) => {
  const policies = listAlertPolicies();
  res.json({
    success: true,
    policies
  });
});
router.post("/api/v1/integration/observability/incidents/:incidentId/acknowledge", (req, res) => {
  const { incidentId } = req.params;
  const incident = acknowledgeIncident(incidentId);
  res.json({
    success: !!incident,
    incident
  });
});
router.post("/api/v1/integration/observability/incidents/:incidentId/resolve", (req, res) => {
  const { incidentId } = req.params;
  const incident = resolveIncident(incidentId);
  res.json({
    success: !!incident,
    incident
  });
});
router.get("/api/v1/integration/observability/dashboard", (req, res) => {
  const stats = getDashboardStats();
  res.json({
    success: true,
    ...stats
  });
});
router.post("/api/v1/integration/backup/policies", (req, res) => {
  const { policyName, backupType, schedule, retentionDays, targetLocation } = req.body;
  const policyId = `policy_${Date.now()}`;
  res.json({
    success: true,
    policyId,
    policyName,
    backupType,
    schedule,
    retentionDays,
    targetLocation,
    isActive: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.post("/api/v1/integration/backup/:policyId/run", (req, res) => {
  const { policyId } = req.params;
  const jobId = `job_${Date.now()}`;
  res.json({
    success: true,
    jobId,
    policyId,
    status: "running",
    startedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.get("/api/v1/integration/backup/jobs/:jobId", (req, res) => {
  const { jobId } = req.params;
  res.json({
    success: true,
    jobId,
    status: "completed",
    dataSize: 5e4,
    backupSize: 15e3,
    duration: 3780,
    completedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.post("/api/v1/integration/secrets", (req, res) => {
  const { secretKey, secretType, value, rotationSchedule, expiresAt } = req.body;
  const encrypted = encryptSecret(value);
  const secretId = `secret_${Date.now()}`;
  res.json({
    success: true,
    secretId,
    secretKey,
    secretType,
    encryptedValue: encrypted.encryptedValue,
    encryptionMethod: "AES-256-GCM",
    rotationSchedule,
    expiresAt,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.get("/api/v1/integration/secrets/:secretId", (req, res) => {
  const { secretId } = req.params;
  res.json({
    success: true,
    secretId,
    secretKey: "SENDGRID_API_KEY",
    secretType: "api_key"
    // Note: In production, never return actual secret in response
    // Use HMAC or other secure verification instead
  });
});
router.post("/api/v1/integration/secrets/:secretId/rotate", (req, res) => {
  const { secretId } = req.params;
  const { newValue } = req.body;
  const newEncrypted = encryptSecret(newValue);
  res.json({
    success: true,
    secretId,
    rotatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    encryptedValue: newEncrypted.encryptedValue
  });
});
router.get("/api/v1/integration/secrets/audit-log", (req, res) => {
  res.json({
    success: true,
    logs: [
      { secretId: 1, accessedBy: "admin@example.com", accessType: "read", timestamp: (/* @__PURE__ */ new Date()).toISOString(), ip: "192.168.1.1" },
      { secretId: 2, accessedBy: "backup-service", accessType: "read", timestamp: (/* @__PURE__ */ new Date()).toISOString(), ip: "10.0.0.5" }
    ]
  });
});
var integration_default = router;

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/hydromet/aquifers", (req, res) => {
    res.json({
      data: [
        { id: 1, name: "Elwak Aquifer", safeYieldMcm: 15, currentYieldMcm: 12, rechargeRateMcm: 3, riskLevel: "medium", waterQualityStatus: "Good", areaKm2: 5e3 },
        { id: 2, name: "Merti Aquifer", safeYieldMcm: 20, currentYieldMcm: 18, rechargeRateMcm: 4, riskLevel: "low", waterQualityStatus: "Excellent", areaKm2: 8e3 },
        { id: 3, name: "Neogene Aquifer", safeYieldMcm: 10, currentYieldMcm: 9, rechargeRateMcm: 2, riskLevel: "high", waterQualityStatus: "Fair", areaKm2: 3e3 }
      ]
    });
  });
  app2.post("/api/hydromet/aquifers", (req, res) => {
    res.json({ id: 4, message: "Aquifer registered", ...req.body });
  });
  app2.get("/api/core-ops/droughts", (req, res) => {
    res.json({
      data: [
        { id: 1, name: "2025 ASAL Drought - Jan-Mar", status: "active", severity: "high", startDate: "2025-01-01", affectedPopulation: 125e3, activatedBoreholes: 8, waterRationing: true },
        { id: 2, name: "2024 Oct-Dec Drought", status: "resolved", severity: "medium", startDate: "2024-10-01", endDate: "2024-12-15", affectedPopulation: 85e3, activatedBoreholes: 5, waterRationing: false }
      ]
    });
  });
  app2.post("/api/core-ops/droughts", (req, res) => {
    res.json({ id: 3, status: "declared", message: "Drought event declared", ...req.body });
  });
  app2.post("/api/core-ops/droughts/:id/activate", (req, res) => {
    res.json({ id: req.params.id, status: "active", message: "Emergency response activated" });
  });
  app2.get("/api/me/gender-equity", (req, res) => {
    res.json({
      data: [
        { id: 1, gender: "female", count: 450, accessHours: 12, collectionTime: 45, satisfaction: 65 },
        { id: 2, gender: "male", count: 320, accessHours: 15, collectionTime: 15, satisfaction: 78 },
        { id: 3, gender: "youth", count: 280, accessHours: 14, collectionTime: 25, satisfaction: 72 },
        { id: 4, gender: "elderly", count: 95, accessHours: 10, collectionTime: 60, satisfaction: 58 }
      ]
    });
  });
  app2.get("/api/training/assessments", (req, res) => {
    res.json({
      data: [
        { id: 1, operatorId: "OP-001", operatorName: "James Kipchoge", topic: "operation", score: 85, maxScore: 100, status: "completed", certificationValid: true, validUntil: "2026-01-15" },
        { id: 2, operatorId: "OP-002", operatorName: "Mary Nairobi", topic: "maintenance", score: 92, maxScore: 100, status: "completed", certificationValid: true, validUntil: "2026-06-10" },
        { id: 3, operatorId: "OP-003", operatorName: "Peter Mwangi", topic: "safety", score: 78, maxScore: 100, status: "completed", certificationValid: false, validUntil: null }
      ]
    });
  });
  app2.post("/api/training/assessments", (req, res) => {
    res.json({ id: 4, status: "pending", message: "Assessment recorded", ...req.body });
  });
  app2.get("/api/community/committees", (req, res) => {
    res.json({
      data: [
        { id: "1", name: "Kiambu Water Committee", community: "Kiambu", members: 12, termStart: "2023-01-01", termEnd: "2025-12-31", lastElection: "2023-01-15", complianceScore: 92, status: "active", genderQuota: 0.5, meetingFrequency: "monthly" },
        { id: "2", name: "Kajiado Water Committee", community: "Kajiado", members: 10, termStart: "2024-01-01", termEnd: "2026-12-31", lastElection: "2024-01-20", complianceScore: 85, status: "active", genderQuota: 0.4, meetingFrequency: "bi-monthly" },
        { id: "3", name: "Machakos Water Committee", community: "Machakos", members: 14, termStart: "2022-06-01", termEnd: "2025-05-31", lastElection: "2022-06-10", complianceScore: 78, status: "active", genderQuota: 0.57, meetingFrequency: "monthly" }
      ],
      total: 24
    });
  });
  app2.post("/api/community/committees", (req, res) => {
    res.json({ id: "new-id", status: "active", message: "Committee created", ...req.body });
  });
  app2.get("/api/community/finance/cashbook", (req, res) => {
    res.json({
      data: [
        { id: "1", date: "2025-11-20", refNo: "REC001", particulars: "Monthly tariff collection", type: "receipt", amount: 125e3, fundSource: "tariff", status: "approved" },
        { id: "2", date: "2025-11-19", refNo: "PAY001", particulars: "Operator salary", type: "payment", amount: 45e3, fundSource: "tariff", status: "approved" },
        { id: "3", date: "2025-11-18", refNo: "REC002", particulars: "Connection fees", type: "receipt", amount: 35e3, fundSource: "levy", status: "approved" },
        { id: "4", date: "2025-11-17", refNo: "PAY002", particulars: "Maintenance supplies", type: "payment", amount: 28e3, fundSource: "tariff", status: "pending" }
      ],
      balance: 12e5
    });
  });
  app2.post("/api/community/finance/cashbook", (req, res) => {
    res.json({ id: "new-entry", status: "pending", message: "Cashbook entry recorded", ...req.body });
  });
  app2.get("/api/partner/vendors", (req, res) => {
    res.json({
      data: [
        { id: "1", companyName: "WaterTech Solutions", status: "approved", kycStatus: "verified", registrationNumber: "PVT001", email: "info@watertech.ke", rating: 4.8, otifScore: 0.94, categories: ["pumps", "pipes", "valves"] },
        { id: "2", companyName: "Nairobi Supplies Ltd", status: "approved", kycStatus: "verified", registrationNumber: "PVT002", email: "sales@nairobi-supplies.ke", rating: 4.5, otifScore: 0.89, categories: ["chemicals", "testing-equipment"] },
        { id: "3", companyName: "Constructor Engineering", status: "pending", kycStatus: "pending", registrationNumber: "PVT003", email: "bids@constructor-eng.ke", rating: 0, otifScore: 0, categories: ["civil-works", "installation"] }
      ],
      total: 142
    });
  });
  app2.post("/api/partner/vendors", (req, res) => {
    res.json({ id: "new-vendor", status: "pending", kycStatus: "pending", message: "Vendor registered", ...req.body });
  });
  app2.get("/api/partner/bids", (req, res) => {
    res.json({
      data: [
        { id: "1", rfqId: "RFQ-2025-001", vendorName: "WaterTech Solutions", status: "submitted", items: 5, priceTotal: 85e4, leadTime: 14 },
        { id: "2", rfqId: "RFQ-2025-001", vendorName: "Nairobi Supplies Ltd", status: "submitted", items: 5, priceTotal: 92e4, leadTime: 21 },
        { id: "3", rfqId: "RFQ-2025-002", vendorName: "Constructor Engineering", status: "submitted", items: 3, priceTotal: 25e5, leadTime: 45 }
      ],
      total: 28
    });
  });
  app2.get("/api/grm/tickets", (req, res) => {
    res.json({
      data: [
        { id: "1", ticketNumber: "GRM-2025-001", category: "water-quality", severity: "high", status: "new", location: "Kilimani Estate", details: "Turbid water supply", createdAt: "2025-11-20", slaDueAt: "2025-11-22" },
        { id: "2", ticketNumber: "GRM-2025-002", category: "billing", severity: "medium", status: "assigned", location: "Westlands", details: "Overcharge on meter reading", createdAt: "2025-11-19", slaDueAt: "2025-11-23" },
        { id: "3", ticketNumber: "GRM-2025-003", category: "service", severity: "medium", status: "in-progress", location: "South C", details: "Intermittent supply", createdAt: "2025-11-18", slaDueAt: "2025-11-24" },
        { id: "4", ticketNumber: "GRM-2025-004", category: "billing", severity: "low", status: "resolved", location: "Langata", details: "Billing inquiry", createdAt: "2025-11-15", slaDueAt: "2025-11-20", resolvedAt: "2025-11-19" }
      ],
      stats: { new: 12, assigned: 8, inProgress: 28, resolved: 156, overdueSla: 3 }
    });
  });
  app2.post("/api/grm/tickets", (req, res) => {
    res.json({ id: "new-ticket", ticketNumber: "GRM-2025-NEW", status: "new", message: "Grievance submitted", ...req.body });
  });
  app2.patch("/api/grm/tickets/:id", (req, res) => {
    res.json({ id: req.params.id, status: req.body.status, message: "Ticket updated" });
  });
  app2.get("/api/community/stakeholders", (req, res) => {
    res.json({
      data: [
        { id: "1", name: "Jane Kipchoge", organization: "Nairobi Water Works", type: "community", influence: 8, interest: 9, tags: ["leadership", "active"] },
        { id: "2", name: "Peter Mwangi", organization: "Kenyan Red Cross", type: "ngo", influence: 7, interest: 8, tags: ["humanitarian", "outreach"] },
        { id: "3", name: "Susan Otieno", organization: "County Health", type: "government", influence: 9, interest: 7, tags: ["regulator", "planning"] }
      ],
      total: 45
    });
  });
  app2.get("/api/community/engagements", (req, res) => {
    res.json({
      data: [
        { id: "1", title: "Community Awareness Forum", scheduledAt: "2025-12-05", location: "Kiambu Market", channel: "in-person", attendees: 0, status: "planned" },
        { id: "2", title: "Committee Budget Review", scheduledAt: "2025-11-28", location: "Kiambu Office", channel: "in-person", attendees: 12, status: "planned" }
      ],
      total: 18
    });
  });
  app2.get("/api/open-data/catalog", (req, res) => {
    res.json({
      data: [
        { id: "1", title: "Water Coverage by Ward", topic: "operations", license: "CC BY 4.0", freshness: "1 day old", downloads: 234, rating: 4.5 },
        { id: "2", title: "Monthly Revenue Report", topic: "finance", license: "CC BY 4.0", freshness: "5 days old", downloads: 156, rating: 4.2 },
        { id: "3", title: "Water Quality Metrics", topic: "quality", license: "ODC-BY", freshness: "2 hours old", downloads: 89, rating: 4.8 }
      ]
    });
  });
  app2.use("/api/v1/integration", integration_default);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/routes/core-registry.ts
function registerCoreRegistryRoutes(app2) {
  app2.get("/api/core/schemes", (req, res) => {
    res.json({
      data: [
        { id: 1, code: "KISII_001", name: "Kisii Urban Scheme", type: "piped", status: "active", county: "Kisii", populationServed: 45e3, connections: 8900 },
        { id: 2, code: "KERICHO_001", name: "Kericho Town Scheme", type: "piped", status: "active", county: "Kericho", populationServed: 32e3, connections: 6200 }
      ],
      total: 2
    });
  });
  app2.post("/api/core/schemes", (req, res) => {
    res.json({ id: 3, message: "Scheme created", ...req.body });
  });
  app2.get("/api/core/schemes/:id", (req, res) => {
    res.json({ id: req.params.id, code: "KISII_001", name: "Kisii Urban Scheme", type: "piped", status: "active" });
  });
  app2.get("/api/core/dmas", (req, res) => {
    res.json({
      data: [
        { id: 1, schemeId: 1, code: "KISII_DMA_01", name: "Central Kisii DMA", status: "active" },
        { id: 2, schemeId: 1, code: "KISII_DMA_02", name: "South Kisii DMA", status: "active" }
      ],
      total: 2
    });
  });
  app2.post("/api/core/dmas", (req, res) => {
    res.json({ id: 3, message: "DMA created", ...req.body });
  });
  app2.get("/api/core/assets", (req, res) => {
    res.json({
      data: [
        { id: 1, code: "PUMP_001", name: "Main Pump", type: "pump", status: "operational", condition: "good" },
        { id: 2, code: "PIPE_001", name: "Primary Pipeline", type: "pipe", status: "operational", condition: "fair" },
        { id: 3, code: "RES_001", name: "Main Reservoir", type: "reservoir", status: "operational", condition: "good" }
      ],
      total: 3
    });
  });
  app2.post("/api/core/assets", (req, res) => {
    res.json({ id: 4, message: "Asset created", ...req.body });
  });
  app2.get("/api/core/assets/:id", (req, res) => {
    res.json({ id: req.params.id, code: "PUMP_001", name: "Main Pump", type: "pump", status: "operational" });
  });
  app2.get("/api/core/meters", (req, res) => {
    res.json({
      data: [
        { id: 1, serialNumber: "KM-001-2024", meterType: "bulk", status: "active", lastReading: 125e3 },
        { id: 2, serialNumber: "KM-002-2024", meterType: "consumer", status: "active", lastReading: 45300 }
      ],
      total: 2
    });
  });
  app2.get("/api/core/telemetry/tags", (req, res) => {
    res.json({
      data: [
        { id: 1, tag: "PUMP_001_FLOW", ioType: "AI", unit: "lpm", scale: { min: 0, max: 500 } },
        { id: 2, tag: "RES_001_LEVEL", ioType: "AI", unit: "m3", scale: { min: 0, max: 1e3 } },
        { id: 3, tag: "PUMP_001_STATUS", ioType: "DI", unit: "on/off" }
      ],
      total: 3
    });
  });
  app2.post("/api/core/telemetry/tags", (req, res) => {
    res.json({ id: 4, message: "Telemetry tag created", ...req.body });
  });
  app2.get("/api/core/telemetry/measurements", (req, res) => {
    res.json({
      data: [
        { id: 1, tag: "PUMP_001_FLOW", timestamp: "2025-11-24T14:30:00Z", value: "245" },
        { id: 2, tag: "RES_001_LEVEL", timestamp: "2025-11-24T14:30:00Z", value: "750" },
        { id: 3, tag: "PUMP_001_STATUS", timestamp: "2025-11-24T14:30:00Z", value: "on" }
      ]
    });
  });
  app2.post("/api/core/telemetry/measurements", (req, res) => {
    res.json({ id: 4, message: "Measurement recorded", ...req.body });
  });
  app2.get("/api/core/schedules", (req, res) => {
    res.json({
      data: [
        { id: 1, assetId: 1, startTime: "2025-12-01T06:00:00Z", endTime: "2025-12-01T12:00:00Z", status: "scheduled" },
        { id: 2, assetId: 1, startTime: "2025-12-01T18:00:00Z", endTime: "2025-12-02T00:00:00Z", status: "scheduled" }
      ],
      total: 2
    });
  });
  app2.post("/api/core/schedules", (req, res) => {
    res.json({ id: 3, message: "Schedule created", ...req.body });
  });
  app2.get("/api/core/outages", (req, res) => {
    res.json({
      data: [
        { id: 1, schemeId: 1, cause: "planned", state: "draft", reason: "Pump maintenance", estimatedAffectedPopulation: 8900 },
        { id: 2, schemeId: 1, cause: "fault", state: "live", reason: "Power outage", estimatedAffectedPopulation: 4500 }
      ],
      total: 2
    });
  });
  app2.post("/api/core/outages", (req, res) => {
    res.json({ id: 3, message: "Outage created", ...req.body });
  });
  app2.patch("/api/core/outages/:id", (req, res) => {
    res.json({ id: req.params.id, message: "Outage updated", ...req.body });
  });
  app2.get("/api/core/dosing/plans", (req, res) => {
    res.json({
      data: [
        { id: 1, schemeId: 1, assetId: 1, status: "active", flowBands: [{ min_lps: 0, max_lps: 100, target_mg_l: 0.5 }] }
      ],
      total: 1
    });
  });
  app2.post("/api/core/dosing/plans", (req, res) => {
    res.json({ id: 2, message: "Dosing plan created", ...req.body });
  });
  app2.get("/api/core/chemical-stocks", (req, res) => {
    res.json({
      data: [
        { id: 1, schemeId: 1, chemical: "chlorine", quantityL: 500, supplier: "ChemTrade", expiryDate: "2026-06-30" }
      ],
      total: 1
    });
  });
  app2.get("/api/core/pressure-leak-reports", (req, res) => {
    res.json({
      data: [
        { id: 1, dmaId: 1, reportType: "leak_detected", severity: "high", location: "Nyamira Road", status: "open" }
      ],
      total: 1
    });
  });
  app2.post("/api/core/pressure-leak-reports", (req, res) => {
    res.json({ id: 2, message: "Report created", ...req.body });
  });
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import glsl from "vite-plugin-glsl";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    glsl()
    // Add GLSL shader support
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  // Add support for large models and audio files
  assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.mp3", "**/*.ogg", "**/*.wav"]
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.get("/api/hydromet/aquifers", (req, res) => {
  res.json({ data: [
    { id: 1, name: "Elwak Aquifer", safeYieldMcm: 15, currentYieldMcm: 12, rechargeRateMcm: 3, riskLevel: "medium", waterQualityStatus: "Good", areaKm2: 5e3 },
    { id: 2, name: "Merti Aquifer", safeYieldMcm: 20, currentYieldMcm: 18, rechargeRateMcm: 4, riskLevel: "low", waterQualityStatus: "Excellent", areaKm2: 8e3 },
    { id: 3, name: "Neogene Aquifer", safeYieldMcm: 10, currentYieldMcm: 9, rechargeRateMcm: 2, riskLevel: "high", waterQualityStatus: "Fair", areaKm2: 3e3 }
  ] });
});
app.post("/api/hydromet/aquifers", (req, res) => {
  res.json({ id: 4, message: "Aquifer registered", ...req.body });
});
app.get("/api/core-ops/droughts", (req, res) => {
  res.json({ data: [
    { id: 1, name: "2025 ASAL Drought - Jan-Mar", status: "active", severity: "high", startDate: "2025-01-01", affectedPopulation: 125e3, activatedBoreholes: 8, waterRationing: true },
    { id: 2, name: "2024 Oct-Dec Drought", status: "resolved", severity: "medium", startDate: "2024-10-01", endDate: "2024-12-15", affectedPopulation: 85e3, activatedBoreholes: 5, waterRationing: false }
  ] });
});
app.post("/api/core-ops/droughts", (req, res) => {
  res.json({ id: 3, status: "declared", message: "Drought event declared", ...req.body });
});
app.post("/api/core-ops/droughts/:id/activate", (req, res) => {
  res.json({ id: req.params.id, status: "active", message: "Emergency response activated" });
});
app.get("/api/me/gender-equity", (req, res) => {
  res.json({ data: [
    { id: 1, gender: "female", count: 450, accessHours: 12, collectionTime: 45, satisfaction: 65 },
    { id: 2, gender: "male", count: 320, accessHours: 15, collectionTime: 15, satisfaction: 78 },
    { id: 3, gender: "youth", count: 280, accessHours: 14, collectionTime: 25, satisfaction: 72 },
    { id: 4, gender: "elderly", count: 95, accessHours: 10, collectionTime: 60, satisfaction: 58 }
  ] });
});
app.get("/api/training/assessments", (req, res) => {
  res.json({ data: [
    { id: 1, operatorId: "OP-001", operatorName: "James Kipchoge", topic: "operation", score: 85, maxScore: 100, status: "completed", certificationValid: true, validUntil: "2026-01-15" },
    { id: 2, operatorId: "OP-002", operatorName: "Mary Nairobi", topic: "maintenance", score: 92, maxScore: 100, status: "completed", certificationValid: true, validUntil: "2026-06-10" },
    { id: 3, operatorId: "OP-003", operatorName: "Peter Mwangi", topic: "safety", score: 78, maxScore: 100, status: "completed", certificationValid: false, validUntil: null }
  ] });
});
app.post("/api/training/assessments", (req, res) => {
  res.json({ id: 4, status: "pending", message: "Assessment recorded", ...req.body });
});
app.get("/api/v1/auth/user", (req, res) => {
  res.json({
    id: 1,
    name: "Demo User",
    email: "demo@example.com",
    tenant_id: 1,
    permissions: ["*"],
    authenticated: true
  });
});
app.get("/api/core-ops/predictions/asset-failures", (req, res) => {
  res.json({
    data: [
      { assetId: "pump_001", failureProbability: 87, daysToFailure: 8, confidence: 0.92, riskLevel: "high", recommendedAction: "schedule_maintenance_today" },
      { assetId: "pump_003", failureProbability: 62, daysToFailure: 21, confidence: 0.85, riskLevel: "medium", recommendedAction: "monitor_closely" }
    ]
  });
});
app.get("/api/core-ops/predictions/nrw-anomalies", (req, res) => {
  res.json({
    data: [
      { dmaId: "dma_001", nrwPercentage: 35.2, baselineNrw: 28.5, anomalyScore: 0.87, leakDetected: true, estimatedLossMc: 450, estimatedCostPerDay: 2250, urgency: "high" }
    ]
  });
});
app.get("/api/core-ops/predictions/demand-forecast/:schemeId", (req, res) => {
  res.json({
    data: [
      { date: "2025-12-01", demand: 1200, lower: 1050, upper: 1350 },
      { date: "2025-12-02", demand: 1350, lower: 1180, upper: 1520 },
      { date: "2025-12-03", demand: 1100, lower: 950, upper: 1250 }
    ]
  });
});
app.get("/api/core-ops/predictions/pump-schedule", (req, res) => {
  res.json({
    data: [
      { pumpId: "pump_001", startTime: "22:00", endTime: "04:00", reason: "off_peak_tariff", estimatedCost: 450 },
      { pumpId: "pump_002", startTime: "08:00", endTime: "10:00", reason: "peak_demand", estimatedCost: 180 }
    ]
  });
});
app.get("/api/core-ops/predictions/outage-impact", (req, res) => {
  res.json({
    affectedConnections: 1240,
    affectedPopulation: 6200,
    impactScore: 72,
    suggestedTiming: "2025-12-22 midnight (Sunday, lower demand)"
  });
});
app.get("/api/core-ops/nrw/snapshots/:dmaId", (req, res) => {
  res.json({
    data: [
      { date: "2025-11-24", nrw: 28.5, systemInput: 15e3, billed: 10725, loss: 4275 },
      { date: "2025-11-23", nrw: 27.2, systemInput: 14800, billed: 10778, loss: 4022 }
    ]
  });
});
app.get("/api/core-ops/interventions/:dmaId", (req, res) => {
  res.json({
    data: [
      { id: "1", type: "leak_detection", status: "completed", startDate: "2025-11-01", endDate: "2025-11-20", cost: 125e3, nrwReduction: 8 },
      { id: "2", type: "meter_audit", status: "ongoing", startDate: "2025-11-15", estimatedCost: 85e3 }
    ]
  });
});
registerCoreRegistryRoutes(app);
app.use("/api", createProxyMiddleware({
  target: "http://127.0.0.1:8000",
  changeOrigin: true,
  pathRewrite: {
    "^/": "/api/"
  },
  on: {
    proxyReq: (proxyReq, req) => {
      log(`[Proxy] ${req.method} ${req.url} \u2192 Laravel`);
    },
    proxyRes: (proxyRes, req) => {
      log(`[Proxy] \u2713 ${proxyRes.statusCode}`);
    },
    error: (err, req, res) => {
      log(`[Proxy Error] ${err.message}`);
      if (!res.headersSent) {
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          error: "Laravel API unavailable",
          message: "Start Laravel: cd api && php artisan serve --host=0.0.0.0 --port=8000",
          details: err.message
        }));
      }
    }
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
