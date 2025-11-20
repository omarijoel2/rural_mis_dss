#!/bin/bash
export APP_ENV=local
export APP_DEBUG=true
cd "$(dirname "$0")"

rm -f /tmp/php-fpm.sock
php-fpm --nodaemonize --fpm-config php-fpm.conf
