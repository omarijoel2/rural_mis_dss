import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWaterQualityTests, useCreateWaterQualityTest, useSyncWaterQualityTests } from '@/hooks/useWaterQuality';

export default function WaterQualityScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data: tests, isLoading } = useWaterQualityTests();
  const createMutation = useCreateWaterQualityTest();
  const syncMutation = useSyncWaterQualityTests();

  const [newTest, setNewTest] = useState({
    location: '',
    ph: '',
    turbidity: '',
    chlorine: '',
    eColi: '',
  });

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleCreateTest = async () => {
    if (!newTest.location) {
      Alert.alert('Validation Error', 'Location is required');
      return;
    }

    try {
      await createMutation.mutateAsync({
        location: newTest.location,
        ph: newTest.ph ? parseFloat(newTest.ph) : undefined,
        turbidity: newTest.turbidity ? parseFloat(newTest.turbidity) : undefined,
        chlorine: newTest.chlorine ? parseFloat(newTest.chlorine) : undefined,
        eColi: newTest.eColi || undefined,
        testDate: new Date(),
      });

      setNewTest({
        location: '',
        ph: '',
        turbidity: '',
        chlorine: '',
        eColi: '',
      });

      setShowAddModal(false);
      Alert.alert('Success', 'Water quality test recorded');
    } catch (error) {
      Alert.alert('Error', 'Failed to record test');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="text-gray-600 mt-4">Loading water quality tests...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row justify-between items-center">
        <Text className="text-lg font-semibold text-gray-900">Water Quality Tests</Text>
        <TouchableOpacity
          className="bg-sky-600 px-4 py-2 rounded-lg"
          onPress={() => setShowAddModal(true)}
        >
          <Text className="text-white font-semibold">+ New Test</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tests || []}
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
            <Ionicons name="water-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 text-center">
              No water quality tests yet
            </Text>
            <TouchableOpacity
              className="mt-4 bg-sky-600 px-6 py-3 rounded-lg"
              onPress={() => setShowAddModal(true)}
            >
              <Text className="text-white font-semibold">Record First Test</Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item }) => (
          <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">{item.sampleId}</Text>
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text className="text-base font-semibold text-gray-900 ml-1">
                    {item.location}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-gray-500">
                {new Date(item.testDate).toLocaleDateString()}
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2 mb-3">
              {item.ph !== undefined && (
                <View className="bg-blue-50 px-3 py-2 rounded">
                  <Text className="text-xs text-gray-600">pH</Text>
                  <Text className="text-sm font-semibold text-gray-900">{item.ph}</Text>
                </View>
              )}
              {item.turbidity !== undefined && (
                <View className="bg-yellow-50 px-3 py-2 rounded">
                  <Text className="text-xs text-gray-600">Turbidity</Text>
                  <Text className="text-sm font-semibold text-gray-900">{item.turbidity} NTU</Text>
                </View>
              )}
              {item.chlorine !== undefined && (
                <View className="bg-green-50 px-3 py-2 rounded">
                  <Text className="text-xs text-gray-600">Chlorine</Text>
                  <Text className="text-sm font-semibold text-gray-900">{item.chlorine} mg/L</Text>
                </View>
              )}
              {item.eColi && (
                <View className="bg-red-50 px-3 py-2 rounded">
                  <Text className="text-xs text-gray-600">E. Coli</Text>
                  <Text className="text-sm font-semibold text-gray-900">{item.eColi}</Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center pt-2 border-t border-gray-100">
              <Ionicons name="person-outline" size={14} color="#6b7280" />
              <Text className="text-xs text-gray-600 ml-1">Tested by: {item.testedBy}</Text>
            </View>

            {item.syncedAt && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="cloud-done-outline" size={14} color="#10b981" />
                <Text className="text-xs text-gray-500 ml-1">
                  Synced {new Date(item.syncedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        )}
      />

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-5/6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">New Water Quality Test</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Location *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="e.g., Main Pump Station"
                  value={newTest.location}
                  onChangeText={(text) => setNewTest({ ...newTest, location: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">pH Level</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="6.5 - 8.5"
                  value={newTest.ph}
                  onChangeText={(text) => setNewTest({ ...newTest, ph: text })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Turbidity (NTU)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="e.g., 5.0"
                  value={newTest.turbidity}
                  onChangeText={(text) => setNewTest({ ...newTest, turbidity: text })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Chlorine (mg/L)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="e.g., 0.5"
                  value={newTest.chlorine}
                  onChangeText={(text) => setNewTest({ ...newTest, chlorine: text })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">E. Coli Result</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="Detected/Not Detected"
                  value={newTest.eColi}
                  onChangeText={(text) => setNewTest({ ...newTest, eColi: text })}
                />
              </View>

              <TouchableOpacity
                className="bg-sky-600 rounded-lg py-4 items-center mb-3"
                onPress={handleCreateTest}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Record Test
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-200 rounded-lg py-4 items-center"
                onPress={() => setShowAddModal(false)}
              >
                <Text className="text-gray-700 font-semibold text-base">Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
