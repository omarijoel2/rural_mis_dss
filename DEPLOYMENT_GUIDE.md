# Rural Water Supply MIS - VPS Deployment Guide

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Server Requirements](#server-requirements)
- [Initial Server Setup](#initial-server-setup)
- [Install Required Software](#install-required-software)
- [Database Setup](#database-setup)
- [Application Deployment](#application-deployment)
- [Web Server Configuration](#web-server-configuration)
- [Process Management](#process-management)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Backup Strategy](#backup-strategy)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- VPS with Ubuntu 22.04 LTS or 24.04 LTS
- Minimum 4GB RAM (8GB recommended for production)
- 40GB SSD storage minimum
- Root or sudo access
- Domain name pointed to your VPS IP address

---

## Server Requirements

### Software Stack

- **Operating System**: Ubuntu 22.04/24.04 LTS
- **Web Server**: Nginx 1.24+
- **Backend Runtime**: PHP 8.2+ with PHP-FPM
- **Frontend Runtime**: Node.js 20 LTS
- **Database**: PostgreSQL 16 with PostGIS extension
- **Process Manager**: PM2 for Node.js, Supervisor for Laravel queues
- **Cache/Queue**: Redis 7+

---

## Initial Server Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip software-properties-common
```

### 2. Create Deployment User

```bash
# Create a dedicated user for the application
sudo adduser deployer
sudo usermod -aG sudo deployer

# Generate SSH key for deployer (optional)
sudo -u deployer ssh-keygen -t ed25519 -C "deployer@yourdomain.com"
```

### 3. Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## Install Required Software

### 1. Install PHP 8.2 and Extensions

```bash
# Add Ondřej Surý PPA for latest PHP
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Install PHP-FPM and required extensions
sudo apt install -y php8.2-fpm \
    php8.2-cli \
    php8.2-common \
    php8.2-pgsql \
    php8.2-mbstring \
    php8.2-xml \
    php8.2-bcmath \
    php8.2-curl \
    php8.2-zip \
    php8.2-gd \
    php8.2-intl \
    php8.2-opcache \
    php8.2-redis \
    php8.2-dom

# Verify PHP installation
php -v
```

### 2. Install Composer

```bash
cd ~
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
composer --version
```

### 3. Install Node.js 20 LTS

```bash
# Install Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v  # Should show v20.x.x
npm -v
```

### 4. Install PM2 (Process Manager for Node.js)

```bash
sudo npm install -g pm2
pm2 startup systemd
# Follow the instructions from the output to enable PM2 on system boot
```

### 5. Install PostgreSQL 16 with PostGIS

```bash
# Add PostgreSQL APT repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update

# Install PostgreSQL 16 and PostGIS
sudo apt install -y postgresql-16 postgresql-16-postgis-3

# Verify installation
sudo -u postgres psql --version
```

### 6. Install Redis

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verify Redis is running
redis-cli ping  # Should return "PONG"
```

### 7. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 8. Install Supervisor (for Laravel Queue Workers)

```bash
sudo apt install -y supervisor
sudo systemctl enable supervisor
sudo systemctl start supervisor
```

---

## Database Setup

### 1. Create PostgreSQL Database and User

```bash
sudo -u postgres psql

# Inside PostgreSQL prompt:
CREATE DATABASE water_mis;
CREATE USER water_mis_user WITH PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE water_mis TO water_mis_user;

# Grant schema privileges (important for PostgreSQL 15+)
\c water_mis
GRANT ALL ON SCHEMA public TO water_mis_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO water_mis_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO water_mis_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO water_mis_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO water_mis_user;

# Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

\q
```

### 2. Import Database Schema

```bash
# Upload database_schema.sql to server first, then import:
sudo -u postgres psql -d water_mis -f /path/to/database_schema.sql
```

### 3. Configure PostgreSQL for Production

Edit `/etc/postgresql/16/main/postgresql.conf`:

```ini
# Memory settings (adjust based on available RAM)
shared_buffers = 512MB              # 25% of RAM for 2GB server
effective_cache_size = 1536MB       # 75% of RAM
work_mem = 16MB
maintenance_work_mem = 256MB

# Connection settings
max_connections = 100

# Write performance
checkpoint_completion_target = 0.9
wal_buffers = 16MB

# Logging
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_statement = 'mod'               # Log all DDL and DML
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

---

## Application Deployment

### 1. Create Directory Structure

```bash
sudo mkdir -p /var/www/water-mis
sudo chown -R deployer:deployer /var/www/water-mis
cd /var/www/water-mis
```

### 2. Clone Repository

```bash
# Using SSH (recommended - set up deploy keys on GitHub/GitLab)
git clone git@github.com:yourusername/water-mis.git .

# Or using HTTPS
git clone https://github.com/yourusername/water-mis.git .
```

### 3. Configure Environment Variables

#### Laravel API (.env)

```bash
cd /var/www/water-mis/api
cp .env.example .env
nano .env
```

Update the following variables:

```env
APP_NAME="Rural Water MIS"
APP_ENV=production
APP_KEY=  # Will generate in next step
APP_DEBUG=false
APP_URL=https://yourdomain.com

LOG_CHANNEL=daily
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=water_mis
DB_USERNAME=water_mis_user
DB_PASSWORD=STRONG_PASSWORD_HERE

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=.yourdomain.com

CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

Generate application key:

```bash
cd /var/www/water-mis/api
php artisan key:generate
```

#### Node.js/React (.env)

```bash
cd /var/www/water-mis
nano .env
```

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://water_mis_user:STRONG_PASSWORD_HERE@localhost:5432/water_mis
SESSION_SECRET=GENERATE_RANDOM_SECRET_HERE
VITE_API_URL=https://yourdomain.com/api
```

### 4. Install Dependencies

#### Install Laravel Dependencies

```bash
cd /var/www/water-mis/api
composer install --optimize-autoloader --no-dev --no-interaction
```

#### Install Node.js Dependencies

```bash
cd /var/www/water-mis
npm install --production=false
```

### 5. Run Migrations and Seeders

```bash
cd /var/www/water-mis/api
php artisan migrate --force
php artisan db:seed --force
```

### 6. Build Frontend Assets

```bash
cd /var/www/water-mis
npm run build
```

### 7. Optimize Laravel for Production

```bash
cd /var/www/water-mis/api

# Run all optimization commands
php artisan optimize

# This combines:
# - config:cache
# - route:cache
# - view:cache
# - event:cache

# Publish vendor assets
php artisan vendor:publish --all --ansi
```

### 8. Set Proper Permissions

```bash
cd /var/www/water-mis

# Laravel storage and cache directories
sudo chown -R www-data:www-data api/storage
sudo chown -R www-data:www-data api/bootstrap/cache
sudo chmod -R 775 api/storage
sudo chmod -R 775 api/bootstrap/cache

# Node.js build output
sudo chown -R www-data:www-data dist
sudo chmod -R 755 dist

# Set deployer as owner for most files
sudo chown -R deployer:www-data /var/www/water-mis
sudo chmod -R 755 /var/www/water-mis
```

---

## Web Server Configuration

### 1. PHP-FPM Optimization

Edit `/etc/php/8.2/fpm/pool.d/www.conf`:

```ini
[www]
user = www-data
group = www-data
listen = /var/run/php/php8.2-fpm.sock
listen.owner = www-data
listen.group = www-data

# Process management
pm = dynamic
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 20
pm.max_requests = 500
request_terminate_timeout = 300
```

Edit `/etc/php/8.2/fpm/php.ini`:

```ini
memory_limit = 256M
max_execution_time = 300
max_input_time = 300
upload_max_filesize = 20M
post_max_size = 20M

# OPcache (critical for production)
opcache.enable = 1
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 8
opcache.max_accelerated_files = 10000
opcache.revalidate_freq = 2
opcache.validate_timestamps = 0
opcache.fast_shutdown = 1

# Error logging
display_errors = Off
log_errors = On
error_log = /var/log/php8.2-fpm-errors.log
```

Restart PHP-FPM:

```bash
sudo systemctl restart php8.2-fpm
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/water-mis`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logs
    access_log /var/log/nginx/water-mis-access.log;
    error_log /var/log/nginx/water-mis-error.log;

    # Laravel API backend (port 8001)
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # React frontend served by Express (port 5000)
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\.(?!well-known).* {
        deny all;
    }

    client_max_body_size 20M;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/water-mis /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Process Management

### 1. Configure PM2 for Express Server

```bash
cd /var/www/water-mis

# Start Express server with PM2
pm2 start npm --name "water-mis-frontend" -- start

# Save PM2 process list
pm2 save

# Set up PM2 to start on system boot
pm2 startup systemd
# Run the command it outputs
```

Create PM2 ecosystem file for advanced configuration:

```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'water-mis-frontend',
    script: 'dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/www/water-mis/logs/pm2-error.log',
    out_file: '/var/www/water-mis/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

Start with ecosystem file:

```bash
pm2 start ecosystem.config.js
pm2 save
```

### 2. Configure Supervisor for Laravel

Create Laravel queue worker configuration:

```bash
sudo nano /etc/supervisor/conf.d/water-mis-worker.conf
```

```ini
[program:water-mis-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/water-mis/api/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/water-mis/api/storage/logs/worker.log
stopwaitsecs=3600
```

Start the workers:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start water-mis-worker:*
```

### 3. Configure Laravel Scheduler

Add to crontab for deployer user:

```bash
crontab -e
```

Add this line:

```cron
* * * * * cd /var/www/water-mis/api && php artisan schedule:run >> /dev/null 2>&1
```

### 4. Start Laravel API Server

Create systemd service for Laravel:

```bash
sudo nano /etc/systemd/system/laravel-api.service
```

```ini
[Unit]
Description=Laravel API Server
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/water-mis/api
ExecStart=/usr/bin/php artisan serve --host=127.0.0.1 --port=8001
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable laravel-api
sudo systemctl start laravel-api
sudo systemctl status laravel-api
```

---

## SSL Certificate Setup

### Install Certbot and Obtain SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate (automatic Nginx configuration)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

Certbot will automatically:
- Obtain SSL certificates from Let's Encrypt
- Configure Nginx to use them
- Set up automatic renewal via cron

---

## Monitoring & Maintenance

### 1. Log Management

#### View Application Logs

```bash
# Laravel logs
tail -f /var/www/water-mis/api/storage/logs/laravel.log

# Express logs (PM2)
pm2 logs water-mis-frontend

# Nginx logs
sudo tail -f /var/log/nginx/water-mis-access.log
sudo tail -f /var/log/nginx/water-mis-error.log

# PHP-FPM logs
sudo tail -f /var/log/php8.2-fpm.log

# Supervisor logs
sudo tail -f /var/log/supervisor/supervisord.log
```

#### Configure Log Rotation

Create `/etc/logrotate.d/water-mis`:

```
/var/www/water-mis/api/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        php /var/www/water-mis/api/artisan optimize:clear > /dev/null 2>&1
    endscript
}
```

### 2. Monitoring Commands

```bash
# Check service status
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status laravel-api
pm2 status

# Check disk usage
df -h

# Check memory usage
free -h

# Monitor PostgreSQL connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Monitor Redis
redis-cli INFO stats
```

### 3. Performance Monitoring

Install monitoring tools:

```bash
# Install htop for system monitoring
sudo apt install -y htop

# Install iotop for disk I/O monitoring
sudo apt install -y iotop

# Install nethogs for network monitoring
sudo apt install -y nethogs
```

---

## Backup Strategy

### 1. Database Backups

Create backup script `/home/deployer/backup-db.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/water-mis"
DB_NAME="water_mis"
DB_USER="water_mis_user"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql.gz"

# Perform backup
PGPASSWORD="$DB_PASSWORD" pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_FILE

# Delete backups older than retention period
find $BACKUP_DIR -name "db_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "Database backup completed: $BACKUP_FILE"
```

Make it executable and set up daily cron:

```bash
chmod +x /home/deployer/backup-db.sh

# Add to crontab
crontab -e
```

Add daily backup at 2 AM:

```cron
0 2 * * * /home/deployer/backup-db.sh >> /var/log/db-backup.log 2>&1
```

### 2. Application Backups

Create backup script `/home/deployer/backup-app.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/water-mis"
APP_DIR="/var/www/water-mis"
RETENTION_DAYS=7

mkdir -p $BACKUP_DIR

# Backup uploaded files and storage
BACKUP_FILE="$BACKUP_DIR/app_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf $BACKUP_FILE \
    $APP_DIR/api/storage/app \
    $APP_DIR/.env \
    $APP_DIR/api/.env

# Delete old backups
find $BACKUP_DIR -name "app_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "Application backup completed: $BACKUP_FILE"
```

### 3. Restore from Backup

```bash
# Restore database
gunzip < /var/backups/water-mis/db_backup_YYYYMMDD_HHMMSS.sql.gz | \
    sudo -u postgres psql -d water_mis

# Restore application files
tar -xzf /var/backups/water-mis/app_backup_YYYYMMDD_HHMMSS.tar.gz -C /
```

---

## Deployment Updates

### Deployment Script

Create `/home/deployer/deploy.sh`:

```bash
#!/bin/bash

set -e

APP_DIR="/var/www/water-mis"
API_DIR="$APP_DIR/api"

echo "🚀 Starting deployment..."

# Navigate to app directory
cd $APP_DIR

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
cd $API_DIR
composer install --optimize-autoloader --no-dev --no-interaction

cd $APP_DIR
npm install --production=false

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Run database migrations
echo "🗄️  Running migrations..."
cd $API_DIR
php artisan migrate --force

# Clear and rebuild cache
echo "🧹 Clearing caches..."
php artisan optimize:clear
php artisan optimize

# Reload PHP-FPM to clear OPcache
echo "🔄 Reloading PHP-FPM..."
sudo systemctl reload php8.2-fpm

# Restart queue workers
echo "👷 Restarting queue workers..."
sudo supervisorctl restart water-mis-worker:*

# Restart Express server
echo "🔄 Restarting Express server..."
pm2 restart water-mis-frontend

# Restart Laravel API
echo "🔄 Restarting Laravel API..."
sudo systemctl restart laravel-api

echo "✅ Deployment completed successfully!"
```

Make it executable:

```bash
chmod +x /home/deployer/deploy.sh
```

Deploy updates:

```bash
/home/deployer/deploy.sh
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. 502 Bad Gateway

**Cause**: Backend services (Laravel API or Express) not running

**Solution**:
```bash
# Check services
sudo systemctl status laravel-api
pm2 status

# Restart if needed
sudo systemctl restart laravel-api
pm2 restart water-mis-frontend

# Check logs
sudo journalctl -u laravel-api -n 50
pm2 logs water-mis-frontend
```

#### 2. Database Connection Failed

**Cause**: PostgreSQL not running or wrong credentials

**Solution**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U water_mis_user -d water_mis -h localhost

# Check .env files match database credentials
```

#### 3. Permission Denied Errors

**Solution**:
```bash
cd /var/www/water-mis
sudo chown -R www-data:www-data api/storage
sudo chown -R www-data:www-data api/bootstrap/cache
sudo chmod -R 775 api/storage
sudo chmod -R 775 api/bootstrap/cache
```

#### 4. OPcache Not Clearing

**Solution**:
```bash
# Reload PHP-FPM after deployment
sudo systemctl reload php8.2-fpm

# Or restart it
sudo systemctl restart php8.2-fpm
```

#### 5. Queue Workers Not Processing Jobs

**Solution**:
```bash
# Check worker status
sudo supervisorctl status water-mis-worker:*

# Restart workers
sudo supervisorctl restart water-mis-worker:*

# Check logs
tail -f /var/www/water-mis/api/storage/logs/worker.log
```

### Performance Issues

#### Slow Database Queries

```bash
# Enable slow query logging in PostgreSQL
sudo nano /etc/postgresql/16/main/postgresql.conf
```

Add:
```ini
log_min_duration_statement = 1000  # Log queries slower than 1 second
```

#### High Memory Usage

```bash
# Check memory usage
free -h

# Check which processes use most memory
ps aux --sort=-%mem | head -n 10

# Restart services to free memory
sudo systemctl restart php8.2-fpm
pm2 restart all
```

---

## Security Checklist

- ✅ Firewall configured (UFW)
- ✅ SSH key-based authentication enabled
- ✅ Root login disabled
- ✅ SSL certificate installed
- ✅ APP_DEBUG=false in production
- ✅ Database user has minimal required privileges
- ✅ File permissions correctly set (755/775)
- ✅ .env files protected (600 permissions)
- ✅ Redis password configured
- ✅ Regular security updates scheduled
- ✅ Automated backups configured
- ✅ Log rotation enabled

---

## Performance Optimization Checklist

- ✅ OPcache enabled and configured
- ✅ Laravel optimization commands run (`php artisan optimize`)
- ✅ Frontend assets minified and bundled
- ✅ Static asset caching enabled
- ✅ Redis caching configured
- ✅ Database indexes optimized
- ✅ Query caching enabled
- ✅ CDN configured (if applicable)
- ✅ Gzip compression enabled in Nginx

---

## Additional Resources

- **Laravel Deployment Documentation**: https://laravel.com/docs/11.x/deployment
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Let's Encrypt Documentation**: https://letsencrypt.org/docs/

---

## Support

For application-specific issues, refer to:
- Application logs: `/var/www/water-mis/api/storage/logs/`
- System logs: `/var/log/`
- PM2 logs: `pm2 logs`

For infrastructure issues, check service status:
```bash
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status php8.2-fpm
sudo systemctl status laravel-api
pm2 status
```

---

**Last Updated**: November 2025  
**Version**: 1.0  
**Tested On**: Ubuntu 24.04 LTS
