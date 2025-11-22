import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../lib/api-client';
import { useAuthStore } from '../lib/auth-store';

interface PhotoUploadResponse {
  id: string;
  url: string;
  uploaded_at: string;
  metadata: Record<string, unknown>;
}

interface PhotoUploadOptions {
  workOrderId: string;
  description?: string;
  phase?: 'before' | 'during' | 'after';
}

/**
 * Hook for uploading work order photos
 */
export function usePhotoUpload() {
  const queryClient = useQueryClient();
  const { activeTenant } = useAuthStore();

  return useMutation({
    mutationFn: async (options: PhotoUploadOptions) => {
      if (!activeTenant?.id) {
        throw new Error('No active tenant');
      }

      // Pick an image from the device
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        throw new Error('Photo selection canceled');
      }

      const asset = result.assets[0];
      if (!asset.uri) {
        throw new Error('No image URI');
      }

      // Prepare form data for multipart upload
      const formData = new FormData();
      
      // Attach the image file
      formData.append('photo', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `photo-${Date.now()}.jpg`,
      } as any);

      // Add optional metadata
      if (options.description) {
        formData.append('description', options.description);
      }
      if (options.phase) {
        formData.append('phase', options.phase);
      }

      // Upload to server
      const response = await apiClient.post<{ data: PhotoUploadResponse }>(
        `/work-orders/${options.workOrderId}/photos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate work order photos query
      queryClient.invalidateQueries({
        queryKey: ['work-order-photos', variables.workOrderId],
      });
    },
  });
}

/**
 * Hook to take a photo with camera and upload it
 */
export function useCameraPhotoUpload() {
  const queryClient = useQueryClient();
  const { activeTenant } = useAuthStore();

  return useMutation({
    mutationFn: async (options: PhotoUploadOptions) => {
      if (!activeTenant?.id) {
        throw new Error('No active tenant');
      }

      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        throw new Error('Camera permission denied');
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        throw new Error('Photo capture canceled');
      }

      const asset = result.assets[0];
      if (!asset.uri) {
        throw new Error('No image URI');
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('photo', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `photo-${Date.now()}.jpg`,
      } as any);

      if (options.description) {
        formData.append('description', options.description);
      }
      if (options.phase) {
        formData.append('phase', options.phase);
      }

      // Upload to server
      const response = await apiClient.post<{ data: PhotoUploadResponse }>(
        `/work-orders/${options.workOrderId}/photos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['work-order-photos', variables.workOrderId],
      });
    },
  });
}
