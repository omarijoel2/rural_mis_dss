import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCustomers, useSyncCustomers } from '@/hooks/useCustomers';

export default function CustomersScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: customers, isLoading, refetch } = useCustomers(search);
  const syncMutation = useSyncCustomers();

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
        <Text className="text-gray-600 mt-4">Loading customers...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search by name or account number"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={customers || []}
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
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 text-center">
              {search ? 'No customers found' : 'No customers yet'}
            </Text>
            {!search && (
              <TouchableOpacity
                className="mt-4 bg-sky-600 px-6 py-3 rounded-lg"
                onPress={handleSync}
              >
                <Text className="text-white font-semibold">Sync from Server</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-lg p-4 mb-3 border border-gray-200"
            onPress={() => router.push(`/(app)/customers/${item.id}`)}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-semibold text-gray-900 flex-1">
                {item.name}
              </Text>
              <View
                className={`px-2 py-1 rounded ${
                  item.status === 'active'
                    ? 'bg-green-100'
                    : item.status === 'suspended'
                    ? 'bg-yellow-100'
                    : 'bg-red-100'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    item.status === 'active'
                      ? 'text-green-800'
                      : item.status === 'suspended'
                      ? 'text-yellow-800'
                      : 'text-red-800'
                  }`}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <Text className="text-sm text-gray-600 mb-1">
              Account: {item.accountNumber}
            </Text>

            {item.phoneNumber && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="call-outline" size={14} color="#6b7280" />
                <Text className="text-sm text-gray-600 ml-1">
                  {item.phoneNumber}
                </Text>
              </View>
            )}

            {item.email && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="mail-outline" size={14} color="#6b7280" />
                <Text className="text-sm text-gray-600 ml-1">{item.email}</Text>
              </View>
            )}

            {item.syncedAt && (
              <View className="flex-row items-center mt-2 pt-2 border-t border-gray-100">
                <Ionicons
                  name="cloud-done-outline"
                  size={14}
                  color="#10b981"
                />
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
