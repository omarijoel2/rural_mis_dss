# Mobile App Development Guide

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- iOS: Xcode and iOS Simulator (macOS only)
- Android: Android Studio and Android SDK

### Initial Setup

1. Install dependencies in the mobile folder:
```bash
cd mobile
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Choose a platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## Development Workflow

### File Structure
```
mobile/
├── app/                   # File-based routes (Expo Router)
│   ├── (auth)/           # Login, tenant selection
│   ├── (app)/            # Main app (home, customers, work orders)
│   ├── _layout.tsx       # Root layout with providers
│   └── index.tsx         # Entry point (auth check)
├── src/
│   ├── components/       # Reusable UI components
│   ├── lib/             # Utilities, stores, API client
│   ├── hooks/           # Custom React hooks
│   └── database/        # WatermelonDB models & schema
└── assets/              # Images, fonts, etc.
```

### Key Concepts

#### 1. Expo Router (File-Based Routing)
- Each file in `app/` becomes a route
- `(auth)` and `(app)` are route groups (parentheses hide from URL)
- `_layout.tsx` wraps child routes

#### 2. Authentication Flow
1. User logs in → `(auth)/login.tsx`
2. Select tenant → `(auth)/tenant-select.tsx`
3. Token stored in secure storage → `src/lib/auth-store.ts`
4. Redirect to app → `(app)/home.tsx`

#### 3. State Management
- **Auth**: Zustand store (`auth-store.ts`) with secure storage
- **Server Data**: TanStack Query for caching & sync
- **Local DB**: WatermelonDB for offline storage

#### 4. API Integration
- Base client: `src/lib/api-client.ts`
- Axios with interceptors for auth headers
- Automatic retry logic
- Queue offline mutations for sync

### Connecting to Backend

The mobile app connects to the Laravel API server. Configure the API URL:

**Development (Expo Go)**:
- Use your computer's local IP address
- Example: `http://192.168.1.100:5000/api/v1`

**Development (Simulator)**:
- iOS: `http://localhost:5000/api/v1`
- Android: `http://10.0.2.2:5000/api/v1`

Set in `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://192.168.1.100:5000/api/v1"
    }
  }
}
```

### Testing Offline Mode

1. Enable offline mode in your device/simulator
2. App should continue functioning with local data
3. Make changes (e.g., update customer info)
4. Changes queued in sync engine
5. Re-enable network → automatic sync

## Building WatermelonDB Models

### Step 1: Define Schema
```typescript
// src/database/schema.ts
import { appSchema, tableSchema } from '@watermelondb/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'customers',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
```

### Step 2: Create Model
```typescript
// src/database/models/Customer.ts
import { Model } from '@watermelondb/watermelondb';
import { field, date } from '@watermelondb/watermelondb/decorators';

export class Customer extends Model {
  static table = 'customers';

  @field('server_id') serverId!: string;
  @field('name') name!: string;
  @field('email') email?: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}
```

### Step 3: Initialize Database
```typescript
// src/database/index.ts
import { Database } from '@watermelondb/watermelondb';
import SQLiteAdapter from '@watermelondb/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { Customer } from './models/Customer';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'RuralWaterMIS',
});

export const database = new Database({
  adapter,
  modelClasses: [Customer],
});
```

## Sync Engine Implementation

### Queue Mutations
```typescript
// When offline, queue changes
const queueMutation = async (mutation: Mutation) => {
  await database.write(async () => {
    await syncQueueCollection.create((queue) => {
      queue.tableName = mutation.table;
      queue.recordId = mutation.id;
      queue.changes = JSON.stringify(mutation.changes);
      queue.operation = mutation.operation; // 'create', 'update', 'delete'
    });
  });
};
```

### Process Sync Queue
```typescript
const processSyncQueue = async () => {
  const pendingMutations = await syncQueueCollection.query().fetch();
  
  for (const mutation of pendingMutations) {
    try {
      // Send to server
      await apiClient.post('/sync', {
        table: mutation.tableName,
        operation: mutation.operation,
        changes: JSON.parse(mutation.changes),
      });
      
      // Remove from queue
      await mutation.destroyPermanently();
    } catch (error) {
      console.error('Sync failed:', error);
      // Keep in queue for retry
    }
  }
};
```

## NativeWind Styling

Use Tailwind classes with `className`:
```tsx
<View className="flex-1 bg-white px-6">
  <Text className="text-2xl font-bold text-gray-900">
    Welcome
  </Text>
</View>
```

## Common Tasks

### Add a New Screen
1. Create file in `app/` folder
2. Export default component
3. Add to navigation if needed

### Add Offline Table
1. Update `src/database/schema.ts`
2. Create model in `src/database/models/`
3. Add to `database` modelClasses
4. Increment schema version

### Debug Network Calls
```tsx
// In api-client.ts
apiClient.interceptors.request.use((config) => {
  console.log('REQUEST:', config.method, config.url);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('RESPONSE:', response.status, response.data);
    return response;
  },
  (error) => {
    console.log('ERROR:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);
```

## Troubleshooting

### Issue: Module not found
- Clear cache: `npm start -- --clear`
- Reinstall: `rm -rf node_modules && npm install`

### Issue: iOS build fails
- Update pods: `cd ios && pod install`
- Clean build: `xcodebuild clean`

### Issue: Android build fails
- Clean: `cd android && ./gradlew clean`
- Rebuild: `cd android && ./gradlew assembleDebug`

### Issue: Can't connect to API
- Check API URL in `app.json`
- Ensure backend server is running
- Test with: `curl http://YOUR_IP:5000/api/v1/health`

## Next Steps

1. Complete WatermelonDB integration (Task 2)
2. Implement sync engine (Task 6)
3. Build customer module (Task 7)
4. Add work orders module (Task 8)
