# Dual Server Setup Guide

## Overview

The Rural Water MIS requires **two servers** running simultaneously:
1. **Express Frontend** (port 5000) - Serves React app and proxies API requests
2. **Laravel Backend** (port 8001) - Handles all API endpoints and database operations

## Quick Start Options

### Option 1: Using the Startup Script (Recommended)

Run this command in the Shell:

```bash
./start-dev.sh
```

This uses `concurrently` to run both servers with colored output:
- 🔵 Blue = Express Frontend
- 🟠 Orange = Laravel Backend

### Option 2: Update the Workflow (Permanent Solution)

To make both servers start automatically when you click "Run":

1. Click the **three dots** (⋮) next to the "Run" button in Replit
2. Select **"Configure Run"** or **"Edit Workflow"**
3. Find the "Start Game" workflow
4. Update the shell command from:
   ```
   npm run dev
   ```
   to:
   ```
   ./start-dev.sh
   ```
5. Save the workflow

### Option 3: Manual Startup (Testing)

Open two Shell tabs:

**Tab 1 - Express Frontend:**
```bash
tsx server/index.ts
```

**Tab 2 - Laravel Backend:**
```bash
cd api && php artisan serve --port=8001
```

## Verification

Both servers should be running:

✅ **Express:** http://localhost:5000
- Check: Browser should show the React app
- Shell should show: `[express] serving on port 5000`

✅ **Laravel:** http://localhost:8001
- Shell should show: `Laravel development server started: http://127.0.0.1:8001`
- Test endpoint: `curl http://localhost:8001/api/v1/gis/schemes/geojson`

## Troubleshooting

### "Failed to fetch" errors

**Cause:** Laravel backend is not running

**Solution:** Start Laravel backend using one of the options above

### Port already in use

**Cause:** Server is already running in background

**Solution:**
```bash
# Find and kill the process
lsof -ti:8001 | xargs kill -9  # For Laravel
lsof -ti:5000 | xargs kill -9  # For Express
```

### Laravel won't start

**Check PHP and artisan:**
```bash
cd api
php --version  # Should show PHP 8.3+
php artisan --version  # Should show Laravel 11
```

**Check .env file:**
```bash
cat api/.env | grep APP_  # Should have APP_KEY set
```

## Files Created

- `start-dev.sh` - Concurrent startup script (uses concurrently)
- `start-all-servers.sh` - Background startup script (alternative)
- `start-laravel.sh` - Laravel only (for separate startup)

## Production Deployment

For production deployment, see `DEPLOYMENT_GUIDE.md` which covers:
- Nginx + PHP-FPM configuration
- PM2 for process management
- Systemd service files
- Zero-downtime deployments
