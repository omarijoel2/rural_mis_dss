import { useState, useEffect } from 'react';
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
import * as Location from 'expo-location';
import { useAsset, useUpdateAsset } from '@/hooks/useAssets';

const STATUS_OPTIONS = [
  { value: 'operational', label: 'Operational' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'repair', label: 'Repair' },
  { value: 'decommissioned', label: 'Decommissioned' },
];

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: asset, isLoading } = useAsset(id);
  const updateMutation = useUpdateAsset();

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    category: '',
    status: '',
    location: '',
    latitude: 0,
    longitude: 0,
  });

  const handleEdit = () => {
    if (asset) {
      setEditedData({
        name: asset.name,
        category: asset.category,
        status: asset.status,
        location: asset.location || '',
        latitude: asset.latitude || 0,
        longitude: asset.longitude || 0,
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
      Alert.alert('Success', 'Asset updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update asset');
    }
  };

  const handleCaptureLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required to capture GPS coordinates');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setEditedData({
        ...editedData,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      Alert.alert('Location Captured', `GPS: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture location');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (!asset) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Asset not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-sky-600 px-6 py-8">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-sm mb-1">{asset.assetTag}</Text>
        <Text className="text-white text-2xl font-bold">{asset.name}</Text>
      </View>

      <View className="px-6 py-6">
        {!isEditing ? (
          <>
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-white rounded-lg p-4">
                <Text className="text-sm text-gray-600 mb-1">Category</Text>
                <Text className="text-base font-medium text-gray-900 capitalize">
                  {asset.category}
                </Text>
              </View>

              <View className="flex-1 bg-white rounded-lg p-4">
                <Text className="text-sm text-gray-600 mb-1">Status</Text>
                <Text className="text-base font-medium text-gray-900 capitalize">
                  {asset.status}
                </Text>
              </View>
            </View>

            {asset.location && (
              <View className="bg-white rounded-lg p-4 mb-4">
                <Text className="text-sm text-gray-600 mb-1">Location</Text>
                <Text className="text-base font-medium text-gray-900">
                  {asset.location}
                </Text>
              </View>
            )}

            {asset.latitude && asset.longitude && (
              <View className="bg-white rounded-lg p-4 mb-4">
                <Text className="text-sm text-gray-600 mb-1">GPS Coordinates</Text>
                <Text className="text-base font-medium text-gray-900">
                  {asset.latitude.toFixed(6)}, {asset.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className="bg-sky-600 rounded-lg py-4 items-center"
              onPress={handleEdit}
            >
              <Text className="text-white font-semibold text-base">
                Inspect Asset
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
              <Text className="text-sm font-medium text-gray-700 mb-2">Location</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={editedData.location}
                onChangeText={(text) =>
                  setEditedData({ ...editedData, location: text })
                }
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

            {editedData.latitude !== 0 && editedData.longitude !== 0 && (
              <View className="bg-white rounded-lg p-4 mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  GPS Coordinates
                </Text>
                <Text className="text-base text-gray-900">
                  {editedData.latitude.toFixed(6)}, {editedData.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className="bg-white rounded-lg py-4 items-center mb-3 flex-row justify-center"
              onPress={handleCaptureLocation}
            >
              <Ionicons name="navigate" size={20} color="#0284c7" />
              <Text className="text-sky-600 font-semibold text-base ml-2">
                Capture GPS Location
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-sky-600 rounded-lg py-4 items-center mb-3"
              onPress={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Save Inspection
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
