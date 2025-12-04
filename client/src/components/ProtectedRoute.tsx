import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRole 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, hasRole, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check for admin access using multiple sources
  const roleNames = user?.role_names || [];
  const roles = user?.roles || [];
  
  // Check if user has Super Admin or Admin role
  const isAdmin = 
    roleNames.includes('Super Admin') || 
    roleNames.includes('Admin') ||
    roles.some((r: any) => r === 'Super Admin' || r === 'Admin' || r?.name === 'Super Admin' || r?.name === 'Admin') ||
    hasRole('Super Admin') || 
    hasRole('Admin');

  // Super Admin and Admin roles have full access to all pages
  if (isAdmin) {
    return <>{children}</>;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have the required role to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
