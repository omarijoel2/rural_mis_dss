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
  short_code?: string;
  county: string;
  country?: string;
  region?: string;
  code?: string;
  status?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  requires_2fa?: boolean;
  requires_tenant_selection?: boolean;
  is_super_admin?: boolean;
  accessible_tenants?: Tenant[];
  current_tenant?: Tenant | null;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  selectTenant: (tenantId: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  pendingTenantSelection: boolean;
  accessibleTenants: Tenant[];
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTenantSelection, setPendingTenantSelection] = useState(false);
  const [accessibleTenants, setAccessibleTenants] = useState<Tenant[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const refreshUser = async () => {
    const token = localStorage.getItem('auth_token');
    console.log('[Auth] refreshUser - token exists:', !!token);
    
    if (!token) {
      console.log('[Auth] No token, skipping refresh');
      setUser(null);
      setTenant(null);
      setPendingTenantSelection(false);
      setAccessibleTenants([]);
      setIsSuperAdmin(false);
      return;
    }
    
    try {
      const response = await apiClient.get<{
        user: User;
        tenant: Tenant | null;
        is_super_admin: boolean;
        accessible_tenants: Tenant[];
        requires_tenant_selection: boolean;
      }>('/auth/user');
      
      console.log('[Auth] refreshUser success:', {
        email: response.user?.email,
        tenant: response.tenant?.name,
        is_super_admin: response.is_super_admin,
        requires_tenant_selection: response.requires_tenant_selection,
      });
      
      setUser(response.user);
      setTenant(response.tenant || null);
      setIsSuperAdmin(response.is_super_admin || false);
      
      if (response.requires_tenant_selection && response.accessible_tenants?.length) {
        console.log('[Auth] Tenant selection required after refresh');
        setPendingTenantSelection(true);
        setAccessibleTenants(response.accessible_tenants);
      } else {
        setPendingTenantSelection(false);
        setAccessibleTenants([]);
      }
    } catch (error) {
      console.error('[Auth] refreshUser failed:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setTenant(null);
      setPendingTenantSelection(false);
      setAccessibleTenants([]);
      setIsSuperAdmin(false);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    console.log('[Auth] Attempting login for:', email);
    
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    console.log('[Auth] Login response:', { 
      hasToken: !!response.token,
      tokenPreview: response.token ? response.token.substring(0, 20) + '...' : 'NO TOKEN',
      user: response.user?.email,
      roles: response.user?.role_names || response.user?.roles,
      requires_tenant_selection: response.requires_tenant_selection,
      is_super_admin: response.is_super_admin,
      accessible_tenants_count: response.accessible_tenants?.length
    });

    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      console.log('[Auth] Token stored in localStorage');
    } else {
      console.error('[Auth] NO TOKEN in response!');
    }

    setUser(response.user);
    setIsSuperAdmin(response.is_super_admin || false);
    
    if (response.requires_tenant_selection && response.accessible_tenants?.length) {
      console.log('[Auth] Tenant selection required for super admin');
      setPendingTenantSelection(true);
      setAccessibleTenants(response.accessible_tenants);
    } else if (response.current_tenant) {
      setTenant(response.current_tenant);
      setPendingTenantSelection(false);
    }
    
    return response;
  };

  const selectTenant = async (tenantId: string) => {
    console.log('[Auth] Selecting tenant:', tenantId);
    
    try {
      const response = await apiClient.post<{ user: User; tenant: Tenant }>('/auth/select-tenant', {
        tenant_id: tenantId,
      });
      
      console.log('[Auth] Tenant selected:', response.tenant?.name);
      setTenant(response.tenant);
      setUser(response.user);
      setPendingTenantSelection(false);
      setAccessibleTenants([]);
    } catch (error) {
      console.error('[Auth] Tenant selection failed:', error);
      throw error;
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
      setPendingTenantSelection(false);
      setAccessibleTenants([]);
      setIsSuperAdmin(false);
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
        selectTenant,
        logout,
        refreshUser,
        hasPermission,
        hasRole,
        pendingTenantSelection,
        accessibleTenants,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // If a consumer uses the hook outside of the provider (e.g. during tests or
    // accidental imports), return a lightweight safe fallback instead of
    // throwing to avoid the Vite overlay crashing the app during HMR.
    // This lets components handle "not authenticated" state gracefully.
    console.warn('useAuth called outside AuthProvider — returning fallback auth context');
    const fallback: AuthContextType = {
      user: null,
      tenant: null,
      setUser: () => {},
      isAuthenticated: false,
      isLoading: false,
      login: async () => { throw new Error('No AuthProvider available'); },
      selectTenant: async () => { throw new Error('No AuthProvider available'); },
      logout: async () => { throw new Error('No AuthProvider available'); },
      refreshUser: async () => {},
      hasPermission: () => false,
      hasRole: () => false,
      pendingTenantSelection: false,
      accessibleTenants: [],
      isSuperAdmin: false,
    };
    return fallback;
  }
  return context;
}
