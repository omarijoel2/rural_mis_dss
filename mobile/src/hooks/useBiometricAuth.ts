import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { securityManager } from '../lib/security';
import { useAuthStore } from '../lib/auth-store';

/**
 * Hook for biometric authentication on app launch
 */
export function useBiometricAuth() {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { user, token } = useAuthStore();

  useEffect(() => {
    const initializeSecurity = async () => {
      await securityManager.initialize();
      setBiometricAvailable(securityManager.isBiometricAvailable());
    };

    initializeSecurity();
  }, []);

  const authenticate = useMutation({
    mutationFn: async () => {
      setIsAuthenticating(true);
      try {
        const success = await securityManager.authenticateWithBiometrics();
        return success;
      } finally {
        setIsAuthenticating(false);
      }
    },
  });

  return {
    biometricAvailable,
    isAuthenticating,
    authenticate: authenticate.mutateAsync,
    error: authenticate.error,
  };
}

/**
 * Hook to require biometric authentication for sensitive operations
 */
export function useProtectedOperation(operationName: string = 'Perform action') {
  return useMutation({
    mutationFn: async <T,>(operation: () => Promise<T>): Promise<T> => {
      // Check if biometric is available
      if (securityManager.isBiometricAvailable()) {
        const authenticated = await securityManager.authenticateWithBiometrics();
        if (!authenticated) {
          throw new Error('Biometric authentication failed');
        }
      }

      // Proceed with operation
      return operation();
    },
  });
}

/**
 * Hook to enforce RBAC on mobile operations
 */
export function usePermissionCheck() {
  const { user } = useAuthStore();

  const canPerformAction = (action: string): boolean => {
    if (!user) return false;
    const permissions = user.permissions || [];
    return securityManager.canPerformAction(action, permissions);
  };

  return { canPerformAction };
}
