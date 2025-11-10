# VPS Deployment Quick Checklist

## Pre-Deployment

- [ ] VPS provisioned with Ubuntu 22.04/24.04 LTS (min 4GB RAM)
- [ ] Domain name pointed to VPS IP address
- [ ] SSH access configured
- [ ] Root or sudo user access confirmed

## Server Setup (30-45 minutes)

### System Preparation
- [ ] System updated (`apt update && apt upgrade`)
- [ ] Deployment user created
- [ ] Firewall configured (UFW)

### Software Installation
- [ ] PHP 8.2+ with required extensions installed
- [ ] Composer installed
- [ ] Node.js 20 LTS installed
- [ ] PM2 installed globally
- [ ] PostgreSQL 16 + PostGIS installed
- [ ] Redis installed and running
- [ ] Nginx installed
- [ ] Supervisor installed

## Database Setup (10 minutes)

- [ ] PostgreSQL database created (`water_mis`)
- [ ] Database user created with strong password
- [ ] PostGIS extension enabled
- [ ] Database schema imported from `database_schema.sql`
- [ ] Database permissions granted
- [ ] PostgreSQL optimized for production

## Application Deployment (20-30 minutes)

### File Setup
- [ ] Application directory created (`/var/www/water-mis`)
- [ ] Repository cloned
- [ ] Laravel .env configured with production settings
- [ ] Node.js .env configured
- [ ] Application key generated (`php artisan key:generate`)

### Dependencies
- [ ] Laravel dependencies installed (`composer install --no-dev`)
- [ ] Node.js dependencies installed (`npm install`)
- [ ] Frontend built (`npm run build`)

### Database
- [ ] Migrations run (`php artisan migrate --force`)
- [ ] Seeders run (`php artisan db:seed --force`)

### Optimization
- [ ] Laravel optimized (`php artisan optimize`)
- [ ] File permissions set correctly (775 for storage, 755 for others)

## Web Server Configuration (15 minutes)

- [ ] PHP-FPM configured and optimized
- [ ] Nginx site configuration created
- [ ] Nginx configuration tested (`nginx -t`)
- [ ] Nginx reloaded

## Process Management (10 minutes)

- [ ] Laravel API systemd service created and started
- [ ] Express frontend started with PM2
- [ ] PM2 saved and startup configured
- [ ] Laravel queue workers configured in Supervisor
- [ ] Laravel scheduler added to crontab

## SSL Certificate (5 minutes)

- [ ] Certbot installed
- [ ] SSL certificate obtained for domain
- [ ] Nginx automatically configured for HTTPS
- [ ] Auto-renewal tested (`certbot renew --dry-run`)

## Monitoring & Backups (15 minutes)

- [ ] Log rotation configured
- [ ] Database backup script created
- [ ] Application backup script created
- [ ] Daily backup cron jobs configured
- [ ] Monitoring commands tested

## Testing (15 minutes)

### Service Health Checks
- [ ] Nginx running and accessible
- [ ] PHP-FPM running
- [ ] PostgreSQL accepting connections
- [ ] Redis responding to pings
- [ ] Laravel API service running (port 8001)
- [ ] Express frontend running (port 5000)
- [ ] Queue workers running

### Application Testing
- [ ] Frontend loads in browser (https://yourdomain.com)
- [ ] API endpoints responding (https://yourdomain.com/api/v1/health)
- [ ] Authentication working
- [ ] Database queries executing
- [ ] File uploads working
- [ ] Background jobs processing

### Security Verification
- [ ] HTTP redirects to HTTPS
- [ ] APP_DEBUG=false in production
- [ ] .env files protected (600 permissions)
- [ ] Hidden files blocked by Nginx
- [ ] Security headers present in responses
- [ ] Firewall rules active

## Post-Deployment

- [ ] DNS propagation complete
- [ ] SSL certificate valid and trusted
- [ ] All logs being written correctly
- [ ] Performance metrics baseline recorded
- [ ] Deployment script created and tested
- [ ] Team access and credentials documented
- [ ] Monitoring alerts configured (if applicable)

## Ongoing Maintenance Schedule

### Daily
- [ ] Check application logs for errors
- [ ] Verify backups completed successfully

### Weekly
- [ ] Review system resource usage (CPU, memory, disk)
- [ ] Check database performance
- [ ] Review security logs

### Monthly
- [ ] Update system packages (`apt update && apt upgrade`)
- [ ] Update Composer dependencies (test in staging first)
- [ ] Update npm packages (test in staging first)
- [ ] Review and clean old backups
- [ ] Review SSL certificate expiry (auto-renewed but verify)

## Emergency Contacts

- Server Provider Support: ________________
- DNS Provider Support: ________________
- Database Admin: ________________
- DevOps Lead: ________________

## Important Commands Reference

```bash
# Restart all services
sudo systemctl restart nginx php8.2-fpm postgresql laravel-api
pm2 restart all
sudo supervisorctl restart water-mis-worker:*

# View logs
tail -f /var/www/water-mis/api/storage/logs/laravel.log
pm2 logs water-mis-frontend
sudo tail -f /var/log/nginx/water-mis-error.log

# Deploy updates
/home/deployer/deploy.sh

# Restore database backup
gunzip < /var/backups/water-mis/db_backup_YYYYMMDD_HHMMSS.sql.gz | sudo -u postgres psql -d water_mis
```

---

**Estimated Total Deployment Time**: 2-3 hours (first time)  
**Estimated Update Deployment Time**: 5-10 minutes (using deploy script)

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
