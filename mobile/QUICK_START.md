# 🚀 Quick Start Guide

Get the Rural Water MIS mobile app running in 3 commands!

## Prerequisites
- Node.js 20.19.4 or higher
- npm 10.0.0 or higher

## Installation

### Step 1: Install Dependencies
```bash
cd mobile
npm install
```

**Expected output:** "added XX packages" (may take 2-5 minutes)

### Step 2: Start Development Server
```bash
npm run web
```

**Expected output:** "Expo web server ready at http://localhost:19006"

### Step 3: View in Browser
Open your browser to: **http://localhost:19006**

---

## Available Options

### Web Preview (Recommended for quick testing)
```bash
npm run web
```
- ✅ Fastest - no emulator setup needed
- ✅ Works on Windows/Mac/Linux
- ✅ Perfect for UI testing

### iOS Simulator (macOS only)
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Physical Device (Expo Go app)
```bash
npm start
# Scan QR code with Expo Go app
```

---

## Troubleshooting

**Dependency conflicts?**
```bash
npm install --legacy-peer-deps
```

**Port already in use?**
```bash
npx expo start --port 19000 --web
```

**Clear cache and reinstall:**
```bash
npm run clean && npm install
```

---

## What to Explore

After starting the app:

1. **Login Screen** - Try demo credentials
   - Email: `operator@water.ke`
   - Password: `password123`

2. **Dashboard** - See quick actions and statistics

3. **Customers** - Search and manage customer data

4. **Work Orders** - Track maintenance tasks

5. **Profile** - View account and permissions

---

## Next Steps

After installation, read:
- `INSTALLATION_GUIDE.md` - Detailed setup instructions
- `DEVELOPMENT.md` - Development workflow
- `STATUS.md` - Feature roadmap

---

**Time to first run:** ~5 minutes ⚡
