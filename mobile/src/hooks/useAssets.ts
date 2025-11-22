import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Q } from '@nozbe/watermelondb';
import { database } from '../database';
import Asset from '../database/models/Asset';
import { syncEngine } from '../lib/sync-engine';
import { useAuthStore } from '../lib/auth-store';

interface SerializedAsset {
  id: string;
  serverId: string;
  assetTag: string;
  name: string;
  category: string;
  status: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  tenantId: string;
  syncedAt?: number;
  createdAt: Date;
  updatedAt: Date;
}

function serializeAsset(asset: Asset): SerializedAsset {
  return {
    id: asset.id as string,
    serverId: asset.serverId,
    assetTag: asset.assetTag,
    name: asset.name,
    category: asset.category,
    status: asset.status,
    location: asset.location,
    latitude: asset.latitude,
    longitude: asset.longitude,
    tenantId: asset.tenantId,
    syncedAt: asset.syncedAt,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };
}

export function useAssets(categoryFilter?: string) {
  const { activeTenant } = useAuthStore();

  return useQuery({
    queryKey: ['assets', activeTenant?.id, categoryFilter],
    queryFn: async () => {
      const assetsCollection = database.get<Asset>('assets');
      
      let query = assetsCollection.query(
        Q.where('tenant_id', activeTenant?.id || '')
      );

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.extend(Q.where('category', categoryFilter));
      }

      const assets = await query.fetch();
      return assets.map(serializeAsset);
    },
    enabled: !!activeTenant,
  });
}

export function useAsset(id: string) {
  const { activeTenant } = useAuthStore();

  return useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const assetsCollection = database.get<Asset>('assets');
      const asset = await assetsCollection.find(id);
      
      if (asset.tenantId !== activeTenant?.id) {
        throw new Error('Asset not found in active tenant');
      }
      
      return serializeAsset(asset);
    },
    enabled: !!activeTenant,
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  const { activeTenant } = useAuthStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SerializedAsset> }) => {
      const assetsCollection = database.get<Asset>('assets');
      const asset = await assetsCollection.find(id);

      await database.write(async () => {
        await asset.update((record) => {
          if (data.name) record.name = data.name;
          if (data.category) record.category = data.category;
          if (data.status) record.status = data.status;
          if (data.location !== undefined) record.location = data.location;
          if (data.latitude !== undefined) record.latitude = data.latitude;
          if (data.longitude !== undefined) record.longitude = data.longitude;
        });
      });

      await syncEngine.queueMutation(
        'assets',
        asset.serverId,
        'update',
        data as Record<string, unknown>,
        activeTenant?.id || ''
      );

      return serializeAsset(asset);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useSyncAssets() {
  const queryClient = useQueryClient();
  const { activeTenant } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (!activeTenant) throw new Error('No active tenant');
      await syncEngine.processSyncQueue(activeTenant.id);
      await syncEngine.pullAssetsFromServer(activeTenant.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}
