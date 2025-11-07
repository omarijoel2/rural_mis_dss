import { ReactNode } from 'react';
import { useAbility } from '../hooks/useAbility';

interface RequirePermProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  role?: string;
  roles?: string[];
  requireAllRoles?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function RequirePerm({
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  requireAllRoles = false,
  fallback = null,
  children,
}: RequirePermProps) {
  const { can, hasAnyPermission, hasAllPermissions, is, hasAnyRole, hasAllRoles } = useAbility();

  let hasAccess = true;

  if (permission) {
    hasAccess = can(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  if (hasAccess && role) {
    hasAccess = is(role);
  } else if (hasAccess && roles && roles.length > 0) {
    hasAccess = requireAllRoles
      ? hasAllRoles(roles)
      : hasAnyRole(roles);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
