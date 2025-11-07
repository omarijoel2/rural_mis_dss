import { useAuth } from '../contexts/AuthContext';

export function useAbility() {
  const { user, hasPermission, hasRole } = useAuth();

  const can = (permission: string): boolean => {
    return hasPermission(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const is = (role: string): boolean => {
    return hasRole(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => hasRole(role));
  };

  return {
    user,
    can,
    hasAnyPermission,
    hasAllPermissions,
    is,
    hasAnyRole,
    hasAllRoles,
  };
}
