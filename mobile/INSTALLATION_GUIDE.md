# Mobile App Installation Guide

## Prerequisites

Before installing the mobile app dependencies, ensure you have the following installed:

### Required
- **Node.js** >= 20.19.4 (download from https://nodejs.org)
- **npm** >= 10.0.0 (comes with Node.js)

### Optional (for native builds)
- **Xcode** (iOS development - macOS only)
- **Android Studio** (Android development - all platforms)
- **EAS CLI** for building and deploying

---

## Quick Setup (5 minutes)

### 1. Navigate to Mobile Directory
```bash
cd mobile
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages listed in `package.json`.

### 3. Verify Installation
```bash
npm run type-check
```

If this completes without errors, your installation is successful!

---

## Development Setup

### 1. Start Development Server
```bash
# Web preview (fastest - browser only)
npm run web

# iOS simulator (macOS only)
npm run ios

# Android emulator
npm run android

# Expo Go (on physical device)
npm start
```

### 2. Environment Variables
Copy the example file and configure:
```bash
cp .env.example .env
```

Edit `.env` with your API server details:
```
API_URL=http://your-api-server.com/api/v1
APP_ENV=development
```

---

## Troubleshooting

### Issue: `npm install` fails with dependency conflicts

**Solution:** The `.npmrc` file in this directory is pre-configured to handle peer dependency issues. If you still get errors:

```bash
npm install --legacy-peer-deps
```

### Issue: Port 19000/19001 already in use

**Solution:** Kill the existing process:
```bash
# macOS/Linux
lsof -i :19000 | grep -v COMMAND | awk '{print $2}' | xargs kill -9

# Or specify a different port
npx expo start --port 19000
```

### Issue: TypeScript errors after installation

**Solution:** Rebuild TypeScript:
```bash
npm run type-check
```

---

## Available Scripts

```bash
npm run start           # Start Expo dev server
npm run dev            # Start with cache clear
npm run web            # Web preview in browser
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator

npm run prebuild       # Prepare native build
npm run build:android  # Build APK/AAB for Play Store
npm run build:ios      # Build IPA for App Store
npm run preview:android # Quick Android preview build
npm run preview:ios     # Quick iOS preview build

npm run submit:android # Submit to Google Play
npm run submit:ios     # Submit to App Store

npm run lint           # Run ESLint
npm run type-check     # Check TypeScript types
npm run format         # Format code with Prettier
npm run setup          # Full fresh installation
npm run clean          # Remove node_modules and cache
```

---

## Project Structure

```
mobile/
├── app/                          # Expo Router pages
│   ├── (auth)/                  # Auth screens
│   ├── (app)/                   # Main app screens
│   └── _layout.tsx              # Root layout
├── src/
│   ├── components/              # Reusable UI components
│   ├── database/                # WatermelonDB models
│   ├── hooks/                   # Custom hooks
│   └── lib/                     # Utilities
├── package.json                 # Dependencies
├── app.json                     # Expo configuration
├── eas.json                     # EAS build config
├── tsconfig.json                # TypeScript config
├── babel.config.js              # Babel config
└── metro.config.js              # Metro bundler config
```

---

## Dependency Overview

### Production Dependencies

**Framework & Navigation:**
- `expo` - React Native framework
- `expo-router` - File-based routing
- `react-native` - Core framework

**State & Data:**
- `zustand` - State management
- `@tanstack/react-query` - Server state
- `axios` - HTTP client
- `zod` - Schema validation

**Storage & Offline:**
- `@nozbe/watermelondb` - Offline database
- `expo-sqlite` - SQLite support
- `expo-secure-store` - Secure token storage

**UI & Styling:**
- `nativewind` - Tailwind CSS for React Native
- `@expo/vector-icons` - Icons library
- `@react-navigation/native` - Navigation

**Mobile Features:**
- `expo-image-picker` - Camera & photo access
- `expo-file-system` - File operations
- `expo-local-authentication` - Biometric auth
- `expo-notifications` - Push notifications

### Development Dependencies

- `typescript` - Type safety
- `@babel/core` - JavaScript transpiler
- `eslint` - Code linting
- `prettier` - Code formatting
- `tailwindcss` - Styling system

---

## Next Steps

After installation:

1. **Configure API URL** - Update `.env` with your backend URL
2. **Start Development** - Run `npm run web` to see the app
3. **Explore Screens** - Navigate through login, customers, work orders
4. **Build APK/IPA** - Use EAS to build for production

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review `DEVELOPMENT.md` for development workflow
3. Check `STATUS.md` for feature roadmap

---

**Last Updated:** November 23, 2025  
**Expo SDK:** 51  
**React Native:** 0.74  
**Node:** >= 20.19.4
