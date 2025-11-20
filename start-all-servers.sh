#!/bin/bash

# Rural Water MIS - Combined Server Startup Script
# This script starts both the Express frontend and Laravel backend servers

echo "🚀 Starting Rural Water MIS..."
echo ""

# Start Laravel API in background
echo "📡 Starting Laravel API on port 8001..."
cd api && php artisan serve --port=8001 &
LARAVEL_PID=$!

# Wait a moment for Laravel to start
sleep 2

# Go back to root
cd ..

# Start Express frontend (this runs in foreground)
echo "🌐 Starting Express frontend on port 5000..."
tsx server/index.ts

# If Express exits, kill Laravel too
kill $LARAVEL_PID 2>/dev/null
