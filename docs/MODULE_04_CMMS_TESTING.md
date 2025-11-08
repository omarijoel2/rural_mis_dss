# Module 04: CMMS Testing Guide

## Overview

Module 04 implements a comprehensive Computerized Maintenance Management System (CMMS) for the Rural Water Supply MIS. This guide explains how to test all CMMS features.

## Backend Status

✅ **Production Ready** (Architect Approved - Nov 8, 2024)

- 15 CMMS database tables
- 13 Eloquent models with full relationships
- 3 service classes (AssetService, WorkOrderService, InventoryService)
- 2 API controllers with 20+ endpoints
- RBAC integration with 14 permissions
- 100 assets + 10 parts + demo data seeded

## Prerequisites

### 1. Start Both Servers

The MIS requires two servers running simultaneously:

**Express Server (Port 5000)**
```bash
# Click the "Run" button in Replit
# OR manually:
npm run dev
```

**Laravel API Server (Port 8001)**
```bash
cd api && php artisan serve --host=0.0.0.0 --port=8001
```

Keep both terminal sessions open while testing.

### 2. Verify Database Setup

```bash
# Check migrations
cd api && php artisan migrate:status | grep cmms

# Check seeded data
php artisan tinker --execute="
echo 'Assets: ' . \App\Models\Asset::count() . PHP_EOL;
echo 'Parts: ' . \App\Models\Part::count() . PHP_EOL;
echo 'Asset Classes: ' . \App\Models\AssetClass::count() . PHP_EOL;
"
```

Expected output:
- Assets: 100
- Parts: 10
- Asset Classes: 10

## Quick Test Script

Run the automated test suite:

```bash
./api/tests/cmms-api-test.sh
```

This script will:
1. Verify Laravel server is running
2. Test Asset endpoints
3. Test Part endpoints
4. Test WorkOrder endpoints
5. Verify database counts

## Manual API Testing

### Asset Endpoints

```bash
# List all assets (paginated)
curl http://localhost:8001/api/v1/assets?per_page=10

# Filter by status
curl http://localhost:8001/api/v1/assets?status=active

# Filter by asset class
curl http://localhost:8001/api/v1/assets?class_id=1

# View single asset with relationships
curl http://localhost:8001/api/v1/assets/1

# Asset locations (spatial data)
curl http://localhost:8001/api/v1/assets/1/locations

# Asset maintenance history
curl http://localhost:8001/api/v1/assets/1/maintenance-history
```

### Part Endpoints

```bash
# List all parts
curl http://localhost:8001/api/v1/parts?per_page=10

# Filter by category
curl http://localhost:8001/api/v1/parts?category=pipe

# View single part with stock levels
curl http://localhost:8001/api/v1/parts/1
```

### Work Order Endpoints

```bash
# List all work orders
curl http://localhost:8001/api/v1/work-orders?per_page=10

# Filter by status
curl http://localhost:8001/api/v1/work-orders?status=open

# Filter by priority
curl http://localhost:8001/api/v1/work-orders?priority=high

# Filter by kind
curl http://localhost:8001/api/v1/work-orders?kind=pm

# View single work order with parts/labor
curl http://localhost:8001/api/v1/work-orders/1
```

### Stock Transaction Endpoints

```bash
# List stock transactions
curl http://localhost:8001/api/v1/stock-txns?per_page=10

# Filter by part
curl http://localhost:8001/api/v1/stock-txns?part_id=1

# Filter by transaction kind
curl http://localhost:8001/api/v1/stock-txns?kind=issue
```

## Authenticated Endpoints (POST/PUT/DELETE)

These endpoints require authentication and appropriate permissions:

### Create Asset

```bash
curl -X POST http://localhost:8001/api/v1/assets \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "code": "PMP-101",
    "name": "Submersible Pump",
    "class_id": 1,
    "scheme_id": "a04d660a-bf49-4734-b721-b3ebef135a19",
    "status": "active",
    "manufacturer": "Grundfos",
    "model": "SP 3A-12",
    "install_date": "2024-01-15"
  }'
```

### Create Work Order

```bash
curl -X POST http://localhost:8001/api/v1/work-orders \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "kind": "cm",
    "asset_id": 1,
    "title": "Fix pump motor",
    "description": "Motor making unusual noise",
    "priority": "high",
    "scheduled_for": "2024-11-15"
  }'
```

### Add Parts to Work Order

```bash
curl -X POST http://localhost:8001/api/v1/work-orders/1/parts \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "parts": [
      {
        "part_id": 1,
        "qty": 2,
        "unit_cost": 150.00
      }
    ]
  }'
```

### Add Labor to Work Order

```bash
curl -X POST http://localhost:8001/api/v1/work-orders/1/labor \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "user_id": "USER_UUID",
    "hours": 4.5,
    "hourly_rate": 25.00
  }'
```

### Complete Work Order

```bash
curl -X POST http://localhost:8001/api/v1/work-orders/1/complete \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "completion_notes": "Replaced motor bearings, tested operation"
  }'
```

## Permission Requirements

The following RBAC permissions control access to CMMS endpoints:

- `view assets` - View asset lists and details
- `create assets` - Create new assets
- `edit assets` - Update existing assets
- `delete assets` - Delete assets
- `view work orders` - View work orders
- `create work orders` - Create new work orders
- `edit work orders` - Update work orders
- `delete work orders` - Delete work orders
- `view parts inventory` - View parts and stock
- `manage parts inventory` - Create/update/delete parts
- `view maintenance history` - View asset maintenance records
- `manage pm schedules` - Manage preventive maintenance policies

## Database Schema Reference

### Core Tables

1. **asset_classes** - Asset type definitions (pump, pipe, tank, etc.)
2. **assets** - Physical infrastructure assets
3. **asset_locations** - Spatial history tracking
4. **asset_meters** - Meter readings (flow, pressure, etc.)
5. **meter_captures** - Time-series meter data
6. **parts** - Inventory items
7. **asset_boms** - Bill of materials (asset-part relationships)
8. **suppliers** - Part supplier records
9. **pm_policies** - Preventive maintenance schedules
10. **pm_schedules** - Generated PM work order templates
11. **work_orders** - Maintenance work orders
12. **stock_txns** - Inventory transactions
13. **wo_parts** - Parts used in work orders
14. **wo_labor** - Labor hours on work orders
15. **failures** - Failure/incident reporting

### Key Relationships

- Assets belong to AssetClass, Scheme, DMA, Organization (tenant)
- Assets can have parent/child hierarchy
- WorkOrders link to Asset (nullable for general tasks)
- WorkOrders track creator and assignee (Users)
- WoParts link WorkOrders to Parts with quantity/cost
- WoLabor tracks labor hours by User
- StockTxns record all inventory movements

## Validation Rules

### Asset Creation/Update

- `code` - Required, unique string (max 50 chars)
- `class_id` - Required, integer, exists in asset_classes
- `scheme_id` - Optional UUID, exists in schemes
- `dma_id` - Optional UUID, exists in dmas
- `parent_id` - Optional integer, exists in assets
- `status` - Required, enum: active|inactive|retired|under_maintenance

### Work Order Creation/Update

- `kind` - Required, enum: pm|cm|emergency|project
- `asset_id` - Optional integer (nullable for general tasks)
- `priority` - Required, enum: low|medium|high|critical
- `assigned_to` - Optional UUID, exists in users
- `pm_policy_id` - Optional integer, exists in pm_policies

### Part Creation/Update

- `code` - Required, unique string (max 50 chars)
- `category` - Required, string (max 100 chars)
- `unit` - Required, string (max 20 chars)
- `reorder_level` - Optional numeric value
- `unit_cost` - Optional numeric value

## Troubleshooting

### "Laravel API unavailable" errors

Laravel process is not running. Start it:
```bash
cd api && php artisan serve --host=0.0.0.0 --port=8001
```

### "401 Unauthorized" errors

You need to authenticate first. Create a user account and login to get a session cookie.

### "403 Forbidden" errors

Your user lacks the required permission. Check your role assignments:
```bash
cd api && php artisan tinker --execute="
\$user = \App\Models\User::find('YOUR_USER_ID');
echo 'Roles: ' . \$user->roles->pluck('name')->join(', ') . PHP_EOL;
echo 'Permissions: ' . \$user->getAllPermissions()->pluck('name')->join(', ') . PHP_EOL;
"
```

### Empty responses or validation errors

Check Laravel logs:
```bash
tail -f api/storage/logs/laravel.log
```

## Next Steps

1. ✅ **Backend Complete** - All CMMS tables, models, services, controllers
2. 🔄 **Frontend Implementation** - React components for asset/WO management
3. 🔄 **GIS Integration** - MapLibre GL asset visualization
4. 🔄 **KPI Dashboard** - Maintenance metrics and reporting
5. 🔄 **Mobile Optimization** - Field technician interface

## Architect Review Status

✅ **APPROVED** - Nov 8, 2024

All schema/model/validation alignment verified. Production-ready backend implementation.

**Review Findings:**
- Schema, models, and controllers fully aligned
- Integer IDs correctly validated (asset_id, class_id, part_id, pm_policy_id)
- UUID fields correctly validated (scheme_id, dma_id, user references)
- Nullable asset_id properly supported for general work orders
- Relationship names consistent (woParts, woLabor, createdBy, assignedTo)
- No blocking issues identified
