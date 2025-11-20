#!/bin/bash
# Start both Express and Laravel servers using concurrently
npx concurrently -c "#93c5fd,#fdba74" "tsx server/index.ts" "cd api && php artisan serve --port=8001" --names="Express,Laravel"
