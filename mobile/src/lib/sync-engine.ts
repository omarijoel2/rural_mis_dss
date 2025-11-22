import { Q } from '@nozbe/watermelondb';
import { database } from '../database';
import { apiClient } from './api-client';
import SyncQueue from '../database/models/SyncQueue';
import Customer from '../database/models/Customer';

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
      console.log(`Pulling data from server for tenant ${tenantId}...`);

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
      console.error('Failed to pull data from server:', error);
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
