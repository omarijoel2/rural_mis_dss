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
import { useWorkOrder, useUpdateWorkOrder } from '@/hooks/useWorkOrders';
import * as ImagePicker from 'expo-image-picker';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export default function WorkOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: workOrder, isLoading } = useWorkOrder(id);
  const updateMutation = useUpdateWorkOrder();

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
  });

  const handleEdit = () => {
    if (workOrder) {
      setEditedData({
        title: workOrder.title,
        description: workOrder.description || '',
        status: workOrder.status,
        priority: workOrder.priority,
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
      Alert.alert('Success', 'Work order updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update work order');
    }
  };

  const handleCapturePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('Photo captured:', result.assets[0].uri);
      Alert.alert('Photo Captured', 'Photo will be uploaded when syncing');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (!workOrder) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Work order not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-sky-600 px-6 py-8">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-sm mb-1">{workOrder.code}</Text>
        <Text className="text-white text-2xl font-bold">{workOrder.title}</Text>
      </View>

      <View className="px-6 py-6">
        {!isEditing ? (
          <>
            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-sm text-gray-600 mb-1">Description</Text>
              <Text className="text-base text-gray-900">
                {workOrder.description || 'No description'}
              </Text>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-white rounded-lg p-4">
                <Text className="text-sm text-gray-600 mb-1">Status</Text>
                <Text className="text-base font-medium text-gray-900 capitalize">
                  {workOrder.status.replace('_', ' ')}
                </Text>
              </View>

              <View className="flex-1 bg-white rounded-lg p-4">
                <Text className="text-sm text-gray-600 mb-1">Priority</Text>
                <Text className="text-base font-medium text-gray-900 capitalize">
                  {workOrder.priority}
                </Text>
              </View>
            </View>

            {workOrder.dueDate && (
              <View className="bg-white rounded-lg p-4 mb-4">
                <Text className="text-sm text-gray-600 mb-1">Due Date</Text>
                <Text className="text-base font-medium text-gray-900">
                  {new Date(workOrder.dueDate).toLocaleDateString()}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className="bg-white rounded-lg py-4 items-center mb-3 flex-row justify-center"
              onPress={handleCapturePhoto}
            >
              <Ionicons name="camera" size={20} color="#0284c7" />
              <Text className="text-sky-600 font-semibold text-base ml-2">
                Capture Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-sky-600 rounded-lg py-4 items-center"
              onPress={handleEdit}
            >
              <Text className="text-white font-semibold text-base">
                Edit Work Order
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Title</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={editedData.title}
                onChangeText={(text) =>
                  setEditedData({ ...editedData, title: text })
                }
              />
            </View>

            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Description
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={editedData.description}
                onChangeText={(text) =>
                  setEditedData({ ...editedData, description: text })
                }
                multiline
                numberOfLines={4}
              />
            </View>

            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-3">Status</Text>
              <View className="flex-row flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className={`px-4 py-2 rounded-lg ${
                      editedData.status === option.value
                        ? 'bg-sky-600'
                        : 'bg-gray-100'
                    }`}
                    onPress={() =>
                      setEditedData({ ...editedData, status: option.value })
                    }
                  >
                    <Text
                      className={`text-sm font-medium ${
                        editedData.status === option.value
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-3">
                Priority
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {PRIORITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className={`px-4 py-2 rounded-lg ${
                      editedData.priority === option.value
                        ? 'bg-sky-600'
                        : 'bg-gray-100'
                    }`}
                    onPress={() =>
                      setEditedData({ ...editedData, priority: option.value })
                    }
                  >
                    <Text
                      className={`text-sm font-medium ${
                        editedData.priority === option.value
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
