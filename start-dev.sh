#!/bin/bash
# Start Express, PHP-FPM, and Caddy using concurrently
npx concurrently -c "blue,yellow,green" \
  "tsx server/index.ts" \
  "bash ./api/start-laravel.sh" \
  "bash ./api/start-caddy.sh" \
  --names="Express,PHP-FPM,Caddy"
