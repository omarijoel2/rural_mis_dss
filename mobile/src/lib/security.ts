import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { v4 as uuidv4 } from 'uuid';

/**
 * Security utilities for mobile app
 * - Device biometric authentication
 * - Secure credential storage
 * - Database encryption key management
 */

export class SecurityManager {
  private static instance: SecurityManager;
  private biometricAvailable = false;
  private encryptionKey: string | null = null;

  private constructor() {}

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Initialize security manager and check biometric availability
   */
  async initialize(): Promise<void> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      this.biometricAvailable = compatible && enrolled;

      // Load or create encryption key
      await this.initializeEncryptionKey();

      console.log('Security manager initialized', {
        biometricAvailable: this.biometricAvailable,
        encryptionKeyReady: !!this.encryptionKey,
      });
    } catch (error) {
      console.error('Security initialization failed:', error);
    }
  }

  /**
   * Check if biometric authentication is available
   */
  isBiometricAvailable(): boolean {
    return this.biometricAvailable;
  }

  /**
   * Authenticate with biometrics
   */
  async authenticateWithBiometrics(): Promise<boolean> {
    if (!this.biometricAvailable) {
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        reason: 'Authenticate to access Rural Water MIS',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  /**
   * Store sensitive data securely in Keychain/Keystore
   */
  async storeSecurely(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Failed to store secure data:', error);
      throw error;
    }
  }

  /**
   * Retrieve sensitive data from Keychain/Keystore
   */
  async retrieveSecurely(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
      return null;
    }
  }

  /**
   * Delete sensitive data
   */
  async deleteSecurely(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Failed to delete secure data:', error);
      throw error;
    }
  }

  /**
   * Initialize or retrieve database encryption key
   * In production, this should be derived from biometric or PIN
   */
  private async initializeEncryptionKey(): Promise<void> {
    try {
      // Check if encryption key already exists
      const existingKey = await this.retrieveSecurely('db_encryption_key');

      if (existingKey) {
        this.encryptionKey = existingKey;
      } else {
        // Generate new encryption key using UUID v4 (128-bit)
        const key = uuidv4().replace(/-/g, '');
        await this.storeSecurely('db_encryption_key', key);
        this.encryptionKey = key;
      }
    } catch (error) {
      console.error('Failed to initialize encryption key:', error);
      // Fall back to unencrypted database
      this.encryptionKey = null;
    }
  }

  /**
   * Get database encryption key
   */
  getEncryptionKey(): string | null {
    return this.encryptionKey;
  }

  /**
   * Validate user has required permission on mobile
   * (permissions are checked on backend, but can pre-validate)
   */
  canPerformAction(action: string, userPermissions: string[]): boolean {
    const permissionMap: Record<string, string[]> = {
      'view_customers': ['view_customers'],
      'edit_customers': ['edit_customers'],
      'create_customers': ['create_customers'],
      'delete_customers': ['delete_customers'],
      'view_work_orders': ['view_work_orders'],
      'edit_work_orders': ['edit_work_orders'],
      'create_work_orders': ['create_work_orders'],
      'view_assets': ['view_assets'],
      'edit_assets': ['edit_assets'],
      'create_assets': ['create_assets'],
      'view_water_quality': ['view_water_quality'],
      'create_water_quality': ['create_water_quality'],
    };

    const requiredPermissions = permissionMap[action] || [];
    return requiredPermissions.every(p => userPermissions.includes(p));
  }

  /**
   * Clear all sensitive data on logout
   */
  async clearAllSecurityData(): Promise<void> {
    try {
      await this.deleteSecurely('db_encryption_key');
      await this.deleteSecurely('auth_token');
      await this.deleteSecurely('refresh_token');
      this.encryptionKey = null;
    } catch (error) {
      console.error('Failed to clear security data:', error);
    }
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance();
