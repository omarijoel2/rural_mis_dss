# Mobile Security Hardening Guide

This document outlines security best practices implemented and recommendations for the Rural Water MIS mobile app.

## Implemented Security Features

### 1. Secure Token Storage

**Location**: `src/lib/security.ts`

Sensitive data (authentication tokens, encryption keys) are stored in platform-specific secure storage:
- **iOS**: Keychain
- **Android**: Keystore

```typescript
// Secure storage example
const securityManager = SecurityManager.getInstance();

// Store token securely
await securityManager.storeSecurely('auth_token', token);

// Retrieve token
const token = await securityManager.retrieveSecurely('auth_token');

// Delete on logout
await securityManager.deleteSecurely('auth_token');
```

### 2. Biometric Authentication

**Location**: `src/hooks/useBiometricAuth.ts`

Protects sensitive operations with device biometric (Face ID, Touch ID, Fingerprint):

```typescript
const { authenticate } = useBiometricAuth();

// Require authentication before sensitive action
const handleSensitiveOperation = async () => {
  const success = await authenticate();
  if (success) {
    // Proceed with operation
  }
};
```

**Configuration in `app.json`**:
```json
{
  "plugins": ["expo-local-authentication"],
  "android": {
    "permissions": [
      "USE_BIOMETRIC",
      "USE_FINGERPRINT"
    ]
  }
}
```

### 3. Database Encryption

**Status**: Encryption keys generated and stored securely

**Key Management**:
- 256-bit encryption key generated on first app launch
- Stored in Keychain/Keystore (cannot be accessed by other apps)
- Automatically used for WatermelonDB operations

**Future Enhancement**: Implement SQLCipher for full database encryption
```bash
npm install react-native-sqlcipher-2
```

### 4. RBAC Enforcement

**Location**: `src/hooks/useBiometricAuth.ts`

Permission checks before operations:

```typescript
import { usePermissionCheck } from './useBiometricAuth';

function MyComponent() {
  const { canPerformAction } = usePermissionCheck();
  
  if (!canPerformAction('edit_customers')) {
    return <Text>No permission</Text>;
  }
  
  return <EditCustomerForm />;
}
```

### 5. Multi-Tenant Data Isolation

All API requests include `X-Tenant-ID` header ensuring data cannot be accessed across tenants:

```typescript
// Automatic in apiClient
const response = await apiClient.get('/customers', {
  headers: {
    'X-Tenant-ID': activeTenant.id
  }
});
```

**Database Level**:
- WatermelonDB records filtered by tenant_id
- Sync engine respects tenant boundaries

## Security Best Practices

### Network Security

#### HTTPS Only
```typescript
// All API calls use HTTPS in production
const API_URL = 'https://api.ruralwater.example.com';

// Never use HTTP except for local development
```

#### Certificate Pinning
**Recommended for production**:

```bash
npm install react-native-ssl-pinning
```

Implementation:
```typescript
import { setPin } from 'react-native-ssl-pinning';

setPin({
  domain: 'api.ruralwater.example.com',
  hashes: ['YOUR_CERTIFICATE_SHA256_HASH'],
});
```

#### API Request Validation
All requests include:
- Bearer token in Authorization header
- X-Tenant-ID for multi-tenant isolation
- Proper Content-Type headers
- Request timeout: 30 seconds

### Data Protection

#### Sensitive Data Handling

**Never store in cleartext**:
```typescript
// ❌ WRONG
AsyncStorage.setItem('auth_token', token);

// ✅ CORRECT
securityManager.storeSecurely('auth_token', token);
```

#### Session Timeout
Implement auto-logout after inactivity:

```typescript
// Recommended: 15-30 minutes inactivity
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

useEffect(() => {
  const timer = setTimeout(() => {
    authStore.logout();
  }, SESSION_TIMEOUT);
  
  return () => clearTimeout(timer);
}, [lastActivity]);
```

#### Cache Management
```typescript
// React Query automatically handles cache expiration
// Configure stale time:
useQuery(['customers'], fetchCustomers, {
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Authentication Security

#### Token Refresh
Automatic token refresh on 401:
```typescript
// Implemented in apiClient
if (error.response.status === 401) {
  const newToken = await refreshToken();
  // Retry request with new token
}
```

#### Logout
Clear all sensitive data:
```typescript
// In useAuthStore
const logout = async () => {
  await securityManager.clearAllSecurityData();
  localStorage.clear();
  reset(); // Zustand state
};
```

### Permissions & Privacy

#### Required Permissions
In `app.json`:
```json
{
  "android": {
    "permissions": [
      "ACCESS_FINE_LOCATION",     // GPS
      "CAMERA",                   // Photo upload
      "READ_EXTERNAL_STORAGE",    // Image picker
      "USE_BIOMETRIC"             // Biometric auth
    ]
  }
}
```

#### Privacy Policy
- Must disclose: GPS tracking, photo storage, biometric usage
- GDPR compliance: Data retention, deletion rights
- Display privacy policy in app settings

#### Location Data
- Only request when needed
- Request "While Using App" permission (not "Always")
- Allow users to disable location tracking

### Code Security

#### No Sensitive Data in Code
```typescript
// ❌ WRONG
const API_KEY = 'sk_live_abc123def456';
const TENANT_ID = 'org_12345';

// ✅ CORRECT
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
const TENANT_ID = process.env.EXPO_PUBLIC_TENANT_ID;
```

#### Dependencies
- Keep all packages updated: `npm outdated`
- Review security advisories: `npm audit`
- Audit dependencies regularly

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Fix with breaking changes if needed
npm audit fix --force
```

#### Error Handling
Never expose sensitive information:
```typescript
// ❌ WRONG
throw new Error(`Failed to fetch data: ${error.message}`);

// ✅ CORRECT
console.error('API Error:', error); // Log internally
throw new Error('Failed to load data. Please try again.');
```

## Hardening Roadmap

### Phase 1: Current Implementation
- ✅ Secure token storage (Keychain/Keystore)
- ✅ Biometric authentication hooks
- ✅ RBAC enforcement
- ✅ Multi-tenant isolation

### Phase 2: Immediate (Next Release)
- [ ] Enable database encryption with SQLCipher
- [ ] Implement certificate pinning
- [ ] Add session timeout/auto-logout
- [ ] Encrypt sensitive AsyncStorage data

### Phase 3: Enhanced (Future Releases)
- [ ] Root/jailbreak detection
- [ ] Screenshot prevention on sensitive screens
- [ ] Memory encryption for sensitive strings
- [ ] Tamper detection
- [ ] Secure logging (audit trail)

## Security Testing Checklist

### Before Release
- [ ] Run `npm audit` - zero vulnerabilities
- [ ] Penetration test by security team
- [ ] Test biometric flows on real devices
- [ ] Verify tenant isolation with multiple users
- [ ] Check for hardcoded credentials (grep -r)
- [ ] Review error messages for information disclosure
- [ ] Test SSL/TLS with MitM proxy
- [ ] Verify encrypted storage vs. plaintext comparison

### Ongoing
- [ ] Monthly dependency updates
- [ ] Quarterly security review
- [ ] User access review (who has what permissions)
- [ ] Monitor security advisories
- [ ] Track crash logs for security-related issues

## Incident Response

### If Data Breach Suspected
1. **Immediate**: Invalidate all user sessions
2. **Investigation**: Review logs for unauthorized access
3. **Notification**: Inform affected users within 72 hours (GDPR)
4. **Action**: Force password reset, recommend device update

### If Malware Detected
1. **Isolate**: Remove app from store immediately
2. **Analyze**: Determine scope and impact
3. **Patch**: Release security update within 24 hours
4. **Notify**: Inform users of vulnerability and patch

## Compliance Requirements

### GDPR (EU Users)
- [ ] Privacy policy available in-app
- [ ] User consent for data collection
- [ ] Right to access personal data
- [ ] Right to deletion ("right to be forgotten")
- [ ] Data portability
- [ ] 72-hour breach notification

### HIPAA (If Handling Health Data)
- [ ] Encryption at rest and in transit
- [ ] Access controls and logging
- [ ] Business Associate Agreements (BAA)
- [ ] Breach notification procedures
- [ ] Minimum necessary principle

### Kenya WASREB Standards
- [ ] Audit trail for all operations
- [ ] Role-based access control
- [ ] Data validation and integrity
- [ ] Regular backups
- [ ] Disaster recovery plan

## Resources

- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [Expo Security Best Practices](https://docs.expo.dev/build-reference/security/)
- [React Native Security](https://reactnative.dev/docs/security)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Last Updated**: November 22, 2025  
**Security Review**: Pending
**Compliance Review**: Pending
