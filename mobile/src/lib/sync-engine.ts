import { Q } from '@nozbe/watermelondb';
import { database } from '../database';
import { apiClient } from './api-client';
import SyncQueue from '../database/models/SyncQueue';
import Customer from '../database/models/Customer';
import WorkOrder from '../database/models/WorkOrder';
import Asset from '../database/models/Asset';
import WaterQualityTest from '../database/models/WaterQualityTest';

export class SyncEngine {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  async queueMutation(
    tableName: string,
    recordId: string,
    operation: 'create' | 'update' | 'delete',
    changes: Record<string, unknown>,
    tenantId: string
  ) {
    await database.write(async () => {
      const syncQueueCollection = database.get<SyncQueue>('sync_queue');
      await syncQueueCollection.create((queue) => {
        queue.tableName = tableName;
        queue.recordId = recordId;
        queue.operation = operation;
        queue.changes = JSON.stringify(changes);
        queue.tenantId = tenantId;
        queue.retryCount = 0;
      });
    });

    console.log(`Queued ${operation} for ${tableName}:${recordId}`);
  }

  async processSyncQueue(tenantId: string) {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;

    try {
      const syncQueueCollection = database.get<SyncQueue>('sync_queue');
      const pendingMutations = await syncQueueCollection
        .query(Q.where('tenant_id', tenantId))
        .fetch();

      console.log(`Processing ${pendingMutations.length} pending mutations for tenant ${tenantId}`);

      for (const mutation of pendingMutations) {
        try {
          const changes = JSON.parse(mutation.changes);

          await apiClient.put(`/${mutation.tableName}/${mutation.recordId}`, changes);

          await database.write(async () => {
            await mutation.destroyPermanently();
          });

          console.log(`Synced ${mutation.operation} for ${mutation.tableName}`);
        } catch (error) {
          console.error(`Failed to sync mutation:`, error);

          await database.write(async () => {
            await mutation.update((record) => {
              record.retryCount = (mutation.retryCount || 0) + 1;
            });
          });

          if (mutation.retryCount >= 5) {
            console.error(`Max retries reached for mutation, keeping in queue`);
          }
        }
      }
    } catch (error) {
      console.error('Sync queue processing failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  async pullFromServer(tenantId: string) {
    try {
      console.log(`Pulling customers from server for tenant ${tenantId}...`);

      const response = await apiClient.get('/customers', { 
        params: { per_page: 1000 } 
      });

      const customersData = response.data.data || [];

      await database.write(async () => {
        const customersCollection = database.get<Customer>('customers');

        for (const customerData of customersData) {
          const existingCustomers = await customersCollection
            .query(
              Q.and(
                Q.where('server_id', customerData.id),
                Q.where('tenant_id', tenantId)
              )
            )
            .fetch();

          if (existingCustomers.length > 0) {
            await existingCustomers[0].update((customer) => {
              customer.accountNumber = customerData.account_number;
              customer.name = customerData.name;
              customer.email = customerData.email;
              customer.phoneNumber = customerData.phone_number;
              customer.address = customerData.address;
              customer.status = customerData.status;
              customer.syncedAt = Date.now();
            });
          } else {
            await customersCollection.create((customer) => {
              customer.serverId = customerData.id;
              customer.accountNumber = customerData.account_number;
              customer.name = customerData.name;
              customer.email = customerData.email;
              customer.phoneNumber = customerData.phone_number;
              customer.address = customerData.address;
              customer.status = customerData.status;
              customer.tenantId = tenantId;
              customer.syncedAt = Date.now();
            });
          }
        }
      });

      console.log(`Synced ${customersData.length} customers for tenant ${tenantId}`);
    } catch (error) {
      console.error('Failed to pull customers from server:', error);
      throw error;
    }
  }

  async pullWorkOrdersFromServer(tenantId: string) {
    try {
      console.log(`Pulling work orders from server for tenant ${tenantId}...`);

      const response = await apiClient.get('/work-orders', { 
        params: { per_page: 1000 } 
      });

      const workOrdersData = response.data.data || [];

      await database.write(async () => {
        const workOrdersCollection = database.get<WorkOrder>('work_orders');

        for (const woData of workOrdersData) {
          const existingWorkOrders = await workOrdersCollection
            .query(
              Q.and(
                Q.where('server_id', woData.id),
                Q.where('tenant_id', tenantId)
              )
            )
            .fetch();

          if (existingWorkOrders.length > 0) {
            await existingWorkOrders[0].update((wo) => {
              wo.code = woData.code;
              wo.title = woData.title;
              wo.description = woData.description;
              wo.status = woData.status;
              wo.priority = woData.priority;
              wo.assignedTo = woData.assigned_to;
              wo.dueDate = woData.due_date ? new Date(woData.due_date) : undefined;
              wo.syncedAt = Date.now();
            });
          } else {
            await workOrdersCollection.create((wo) => {
              wo.serverId = woData.id;
              wo.code = woData.code;
              wo.title = woData.title;
              wo.description = woData.description;
              wo.status = woData.status;
              wo.priority = woData.priority;
              wo.assignedTo = woData.assigned_to;
              wo.dueDate = woData.due_date ? new Date(woData.due_date) : undefined;
              wo.tenantId = tenantId;
              wo.syncedAt = Date.now();
            });
          }
        }
      });

      console.log(`Synced ${workOrdersData.length} work orders for tenant ${tenantId}`);
    } catch (error) {
      console.error('Failed to pull work orders from server:', error);
      throw error;
    }
  }

  async pullAssetsFromServer(tenantId: string) {
    try {
      console.log(`Pulling assets from server for tenant ${tenantId}...`);

      const response = await apiClient.get('/assets', { 
        params: { per_page: 1000 } 
      });

      const assetsData = response.data.data || [];

      await database.write(async () => {
        const assetsCollection = database.get<Asset>('assets');

        for (const assetData of assetsData) {
          const existingAssets = await assetsCollection
            .query(
              Q.and(
                Q.where('server_id', assetData.id),
                Q.where('tenant_id', tenantId)
              )
            )
            .fetch();

          if (existingAssets.length > 0) {
            await existingAssets[0].update((asset) => {
              asset.assetTag = assetData.asset_tag;
              asset.name = assetData.name;
              asset.category = assetData.category;
              asset.status = assetData.status;
              asset.location = assetData.location;
              asset.latitude = assetData.latitude;
              asset.longitude = assetData.longitude;
              asset.syncedAt = Date.now();
            });
          } else {
            await assetsCollection.create((asset) => {
              asset.serverId = assetData.id;
              asset.assetTag = assetData.asset_tag;
              asset.name = assetData.name;
              asset.category = assetData.category;
              asset.status = assetData.status;
              asset.location = assetData.location;
              asset.latitude = assetData.latitude;
              asset.longitude = assetData.longitude;
              asset.tenantId = tenantId;
              asset.syncedAt = Date.now();
            });
          }
        }
      });

      console.log(`Synced ${assetsData.length} assets for tenant ${tenantId}`);
    } catch (error) {
      console.error('Failed to pull assets from server:', error);
      throw error;
    }
  }

  async pullWaterQualityTestsFromServer(tenantId: string) {
    try {
      console.log(`Pulling water quality tests from server for tenant ${tenantId}...`);

      const response = await apiClient.get('/water-quality-tests', { 
        params: { per_page: 1000 } 
      });

      const testsData = response.data.data || [];

      await database.write(async () => {
        const testsCollection = database.get<WaterQualityTest>('water_quality_tests');

        for (const testData of testsData) {
          const existingTests = await testsCollection
            .query(
              Q.and(
                Q.where('server_id', testData.id),
                Q.where('tenant_id', tenantId)
              )
            )
            .fetch();

          if (existingTests.length > 0) {
            await existingTests[0].update((test) => {
              test.sampleId = testData.sample_id;
              test.location = testData.location;
              test.ph = testData.ph;
              test.turbidity = testData.turbidity;
              test.chlorine = testData.chlorine;
              test.eColi = testData.e_coli;
              test.testDate = new Date(testData.test_date);
              test.testedBy = testData.tested_by;
              test.syncedAt = Date.now();
            });
          } else {
            await testsCollection.create((test) => {
              test.serverId = testData.id;
              test.sampleId = testData.sample_id;
              test.location = testData.location;
              test.ph = testData.ph;
              test.turbidity = testData.turbidity;
              test.chlorine = testData.chlorine;
              test.eColi = testData.e_coli;
              test.testDate = new Date(testData.test_date);
              test.testedBy = testData.tested_by;
              test.tenantId = tenantId;
              test.syncedAt = Date.now();
            });
          }
        }
      });

      console.log(`Synced ${testsData.length} water quality tests for tenant ${tenantId}`);
    } catch (error) {
      console.error('Failed to pull water quality tests from server:', error);
      throw error;
    }
  }

  startAutoSync(tenantId: string, intervalMs: number = 60000) {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    this.syncInterval = setInterval(() => {
      this.processSyncQueue(tenantId);
    }, intervalMs);

    console.log(`Auto-sync started for tenant ${tenantId} (interval: ${intervalMs}ms)`);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }
}

export const syncEngine = new SyncEngine();
