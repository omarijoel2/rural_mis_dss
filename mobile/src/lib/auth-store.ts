import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from './api-client';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Tenant {
  id: string;
  name: string;
  county: string;
}

interface AuthState {
  user: User | null;
  activeTenant: Tenant | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveTenant: (tenant: Tenant) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  activeTenant: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initializeAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userJson = await SecureStore.getItemAsync('user');
      const tenantJson = await SecureStore.getItemAsync('active_tenant');

      if (token && userJson) {
        const user = JSON.parse(userJson);
        const tenant = tenantJson ? JSON.parse(tenantJson) : null;
        
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        set({
          token,
          user,
          activeTenant: tenant,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      set({
        token,
        user,
        isAuthenticated: true,
      });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Login failed');
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('active_tenant');

      delete apiClient.defaults.headers.common['Authorization'];

      set({
        user: null,
        activeTenant: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  setActiveTenant: async (tenant: Tenant) => {
    try {
      await SecureStore.setItemAsync('active_tenant', JSON.stringify(tenant));
      
      const currentToken = get().token;
      if (currentToken) {
        apiClient.defaults.headers.common['X-Tenant-ID'] = tenant.id;
      }
      
      set({ activeTenant: tenant });
    } catch (error) {
      console.error('Failed to set active tenant:', error);
      throw error;
    }
  },
}));
