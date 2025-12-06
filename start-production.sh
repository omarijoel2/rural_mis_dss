#!/bin/bash

echo "Starting Rural Water MIS in production mode..."

# Start Laravel API server in background
cd api
php artisan serve --host=0.0.0.0 --port=8000 &
LARAVEL_PID=$!
cd ..

echo "Laravel API started on port 8000 (PID: $LARAVEL_PID)"

# Wait for Laravel to be ready
sleep 3

# Start Express server (foreground - this is the main process)
echo "Starting Express server on port 5000..."
NODE_ENV=production node dist/index.js
