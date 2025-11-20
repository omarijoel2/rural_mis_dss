#!/bin/bash
# Start both Express and Laravel servers using concurrently
npx concurrently -c "blue,yellow" "tsx server/index.ts" "cd api && php artisan serve --port=8001" --names="Express,Laravel"
