# Mobile App Dependencies Reference

Complete guide to all dependencies used in the Rural Water MIS mobile app.

## Installation Command

```bash
npm install
```

This reads from `package.json` and installs all dependencies listed below.

---

## Production Dependencies (35 packages)

### Framework & Core
| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~51.0.0 | React Native framework - enables building iOS/Android from JavaScript |
| `react-native` | 0.74.0 | Cross-platform mobile development library |
| `react` | 18.3.1 | UI library - same as web React |
| `react-dom` | 18.3.1 | React rendering for web (used in Expo web) |

### Routing & Navigation
| Package | Version | Purpose |
|---------|---------|---------|
| `expo-router` | ~3.5.0 | File-based routing (like Next.js for mobile) |
| `@react-navigation/native` | ^6.1.9 | Navigation state management |
| `react-native-screens` | 3.31.0 | Native screen navigation |
| `react-native-safe-area-context` | 4.10.0 | Safe area handling (notch, status bar) |
| `expo-linking` | ~6.3.0 | Deep linking support |

### State Management & Data
| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^5.0.3 | Lightweight state management (auth store) |
| `@tanstack/react-query` | ^5.60.5 | Server state & caching |
| `axios` | ^1.7.0 | HTTP client (API requests) |

### Offline Database
| Package | Version | Purpose |
|---------|---------|---------|
| `@nozbe/watermelondb` | ^0.27.1 | SQLite-based local database |
| `expo-sqlite` | ~14.0.0 | SQLite access in Expo |

### Security & Storage
| Package | Version | Purpose |
|---------|---------|---------|
| `expo-secure-store` | ~13.0.0 | Device keychain/keystore access |
| `expo-local-authentication` | ~14.0.0 | Biometric authentication (Face ID/Touch ID) |

### Mobile Features
| Package | Version | Purpose |
|---------|---------|---------|
| `expo-image-picker` | ~15.0.0 | Camera & photo library access |
| `expo-file-system` | ~16.0.0 | File system operations |
| `expo-notifications` | ~0.28.0 | Push notifications (ready for future use) |
| `expo-device` | ~6.0.0 | Device information |
| `expo-status-bar` | ~1.12.0 | Status bar customization |
| `expo-system-ui` | ~3.0.0 | System UI customization |
| `expo-constants` | ~16.0.0 | App constants (version, etc.) |
| `expo-blur` | ~13.0.0 | Blur effects (UI polish) |

### UI & Styling
| Package | Version | Purpose |
|---------|---------|---------|
| `nativewind` | ^4.0.0 | Tailwind CSS for React Native |
| `@expo/vector-icons` | ^14.0.0 | Icon library (Ionicons, FontAwesome, etc.) |

### Type Safety
| Package | Version | Purpose |
|---------|---------|---------|
| `zod` | ^3.25.76 | Schema validation & type safety |

### Web Support
| Package | Version | Purpose |
|---------|---------|---------|
| `react-native-web` | ~0.19.10 | React Native on web (Expo web preview) |

---

## Development Dependencies (8 packages)

### TypeScript & Transpilation
| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ~5.6.3 | Type safety in development |
| `@babel/core` | ^7.24.0 | JavaScript transpiler |
| `@babel/preset-env` | ^7.24.0 | Babel preset for modern JS |
| `@babel/preset-react` | ^7.24.0 | Babel support for JSX |
| `@babel/preset-typescript` | ^7.24.0 | Babel support for TypeScript |
| `babel-jest` | ^29.7.0 | Jest testing support |

### Code Quality
| Package | Version | Purpose |
|---------|---------|---------|
| `eslint` | ^8.57.0 | Linting (code style enforcement) |
| `eslint-config-expo` | ^6.0.0 | Expo-specific ESLint rules |

### Code Formatting
| Package | Version | Purpose |
|---------|---------|---------|
| `prettier` | ^3.2.0 | Code formatting |

### Utility
| Package | Version | Purpose |
|---------|---------|---------|
| `babel-plugin-module-resolver` | ^5.0.2 | Import path resolution (aliases) |

### Type Definitions
| Package | Version | Purpose |
|---------|---------|---------|
| `@types/react` | ~18.3.11 | TypeScript types for React |
| `@types/react-native` | ^0.73.0 | TypeScript types for React Native |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependency list & scripts |
| `.npmrc` | NPM configuration (peer dependencies) |
| `.yarnrc.yml` | Yarn configuration (if using Yarn) |
| `.env.example` | Environment variables template |
| `app.json` | Expo configuration |
| `eas.json` | EAS build configuration |
| `tsconfig.json` | TypeScript configuration |
| `babel.config.js` | Babel transpilation config |
| `metro.config.js` | Metro bundler config |

---

## Installation Details

### Where Dependencies Go
```
node_modules/
├── expo/                    # Main framework
├── react-native/            # Core library
├── @nozbe/watermelondb/    # Offline database
├── zustand/                 # State management
├── axios/                   # HTTP client
├── @expo/vector-icons/     # Icons
├── nativewind/             # Tailwind CSS
└── ... (30+ more packages)
```

### Dependency Size
- **Total**: ~400-500 MB in node_modules
- **Install Time**: 2-5 minutes (first install)
- **Subsequent Installs**: 30 seconds (cached)

---

## Troubleshooting Dependencies

### Issue: Peer dependency warnings
**Solution**: `.npmrc` is pre-configured with `legacy-peer-deps=true`

```bash
# If still issues:
npm install --legacy-peer-deps
```

### Issue: Dependency conflicts
**Solution**: Use exact versions
```bash
npm install --save-exact
```

### Issue: Version mismatch after update
**Solution**: Clean install
```bash
npm run clean && npm install
```

### Issue: Missing type definitions
**Solution**: Install missing types
```bash
npm install --save-dev @types/[package-name]
```

---

## Performance Tips

1. **First install is slowest** - Grab coffee! ☕
2. **Use npm ci** for CI/CD - More reliable than npm install
3. **Keep dependencies updated** - Run `npm outdated` periodically
4. **Audit for vulnerabilities** - Run `npm audit` regularly

---

## Version Compatibility

- **Node.js**: >= 20.19.4 (required for Metro bundler)
- **npm**: >= 10.0.0
- **Expo SDK**: 51 (latest stable)
- **React Native**: 0.74.0

---

## Useful Commands

```bash
# Check for outdated packages
npm outdated

# Update to latest versions
npm update

# Check for security vulnerabilities
npm audit

# Fix security vulnerabilities
npm audit fix

# List installed packages
npm list --depth=0

# Remove unused dependencies
npm prune

# Cache cleanup
npm cache clean --force
```

---

**Last Updated:** November 23, 2025  
**Total Packages:** 43 (35 production + 8 dev)  
**Estimated Size:** 450 MB
