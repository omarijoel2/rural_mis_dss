import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/lib/auth-store';

export default function HomeScreen() {
  const { user, activeTenant } = useAuthStore();

  const features = [
    { id: '1', name: 'Customers', icon: 'people', route: '/customers' },
    { id: '2', name: 'Work Orders', icon: 'clipboard', route: '/work-orders' },
    { id: '3', name: 'Assets', icon: 'cube', route: '/assets' },
    { id: '4', name: 'Water Quality', icon: 'water', route: '/water-quality' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-sky-600 px-6 py-8">
        <Text className="text-white text-2xl font-bold">Welcome back</Text>
        <Text className="text-sky-100 text-base mt-1">{user?.name}</Text>
        <Text className="text-sky-200 text-sm mt-1">{activeTenant?.name}</Text>
      </View>

      <View className="px-6 py-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
        <View className="flex-row flex-wrap -mx-2">
          {features.map((feature) => (
            <View key={feature.id} className="w-1/2 px-2 mb-4">
              <TouchableOpacity className="bg-white rounded-lg p-6 items-center shadow-sm border border-gray-100">
                <Ionicons name={feature.icon as any} size={32} color="#0284c7" />
                <Text className="text-gray-900 font-medium mt-3 text-center">
                  {feature.name}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
          <Text className="text-base font-semibold text-gray-900 mb-2">
            Offline Mode Active
          </Text>
          <Text className="text-sm text-gray-600">
            Your data will sync when you're back online
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
