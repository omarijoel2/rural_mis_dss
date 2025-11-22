import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCustomer, useUpdateCustomer } from '@/hooks/useCustomers';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: customer, isLoading } = useCustomer(id);
  const updateMutation = useUpdateCustomer();

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  const handleEdit = () => {
    if (customer) {
      setEditedData({
        name: customer.name,
        email: customer.email || '',
        phoneNumber: customer.phoneNumber || '',
        address: customer.address || '',
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: editedData,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Customer updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update customer');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Customer not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-sky-600 px-6 py-8">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">{customer.name}</Text>
        <Text className="text-sky-100 text-sm mt-1">
          Account: {customer.accountNumber}
        </Text>
      </View>

      <View className="px-6 py-6">
        {!isEditing ? (
          <>
            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-sm text-gray-600 mb-1">Status</Text>
              <Text className="text-base font-medium text-gray-900 capitalize">
                {customer.status}
              </Text>
            </View>

            {customer.email && (
              <View className="bg-white rounded-lg p-4 mb-4">
                <Text className="text-sm text-gray-600 mb-1">Email</Text>
                <Text className="text-base font-medium text-gray-900">
                  {customer.email}
                </Text>
              </View>
            )}

            {customer.phoneNumber && (
              <View className="bg-white rounded-lg p-4 mb-4">
                <Text className="text-sm text-gray-600 mb-1">Phone Number</Text>
                <Text className="text-base font-medium text-gray-900">
                  {customer.phoneNumber}
                </Text>
              </View>
            )}

            {customer.address && (
              <View className="bg-white rounded-lg p-4 mb-4">
                <Text className="text-sm text-gray-600 mb-1">Address</Text>
                <Text className="text-base font-medium text-gray-900">
                  {customer.address}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className="bg-sky-600 rounded-lg py-4 items-center mt-4"
              onPress={handleEdit}
            >
              <Text className="text-white font-semibold text-base">
                Edit Customer
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={editedData.name}
                onChangeText={(text) =>
                  setEditedData({ ...editedData, name: text })
                }
              />
            </View>

            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={editedData.email}
                onChangeText={(text) =>
                  setEditedData({ ...editedData, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={editedData.phoneNumber}
                onChangeText={(text) =>
                  setEditedData({ ...editedData, phoneNumber: text })
                }
                keyboardType="phone-pad"
              />
            </View>

            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Address
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={editedData.address}
                onChangeText={(text) =>
                  setEditedData({ ...editedData, address: text })
                }
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              className="bg-sky-600 rounded-lg py-4 items-center mb-3"
              onPress={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-200 rounded-lg py-4 items-center"
              onPress={() => setIsEditing(false)}
            >
              <Text className="text-gray-700 font-semibold text-base">
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}
