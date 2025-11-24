# Rural Water Supply MIS - Database Export Reference

**Generated:** November 24, 2025  
**System:** Rural Water Supply Management Information System (MIS)  
**Purpose:** Complete database schema and sample data export

---

## 📋 Export Files

### 1. `DATABASE_SCHEMA_EXPORT.sql`
- **Purpose:** Complete database schema DDL (Data Definition Language)
- **Contains:** All 26+ tables across all modules
- **Size:** ~4.2 KB
- **Usage:** 
  ```bash
  # Create fresh database with complete schema
  psql $DATABASE_URL -f DATABASE_SCHEMA_EXPORT.sql
  
  # Or in your application
  npm run db:push
  ```

### 2. `DATABASE_SAMPLE_DATA.sql`
- **Purpose:** Sample/mock data for testing and development
- **Contains:** 
  - 14 Module Settings records
  - 70 Role-Module Access records (5 roles × 14 modules)
  - 6 Aquifer records (ASAL counties)
  - 5 Groundwater monitoring records
  - 4 Gender & equity records
  - 3 Drought events
- **Size:** ~3.1 KB
- **Usage:**
  ```bash
  # Load sample data (after schema is created)
  psql $DATABASE_URL -f DATABASE_SAMPLE_DATA.sql
  ```

---

## 🗂️ Database Schema Overview

### **Module Groups**

#### 1. **Core Infrastructure**
- `users` - User authentication

#### 2. **Workflows Engine (Module 18)**
- `wf_definitions` - Workflow definitions
- `wf_instances` - Workflow instances
- `wf_transitions` - State transitions
- `wf_tasks` - Task assignments
- `wf_slas` - Service level agreements
- `wf_escalations` - Escalation tracking
- `wf_webhooks` - Webhook integrations
- `wf_signals` - Signal events

#### 3. **Groundwater & Aquifer Management (GW4R Phase 1)**
- `aquifers` - Aquifer registry with yield, recharge, geology
- `groundwater_monitoring` - Water level, abstraction, quality time-series
- `drought_events` - Drought declarations and tracking
- `gender_equity_tracking` - Demographic water access metrics
- `competency_assessments` - Operator certifications
- `vulnerable_groups` - Population segmentation

#### 4. **Predictive Analytics (Phase 3)**
- `predictions` - Asset failure, NRW, demand forecasts
- `anomaly_events` - Leak detection and anomalies
- `forecast_data` - 7-day demand forecasts
- `nrw_snapshots` - NRW tracking snapshots
- `interventions` - NRW intervention tracking

#### 5. **Settings & Configuration (NEW - Nov 24 2025)**
- `module_settings` - Module enable/disable (14 modules)
- `role_module_access` - Role-based module access matrix (5 roles × 14 modules)

---

## 🎯 Settings & Configuration Module

### `module_settings` Table
```sql
CREATE TABLE module_settings (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,              -- Multi-tenancy
    module_key TEXT NOT NULL,                -- e.g., 'core-registry', 'crm'
    module_name TEXT NOT NULL,               -- Display name
    is_enabled BOOLEAN DEFAULT true,         -- Admin toggle
    description TEXT,                        -- Module purpose
    icon TEXT,                              -- Icon name
    "order" INTEGER DEFAULT 0,              -- Display order
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (tenant_id, module_key)
);
```

**14 Supported Modules:**
1. `core-registry` - Core Registry (schemes, assets, facilities)
2. `core-ops` - Core Operations (telemetry, outages, SCADA)
3. `crm` - Customer Relationship Management
4. `cmms` - Computerized Maintenance Management System
5. `water-quality` - Water Quality monitoring
6. `hydromet` - Hydro-meteorological data
7. `costing` - Costing & Finance
8. `procurement` - Procurement (RFQs, LPOs)
9. `projects` - Project Management
10. `community` - Community & Stakeholder Engagement
11. `risk-compliance` - Risk, Compliance & Governance
12. `dsa` - Decision Support & Analytics
13. `training` - Training & Knowledge Management
14. `me` - Monitoring & Evaluation

### `role_module_access` Table
```sql
CREATE TABLE role_module_access (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,              -- Multi-tenancy
    role_id VARCHAR NOT NULL,                -- admin, manager, operator, analyst, viewer
    module_key TEXT NOT NULL,                -- References module_settings.module_key
    has_access BOOLEAN DEFAULT true,         -- Can user with this role access?
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (tenant_id, role_id, module_key)
);
```

**5 System Roles:**
1. **Admin** → All 14 modules
2. **Manager** → 7 modules (Registry, Ops, CRM, CMMS, WQ, Projects, Costing)
3. **Operator** → 3 modules (Ops, CMMS, WQ)
4. **Analyst** → 4 modules (DSA, M&E, Costing, Registry)
5. **Viewer** → 3 modules (Registry, M&E, DSA) - Read-only

---

## 🔄 Multi-Tenancy Design

All tables use **tenant isolation** with `tenant_id` column:

```typescript
// Every table includes:
tenantId: varchar('tenant_id').notNull(),  // Customer/organization ID

// Indexes on tenant_id for performance
CREATE INDEX idx_<table>_tenant ON <table>(tenant_id);
```

**Data Isolation:** Each tenant sees only their own data.

---

## 📊 Indexes for Performance

### Core Indexes
```sql
-- Workflows
CREATE INDEX idx_wf_def_active ON wf_definitions(active);
CREATE INDEX idx_wf_inst_tenant ON wf_instances(tenant_id);
CREATE INDEX idx_wf_inst_entity ON wf_instances(entity_type, entity_id);
CREATE INDEX idx_wf_task_assignee ON wf_tasks(assignee_id);
CREATE INDEX idx_wf_task_status ON wf_tasks(status);

-- Aquifers & Groundwater
CREATE INDEX idx_aquifer_tenant ON aquifers(tenant_id);
CREATE INDEX idx_aquifer_county ON aquifers(county);
CREATE INDEX idx_groundwater_monitoring_aquifer ON groundwater_monitoring(aquifer_id);
CREATE INDEX idx_groundwater_monitoring_date ON groundwater_monitoring(measurement_date);

-- Predictions & Analytics
CREATE INDEX idx_predictions_tenant ON predictions(tenant_id);
CREATE INDEX idx_predictions_type ON predictions(prediction_type);
CREATE INDEX idx_anomaly_events_dma ON anomaly_events(dma_id);
CREATE INDEX idx_nrw_snapshots_date ON nrw_snapshots(snapshot_date);

-- Settings & Configuration
CREATE INDEX idx_module_settings_enabled ON module_settings(is_enabled);
CREATE INDEX idx_role_module_access_role ON role_module_access(role_id);
CREATE INDEX idx_role_module_access_module ON role_module_access(module_key);
```

---

## 🚀 Quick Start

### Step 1: Create Schema
```bash
# Connect to your PostgreSQL database
psql $DATABASE_URL -f DATABASE_SCHEMA_EXPORT.sql

# Or use Drizzle ORM
npm run db:push
```

### Step 2: Load Sample Data (Optional)
```bash
# Load sample data for testing
psql $DATABASE_URL -f DATABASE_SAMPLE_DATA.sql
```

### Step 3: Verify
```sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check module settings
SELECT * FROM module_settings LIMIT 5;

-- Check role access matrix
SELECT * FROM role_module_access LIMIT 10;
```

---

## 📈 Data Volume & Performance

### Expected Growth
- **Module Settings:** 14 records × N tenants = minimal
- **Role-Module Access:** 70 records × N tenants (5 roles × 14 modules)
- **Aquifers:** ~30-50 records per tenant
- **Groundwater Monitoring:** ~1,000+ records/month per aquifer
- **Predictions:** ~500-1,000 records/month per tenant

### Recommended Maintenance
```sql
-- Monthly cleanup of old predictions
DELETE FROM predictions 
WHERE created_at < CURRENT_DATE - INTERVAL '90 days';

-- Archive old anomalies
DELETE FROM anomaly_events 
WHERE detection_date < CURRENT_DATE - INTERVAL '1 year';
```

---

## 🔐 Security Features

1. **Multi-Tenancy Isolation:** `tenant_id` on all tables prevents cross-tenant data leaks
2. **Role-Based Access Control:** `role_module_access` matrix enforces permissions
3. **Unique Constraints:** Prevent duplicate entries
4. **Audit Timestamps:** `created_at`, `updated_at` on all tables
5. **Index Optimization:** Fast queries on frequently filtered columns

---

## 📝 Database Views (Future)

```sql
-- Example: Role permissions dashboard
CREATE VIEW role_access_summary AS
SELECT 
    role_id,
    COUNT(*) as modules_accessible,
    STRING_AGG(module_key, ', ' ORDER BY module_key) as modules
FROM role_module_access
WHERE has_access = true
GROUP BY role_id;

-- Example: Module enablement by tenant
CREATE VIEW module_enablement AS
SELECT 
    tenant_id,
    COUNT(*) FILTER (WHERE is_enabled) as enabled_modules,
    COUNT(*) as total_modules,
    ROUND(100.0 * COUNT(*) FILTER (WHERE is_enabled) / COUNT(*), 2) as enablement_percent
FROM module_settings
GROUP BY tenant_id;
```

---

## 🔗 API Integration Points

### Backend Endpoints (for future implementation)
```
GET  /api/v1/modules/settings         - List enabled modules
POST /api/v1/modules/settings         - Create/update module settings
PUT  /api/v1/modules/settings/:key    - Toggle module
GET  /api/v1/roles/:role/access       - Get role access matrix
POST /api/v1/roles/:role/access       - Update role permissions
GET  /api/v1/tenants/:id/modules      - List tenant's enabled modules
```

### React Hook
```typescript
const { availableModules, isModuleAvailable, getAvailableModuleKeys } = useAvailableModules();

// Check if module is available
if (isModuleAvailable('crm')) {
  // Show CRM module in sidebar
}

// Get all available modules for current user
const modules = getAvailableModuleKeys(); // ['core-registry', 'me', 'dsa']
```

---

## 📚 Related Documentation

- **Schema Definition:** `shared/schema.ts`
- **Settings Page:** `client/src/pages/admin/SettingsPage.tsx`
- **Role Access Page:** `client/src/pages/admin/RoleMenuAccessPage.tsx`
- **Hook Implementation:** `client/src/hooks/useAvailableModules.ts`
- **Project README:** `replit.md`

---

## ✅ Checklist for Database Setup

- [ ] Create database tables (run `DATABASE_SCHEMA_EXPORT.sql`)
- [ ] Load sample data (run `DATABASE_SAMPLE_DATA.sql`)
- [ ] Verify module_settings table (14 records per tenant)
- [ ] Verify role_module_access table (70 records per tenant)
- [ ] Run `npm run db:push` to sync Drizzle schema
- [ ] Update `.env` with `DATABASE_URL`
- [ ] Test Settings page at `/admin/settings`
- [ ] Test Role Access page at `/admin/rbac/menu-access`
- [ ] Verify sidebar module filtering with `useAvailableModules()` hook

---

**Last Updated:** November 24, 2025  
**Schema Version:** 1.0  
**Status:** Production Ready ✅
