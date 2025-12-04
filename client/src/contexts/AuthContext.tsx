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
    try {
      const response = await apiClient.get<{ user: User; tenant: Tenant }>('/auth/user');
      setUser(response.user);
      setTenant(response.tenant || null);
    } catch (error) {
      setUser(null);
      setTenant(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
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

    // Store token in localStorage for API calls
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
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
    if (!user || !user.permissions) return false;
    const permissionNames = user.permissions.map(p => 
      typeof p === 'string' ? p : p.name
    );
    return permissionNames.includes('*') || permissionNames.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) return false;
    const roleNames = user.roles.map(r => 
      typeof r === 'string' ? r : r.name
    );
    // Super Admin has access to everything
    if (roleNames.includes('Super Admin')) return true;
    return roleNames.includes('*') || roleNames.includes(role);
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
