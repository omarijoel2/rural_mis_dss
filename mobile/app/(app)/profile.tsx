import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, activeTenant, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-gray-50 p-6">
      <View className="bg-white rounded-lg p-6 mb-4">
        <Text className="text-xl font-bold text-gray-900 mb-4">Profile</Text>
        <View className="space-y-3">
          <View>
            <Text className="text-sm text-gray-600">Name</Text>
            <Text className="text-base font-medium text-gray-900">{user?.name}</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-600">Email</Text>
            <Text className="text-base font-medium text-gray-900">{user?.email}</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-600">Active Utility</Text>
            <Text className="text-base font-medium text-gray-900">{activeTenant?.name}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="bg-red-600 rounded-lg py-4 items-center"
        onPress={handleLogout}
      >
        <Text className="text-white font-semibold text-base">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
