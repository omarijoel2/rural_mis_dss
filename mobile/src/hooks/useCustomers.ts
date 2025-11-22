import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Q } from '@nozbe/watermelondb';
import { database } from '../database';
import Customer from '../database/models/Customer';
import { syncEngine } from '../lib/sync-engine';
import { useAuthStore } from '../lib/auth-store';

interface SerializedCustomer {
  id: string;
  serverId: string;
  accountNumber: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  status: string;
  tenantId: string;
  syncedAt?: number;
  createdAt: Date;
  updatedAt: Date;
}

function serializeCustomer(customer: Customer): SerializedCustomer {
  return {
    id: customer.id,
    serverId: customer.serverId,
    accountNumber: customer.accountNumber,
    name: customer.name,
    email: customer.email,
    phoneNumber: customer.phoneNumber,
    address: customer.address,
    status: customer.status,
    tenantId: customer.tenantId,
    syncedAt: customer.syncedAt,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

export function useCustomers(search?: string) {
  const { activeTenant } = useAuthStore();

  return useQuery({
    queryKey: ['customers', activeTenant?.id, search],
    queryFn: async () => {
      const customersCollection = database.get<Customer>('customers');
      
      let query = customersCollection.query(
        Q.where('tenant_id', activeTenant?.id || '')
      );

      if (search) {
        query = query.extend(
          Q.or(
            Q.where('name', Q.like(`%${Q.sanitizeLikeString(search)}%`)),
            Q.where('account_number', Q.like(`%${Q.sanitizeLikeString(search)}%`))
          )
        );
      }

      const customers = await query.fetch();
      return customers.map(serializeCustomer);
    },
    enabled: !!activeTenant,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const customersCollection = database.get<Customer>('customers');
      const customer = await customersCollection.find(id);
      return serializeCustomer(customer);
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const { activeTenant } = useAuthStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SerializedCustomer> }) => {
      const customersCollection = database.get<Customer>('customers');
      const customer = await customersCollection.find(id);

      await database.write(async () => {
        await customer.update((record) => {
          if (data.name) record.name = data.name;
          if (data.email !== undefined) record.email = data.email;
          if (data.phoneNumber !== undefined) record.phoneNumber = data.phoneNumber;
          if (data.address !== undefined) record.address = data.address;
          if (data.status) record.status = data.status;
        });
      });

      await syncEngine.queueMutation(
        'customers',
        customer.serverId,
        'update',
        data as Record<string, unknown>,
        activeTenant?.id || ''
      );

      return serializeCustomer(customer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useSyncCustomers() {
  const queryClient = useQueryClient();
  const { activeTenant } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (!activeTenant) throw new Error('No active tenant');
      await syncEngine.processSyncQueue(activeTenant.id);
      await syncEngine.pullFromServer(activeTenant.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
