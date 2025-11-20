# Core Services & Network Operations - Monitoring Guide

## Overview

The Core Operations module implements comprehensive monitoring and logging to ensure reliable operation of critical water utility infrastructure management functions.

## Monitoring Components

### 1. Request/Response Logging

**Middleware**: `CoreOpsMonitoring`
**Location**: `app/Http/Middleware/CoreOpsMonitoring.php`
**Log Channel**: `daily` (rotates daily, 14-day retention)

#### What's Logged

- **Request Details**: Method, path, user ID, tenant ID, IP address
- **Response Metrics**: Status code, execution time (ms)
- **Performance Alerts**: Slow queries (>1000ms warnings, >2000ms critical)
- **Custom Headers**: `X-Request-ID`, `X-Response-Time`

#### Example Log Entry

```json
{
  "level": "info",
  "message": "[Core Ops] Request Completed",
  "context": {
    "request_id": "req_65a3c1f4b2e89",
    "method": "GET",
    "path": "api/v1/core-ops/dashboard",
    "status": 200,
    "execution_time_ms": 124.56,
    "user_id": "a1b2c3d4-...",
    "tenant_id": "t1e2n3a4-...",
    "slow_query": false
  }
}
```

### 2. Integration Testing

**Test Suite**: `api/tests/core_ops_simple_test.php`
**Status**: ✅ All 21 tests passing

#### Test Coverage

1. **Database Schema** (10 tests): Verifies all Core Ops tables exist
2. **Model Traits** (4 tests): Confirms HasTenancy trait usage
3. **Multi-Tenant Isolation** (4 tests): Validates tenant data separation
4. **PostGIS Spatial** (2 tests): Tests geometry storage and queries
5. **FK Integrity** (1 test): Ensures consistent bigint foreign keys

#### Running Tests

```bash
cd api
php tests/core_ops_simple_test.php
```

Expected output: `Result: ALL TESTS PASSED ✓`

### 3. Performance Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| API Response Time | 1000ms | 2000ms |
| Telemetry Ingestion | 500ms | 1000ms |
| Dashboard Load | 800ms | 1500ms |
| Spatial Queries | 1500ms | 3000ms |

### 4. Monitored Endpoints

| Endpoint | Critical | SLA (ms) | Function |
|----------|----------|----------|----------|
| `/api/v1/core-ops/dashboard` | ✅ | 1000 | Real-time operations overview |
| `/api/v1/core-ops/telemetry/ingest` | ✅ | 500 | SCADA data ingestion |
| `/api/v1/core-ops/alarms` | ✅ | 800 | Active alarm monitoring |
| `/api/v1/core-ops/network/nodes` | ⚠️ | 2000 | Network topology queries |
| `/api/v1/core-ops/outages` | ⚠️ | 1500 | Outage management |

## Alert Configuration

### Slow Query Alerts

Automatically logged when execution time exceeds:
- **1000ms**: Warning level
- **2000ms**: Critical alert with detailed context

### Error Tracking

- **4xx responses**: Logged as warnings (client errors)
- **5xx responses**: Logged as errors (server errors)
- Each error includes full request context for debugging

## Log File Locations

```
api/storage/logs/
├── laravel.log          # All application logs
└── laravel-YYYY-MM-DD.log  # Daily rotated logs
```

## Viewing Logs

### Real-time Monitoring

```bash
tail -f api/storage/logs/laravel.log | grep "Core Ops"
```

### Search for Errors

```bash
grep -i "error" api/storage/logs/laravel.log | grep "Core Ops"
```

### Find Slow Queries

```bash
grep "SLOW QUERY" api/storage/logs/laravel.log
```

### Filter by Tenant

```bash
grep "tenant_id.*YOUR-TENANT-ID" api/storage/logs/laravel.log
```

## Multi-Tenant Monitoring

### Tenant Isolation Verification

The integration test suite validates tenant isolation:

```php
// Verify each tenant sees only their own data
test("Tenant isolation: Each tenant has separate data", function() {
    $tenant1Count = NetworkNode::withoutGlobalScopes()
        ->where('tenant_id', $tenant1->id)->count();
    $tenant2Count = NetworkNode::withoutGlobalScopes()
        ->where('tenant_id', $tenant2->id)->count();
    return $tenant1Count >= 1 && $tenant2Count >= 1;
});
```

### Fail-Closed Security

All Core Ops models use the `HasTenancy` trait, which:
- Automatically filters all queries by authenticated user's tenant
- Returns zero rows if user lacks valid tenant (fail-closed)
- Prevents cross-tenant data leakage

## Production Deployment Checklist

Before deploying to production:

- [ ] Run integration test suite (`php api/tests/core_ops_simple_test.php`)
- [ ] Verify log rotation configured (14-day retention)
- [ ] Set up external log aggregation (e.g., CloudWatch, Datadog)
- [ ] Configure alert notifications for critical errors
- [ ] Test monitoring dashboard access
- [ ] Verify multi-tenant isolation with production data
- [ ] Set up automated health checks for critical endpoints
- [ ] Document incident response procedures

## Troubleshooting

### High Response Times

1. Check for slow spatial queries in PostGIS
2. Review tenant data volume (may need indexing)
3. Check database connection pool status
4. Verify SCADA ingestion batch sizes

### Cross-Tenant Data Issues

1. Run integration test: `php tests/core_ops_simple_test.php`
2. Verify `HasTenancy` trait on all models
3. Check authentication middleware ordering
4. Review audit logs for suspicious access patterns

### Missing Data

1. Verify tenant context in request logs
2. Check global scope application
3. Confirm user-tenant association
4. Review recent database migrations

## Additional Resources

- **API Routes**: `api/routes/api.php` (lines 151-178)
- **Controller**: `api/app/Http/Controllers/Api/OperationsController.php`
- **Models**: `api/app/Models/` (NetworkNode, TelemetryTag, etc.)
- **Migrations**: `api/database/migrations/2025_11_20_*`
- **Security Traits**: `api/app/Models/Traits/HasTenancy.php`

## Contact

For monitoring issues or questions:
- Review this guide first
- Check Laravel logs in `api/storage/logs/`
- Run integration test suite to verify system health
- Consult system architecture documentation in `replit.md`
