import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';

interface Tenant {
  id: string;
  name: string;
  county: string;
}

export default function TenantSelectScreen() {
  const router = useRouter();
  const { setActiveTenant } = useAuthStore();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const response = await apiClient.get('/tenants');
      const tenantsData = response.data.data || response.data;
      setTenants(tenantsData);
    } catch (error) {
      console.error('Failed to load tenants:', error);
      Alert.alert('Error', 'Failed to load water utilities. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTenant = async (tenant: Tenant) => {
    setIsSelecting(true);
    try {
      await setActiveTenant(tenant);
      router.replace('/(app)/home');
    } catch (error) {
      Alert.alert('Error', 'Failed to select utility. Please try again.');
    } finally {
      setIsSelecting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="text-gray-600 mt-4">Loading utilities...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-6 py-12">
      <View className="mb-8">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Select Water Utility
        </Text>
        <Text className="text-base text-gray-600">
          Choose the utility you want to work with
        </Text>
      </View>

      {tenants.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600 text-center">
            No water utilities available.{'\n'}Please contact your administrator.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tenants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="border border-gray-200 rounded-lg p-4 mb-3 active:bg-gray-50"
              onPress={() => handleSelectTenant(item)}
              disabled={isSelecting}
            >
              <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
              <Text className="text-sm text-gray-600 mt-1">{item.county}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {isSelecting && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <View className="bg-white rounded-lg p-6">
            <ActivityIndicator size="large" color="#0284c7" />
            <Text className="text-gray-900 mt-4">Switching utility...</Text>
          </View>
        </View>
      )}
    </View>
  );
}
