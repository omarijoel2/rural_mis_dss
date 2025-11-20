#!/bin/bash
cd "$(dirname "$0")"
exec caddy run --config Caddyfile --adapter caddyfile
