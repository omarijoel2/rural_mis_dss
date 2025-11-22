# Rural Water MIS Mobile App - Setup Guide

## Overview

This mobile app provides offline-first field operations capabilities for water utilities. It synchronizes with the Rural Water MIS Laravel backend and works without internet connectivity.

## Prerequisites

### Development Environment
1. **Node.js 18+** installed
2. **npm** or **yarn** package manager
3. **Expo CLI**: `npm install -g expo-cli`
4. **iOS Development** (macOS only):
   - Xcode 14+ installed
   - iOS Simulator
5. **Android Development**:
   - Android Studio installed
   - Android SDK configured
   - Android emulator set up

### Backend Requirements
- Rural Water MIS Laravel API running (default: `http://localhost:5000`)
- PostgreSQL database accessible
- Laravel Sanctum configured for API authentication

## Installation Steps

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the mobile directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your configuration:

```
# API URL - Use your Laravel API server address
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api/v1

# For iOS Simulator: http://localhost:5000/api/v1
# For Android Emulator: http://10.0.2.2:5000/api/v1
# For Physical Device: Use your computer's IP address
```

### 3. Start the Development Server

```bash
npm start
```

This will start the Expo development server. You'll see a QR code and options to:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

### 4. Run on iOS Simulator (macOS only)

```bash
npm run ios
```

### 5. Run on Android Emulator

```bash
npm run android
```

## Project Structure

```
mobile/
├── app/                          # Expo Router pages (file-based routing)
│   ├── (auth)/                  # Authentication screens
│   │   ├── login.tsx            # Login screen
│   │   └── tenant-select.tsx    # Tenant selection
│   ├── (app)/                   # Main app screens (protected)
│   │   ├── home.tsx             # Dashboard/home screen
│   │   ├── customers.tsx        # Customer list
│   │   ├── customers/[id].tsx   # Customer detail/edit
│   │   ├── work-orders.tsx      # Work orders list
│   │   ├── profile.tsx          # User profile
│   │   └── _layout.tsx          # Tab navigation
│   ├── _layout.tsx              # Root layout with providers
│   └── index.tsx                # Entry point (auth check)
├── src/
│   ├── components/              # Reusable UI components
│   ├── lib/                     # Utilities and stores
│   │   ├── api-client.ts        # Axios client with auth interceptors
│   │   ├── auth-store.ts        # Zustand auth state management
│   │   └── sync-engine.ts       # Offline sync logic
│   ├── hooks/                   # Custom React hooks
│   │   └── useCustomers.ts      # Customer data hooks
│   └── database/                # WatermelonDB offline storage
│       ├── schema.ts            # Database schema definition
│       ├── models/              # WatermelonDB models
│       │   ├── Customer.ts
│       │   ├── WorkOrder.ts
│       │   ├── Asset.ts
│       │   ├── WaterQualityTest.ts
│       │   └── SyncQueue.ts
│       └── index.ts             # Database initialization
├── shared/                      # Shared types with backend
│   └── mobile-sdk/
│       └── types.ts             # Zod schemas and TypeScript types
├── assets/                      # Images, fonts, etc.
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
└── tailwind.config.js           # NativeWind (Tailwind) configuration
```

## Key Features

### 1. Offline-First Architecture
- **Local Storage**: WatermelonDB (SQLite) for offline data
- **Sync Queue**: Mutations queued when offline, synced when online
- **Multi-Tenant**: Separate data per tenant with tenant_id scoping

### 2. Authentication Flow
1. User logs in with email/password
2. Receives JWT token from Laravel Sanctum
3. Token stored in secure device storage (Keychain/Keystore)
4. Select active tenant (water utility)
5. Tenant ID added to all API requests via X-Tenant-ID header

### 3. Data Synchronization
- **Pull Sync**: Fetch latest data from server on demand
- **Push Sync**: Queue local mutations and sync to server
- **Conflict Resolution**: Last-write-wins strategy
- **Auto-Sync**: Background sync every 60 seconds when online

### 4. Offline Capabilities
- View and search customers without connectivity
- Edit customer information offline
- Changes automatically queued for sync
- Visual indicators showing sync status

## Development Workflow

### Adding a New Screen

1. Create file in `app/` folder (e.g., `app/(app)/new-feature.tsx`)
2. Export default component:

```tsx
export default function NewFeatureScreen() {
  return (
    <View className="flex-1 bg-white">
      <Text>New Feature</Text>
    </View>
  );
}
```

3. File automatically becomes a route: `/(app)/new-feature`

### Adding a New Database Table

1. Update schema in `mobile/src/database/schema.ts`:

```typescript
tableSchema({
  name: 'my_table',
  columns: [
    { name: 'server_id', type: 'string', isIndexed: true },
    { name: 'name', type: 'string' },
    { name: 'tenant_id', type: 'string', isIndexed: true },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
}),
```

2. Create model in `mobile/src/database/models/MyTable.ts`:

```typescript
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class MyTable extends Model {
  static table = 'my_table';

  @field('server_id') serverId!: string;
  @field('name') name!: string;
  @field('tenant_id') tenantId!: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
```

3. Register model in `mobile/src/database/index.ts`
4. Increment schema version in `schema.ts`

### Queueing Offline Mutations

```typescript
import { syncEngine } from '@/lib/sync-engine';

await syncEngine.queueMutation(
  'customers',          // Table name
  customerId,           // Record ID
  'update',             // Operation: create, update, delete
  { name: 'New Name' }, // Changes
  tenantId              // Tenant ID
);
```

### Using TanStack Query for Data

```typescript
import { useQuery } from '@tanstack/react-query';
import { database } from '@/database';

function useMyData() {
  return useQuery({
    queryKey: ['my-data'],
    queryFn: async () => {
      const collection = database.get('my_table');
      return await collection.query().fetch();
    },
  });
}
```

## Testing

### Test Authentication Flow
1. Start backend server: `npm run dev` (from root)
2. Start mobile app: `npm start` (from mobile/)
3. Login with test credentials
4. Select a tenant
5. Verify token stored in device

### Test Offline Functionality
1. Enable offline mode in device/simulator
2. Navigate to Customers screen
3. Edit a customer
4. Verify changes saved locally
5. Re-enable network
6. Pull to refresh
7. Verify changes synced to server

### Test Sync Engine
1. Queue mutations while offline
2. Check sync_queue table in local DB
3. Go online
4. Watch console for sync progress
5. Verify mutations sent to server
6. Verify queue cleared

## Building for Production

### Android APK

```bash
# Prebuild native code
npx expo prebuild

# Build APK
eas build --platform android --profile preview
```

### iOS IPA (macOS only)

```bash
# Prebuild native code
npx expo prebuild

# Build IPA
eas build --platform ios --profile preview
```

### Production Deployment

1. Configure `eas.json` for production builds
2. Set up EAS credentials
3. Build for both platforms:

```bash
eas build --platform all --profile production
```

4. Submit to app stores:

```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

## Troubleshooting

### Issue: "Cannot connect to server"
**Solution**: Check API_URL in `.env` file. Use correct IP address for your environment.

### Issue: "Module not found"
**Solution**: Clear cache and reinstall:
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Issue: "Database schema mismatch"
**Solution**: Uninstall and reinstall app to reset local database.

### Issue: "Token expired"
**Solution**: Login again. Token refresh should happen automatically via API client interceptor.

### Issue: "Sync not working"
**Solution**: Check:
1. Device has network connectivity
2. Backend server is running
3. Console logs for sync errors
4. Sync queue table for pending mutations

## API Endpoints Required

The mobile app requires these Laravel API endpoints:

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/tenants` - List tenants
- `GET /api/v1/customers` - List customers
- `GET /api/v1/customers/:id` - Get customer
- `PUT /api/v1/customers/:id` - Update customer
- `POST /api/v1/sync/mutations` - Sync offline mutations
- `GET /api/v1/work-orders` - List work orders
- `GET /api/v1/assets` - List assets
- `GET /api/v1/water-quality-tests` - List water quality tests

## Security Considerations

1. **Token Storage**: Tokens stored in encrypted device storage (Keychain/Keystore)
2. **HTTPS**: Use HTTPS for all API calls in production
3. **Token Refresh**: Automatic refresh before expiration
4. **Local DB**: Consider encrypting local SQLite database
5. **Biometric Auth**: Implement device PIN/biometric for app access

## Next Steps

1. Complete Work Orders module
2. Add Asset Inspections with GPS
3. Build Water Quality module
4. Implement photo capture for work orders
5. Add biometric authentication
6. Set up EAS build pipeline
7. Create production environment configuration

## Support

For issues or questions:
1. Check documentation in `/mobile/DEVELOPMENT.md`
2. Review error logs in console
3. Test with backend API directly using curl/Postman
4. Verify database schema matches server expectations
