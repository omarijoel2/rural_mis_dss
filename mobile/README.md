# Rural Water MIS - Mobile App

React Native mobile app for field operations with offline-first capabilities.

## Features

- **Offline-First**: Works without internet connection
- **Multi-Tenant**: Support for multiple water utilities
- **Secure Authentication**: Laravel Sanctum integration
- **Field Operations**: Customer management, work orders, asset inspections
- **Sync Engine**: Automatic data synchronization when online

## Tech Stack

- React Native with Expo
- TypeScript
- Expo Router (file-based routing)
- WatermelonDB (offline storage)
- TanStack Query (data fetching)
- NativeWind (TailwindCSS for React Native)

## Development Setup

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS simulator:
```bash
npm run ios
```

4. Run on Android emulator:
```bash
npm run android
```

## Project Structure

```
mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (app)/             # Main app screens
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── lib/              # Utilities and stores
│   ├── hooks/            # Custom React hooks
│   └── database/         # WatermelonDB models
└── assets/               # Images and static files
```

## Environment Configuration

Create `.env` file:
```
API_URL=http://your-api-server.com/api/v1
```

## Building for Production

### Android
```bash
npm run prebuild
eas build --platform android
```

### iOS
```bash
npm run prebuild
eas build --platform ios
```

## Offline Capabilities

The app uses WatermelonDB for local storage and implements a sync engine to:
- Queue mutations while offline
- Automatically sync when connection is restored
- Handle conflict resolution with last-write-wins strategy
- Maintain audit trail for all offline changes
