import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAssets, useSyncAssets } from '@/hooks/useAssets';

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pump', label: 'Pumps' },
  { value: 'pipeline', label: 'Pipelines' },
  { value: 'tank', label: 'Tanks' },
  { value: 'meter', label: 'Meters' },
];

const STATUS_COLORS = {
  operational: 'bg-green-100 text-green-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  repair: 'bg-orange-100 text-orange-800',
  decommissioned: 'bg-red-100 text-red-800',
};

export default function AssetsScreen() {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { data: assets, isLoading } = useAssets(categoryFilter);
  const syncMutation = useSyncAssets();

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="text-gray-600 mt-4">Loading assets...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row gap-2 flex-wrap">
          {CATEGORY_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              className={`px-4 py-2 rounded-lg ${
                categoryFilter === filter.value
                  ? 'bg-sky-600'
                  : 'bg-gray-100'
              }`}
              onPress={() => setCategoryFilter(filter.value)}
            >
              <Text
                className={`text-sm font-medium ${
                  categoryFilter === filter.value
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={assets || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={syncMutation.isPending}
            onRefresh={handleSync}
          />
        }
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-12">
            <Ionicons name="construct-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 text-center">
              {categoryFilter === 'all' ? 'No assets yet' : `No ${categoryFilter} assets`}
            </Text>
            <TouchableOpacity
              className="mt-4 bg-sky-600 px-6 py-3 rounded-lg"
              onPress={handleSync}
            >
              <Text className="text-white font-semibold">Sync from Server</Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-lg p-4 mb-3 border border-gray-200"
            onPress={() => router.push(`/(app)/assets/${item.id}`)}
          >
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-2">
                <Text className="text-sm text-gray-500 mb-1">{item.assetTag}</Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {item.name}
                </Text>
              </View>
              <View
                className={`px-2 py-1 rounded ${
                  STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]
                }`}
              >
                <Text className="text-xs font-medium capitalize">
                  {item.status}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-2">
              <Ionicons name="pricetag-outline" size={14} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-1 capitalize">
                {item.category}
              </Text>
            </View>

            {item.location && (
              <View className="flex-row items-center mb-2">
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text className="text-sm text-gray-600 ml-1">
                  {item.location}
                </Text>
              </View>
            )}

            {item.latitude && item.longitude && (
              <View className="flex-row items-center">
                <Ionicons name="navigate-outline" size={14} color="#6b7280" />
                <Text className="text-xs text-gray-500 ml-1">
                  {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            {item.syncedAt && (
              <View className="flex-row items-center mt-2 pt-2 border-t border-gray-100">
                <Ionicons name="cloud-done-outline" size={14} color="#10b981" />
                <Text className="text-xs text-gray-500 ml-1">
                  Synced {new Date(item.syncedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
