import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api-client';

interface RoleObject {
  id: number;
  name: string;
  guard_name?: string;
}

interface PermissionObject {
  id: number;
  name: string;
  guard_name?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  current_tenant_id: string;
  two_factor_enabled: boolean;
  roles?: (string | RoleObject)[];
  permissions?: (string | PermissionObject)[];
  role_names?: string[];
  permission_names?: string[];
}

export interface Tenant {
  id: string;
  name: string;
  county: string;
  region: string;
  code: string;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('auth_token');
    console.log('[Auth] refreshUser - token exists:', !!token);
    
    if (!token) {
      console.log('[Auth] No token, skipping refresh');
      setUser(null);
      setTenant(null);
      return;
    }
    
    try {
      const response = await apiClient.get<{ user: User; tenant: Tenant }>('/auth/user');
      console.log('[Auth] refreshUser success:', response.user?.email);
      setUser(response.user);
      setTenant(response.tenant || null);
    } catch (error) {
      console.error('[Auth] refreshUser failed:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setTenant(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    console.log('[Auth] Attempting login for:', email);
    
    const response = await apiClient.post<{
      token: string;
      user: User;
      requires_2fa?: boolean;
      requires_tenant_selection?: boolean;
      accessible_tenants?: Tenant[];
      current_tenant?: Tenant;
    }>('/auth/login', {
      email,
      password,
    });

    console.log('[Auth] Login response:', { 
      hasToken: !!response.token,
      tokenPreview: response.token ? response.token.substring(0, 20) + '...' : 'NO TOKEN',
      user: response.user?.email,
      roles: response.user?.role_names || response.user?.roles
    });

    // Store token in localStorage for API calls
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      console.log('[Auth] Token stored in localStorage');
    } else {
      console.error('[Auth] NO TOKEN in response!');
    }

    setUser(response.user);
    if (response.current_tenant) {
      setTenant(response.current_tenant);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setTenant(null);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Check permission_names array first (from login response)
    if (user.permission_names && user.permission_names.length > 0) {
      return user.permission_names.includes('*') || user.permission_names.includes(permission);
    }
    
    // Fallback to permissions array
    if (user.permissions) {
      const permNames = user.permissions.map(p => typeof p === 'string' ? p : p.name);
      return permNames.includes('*') || permNames.includes(permission);
    }
    
    return false;
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    
    // Check role_names array first (from login response)
    if (user.role_names && user.role_names.length > 0) {
      if (user.role_names.includes('Super Admin')) return true;
      return user.role_names.includes('*') || user.role_names.includes(role);
    }
    
    // Fallback to roles array
    if (user.roles) {
      const roleNames = user.roles.map(r => typeof r === 'string' ? r : r.name);
      if (roleNames.includes('Super Admin')) return true;
      return roleNames.includes('*') || roleNames.includes(role);
    }
    
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        setUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
