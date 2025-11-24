// Device registry and offline sync service

export interface SyncOperation {
  id: string;
  deviceId: string;
  operation: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: string;
  payload: any;
  status: 'pending' | 'synced' | 'conflict' | 'failed';
  conflictResolution?: 'server' | 'device' | 'merge';
  timestamp: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  osType: string;
  osVersion: string;
  appVersion: string;
  serialNumber: string;
  location: string;
  status: 'active' | 'inactive' | 'offline' | 'lost';
  lastSyncedAt: string;
  lastLocationUpdate: string;
}

// In-memory storage for demo (replace with database in production)
const deviceRegistry = new Map<string, DeviceInfo>();
const syncQueue: SyncOperation[] = [];

/**
 * Register a device
 */
export function registerDevice(device: DeviceInfo): DeviceInfo {
  deviceRegistry.set(device.deviceId, device);
  console.log(`✓ Device registered: ${device.deviceName} (${device.deviceId})`);
  return device;
}

/**
 * Get device info
 */
export function getDevice(deviceId: string): DeviceInfo | null {
  return deviceRegistry.get(deviceId) || null;
}

/**
 * List all devices
 */
export function listDevices(): DeviceInfo[] {
  return Array.from(deviceRegistry.values());
}

/**
 * Update device status (active/inactive/offline/lost)
 */
export function updateDeviceStatus(
  deviceId: string,
  status: DeviceInfo['status']
): DeviceInfo | null {
  const device = deviceRegistry.get(deviceId);
  if (device) {
    device.status = status;
    device.lastLocationUpdate = new Date().toISOString();
    return device;
  }
  return null;
}

/**
 * Queue a sync operation
 */
export function queueSyncOperation(
  deviceId: string,
  operation: 'create' | 'update' | 'delete',
  entityType: string,
  entityId: string,
  payload: any
): SyncOperation {
  const syncOp: SyncOperation = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    deviceId,
    operation,
    entityType,
    entityId,
    payload,
    status: 'pending',
    timestamp: new Date().toISOString(),
  };

  syncQueue.push(syncOp);
  console.log(`📤 Queued ${operation} operation for ${entityType} from device ${deviceId}`);
  return syncOp;
}

/**
 * Get pending sync operations for a device
 */
export function getPendingSyncOperations(deviceId: string): SyncOperation[] {
  return syncQueue.filter(op => op.deviceId === deviceId && op.status === 'pending');
}

/**
 * Resolve sync conflict
 */
export function resolveSyncConflict(
  syncOpId: string,
  resolution: 'server' | 'device' | 'merge'
): SyncOperation | null {
  const syncOp = syncQueue.find(op => op.id === syncOpId);
  if (syncOp) {
    syncOp.status = 'synced';
    syncOp.conflictResolution = resolution;
    console.log(`✓ Conflict resolved using ${resolution} strategy`);
    return syncOp;
  }
  return null;
}

/**
 * Mark sync operation as completed
 */
export function completeSyncOperation(syncOpId: string): SyncOperation | null {
  const syncOp = syncQueue.find(op => op.id === syncOpId);
  if (syncOp) {
    syncOp.status = 'synced';
    const device = deviceRegistry.get(syncOp.deviceId);
    if (device) {
      device.lastSyncedAt = new Date().toISOString();
    }
    console.log(`✓ Sync operation completed: ${syncOpId}`);
    return syncOp;
  }
  return null;
}

/**
 * Get sync queue statistics
 */
export function getSyncQueueStats() {
  const pending = syncQueue.filter(op => op.status === 'pending').length;
  const synced = syncQueue.filter(op => op.status === 'synced').length;
  const conflicts = syncQueue.filter(op => op.status === 'conflict').length;
  const failed = syncQueue.filter(op => op.status === 'failed').length;

  return {
    total: syncQueue.length,
    pending,
    synced,
    conflicts,
    failed,
  };
}
