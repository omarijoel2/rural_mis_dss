# Rural Water Supply MIS - Database Export

## Database Schema
**File:** `database_schema.sql` (247 KB, 8676 lines)

Contains complete PostgreSQL schema with all tables, indexes, constraints, and PostGIS extensions.

### GW4R Module Tables (Recent Additions)

1. **aquifers** - 7 ASAL aquifer sustainability tracking
   - Fields: id, tenant_id, name, safeYieldMcm, currentYieldMcm, rechargeRateMcm, depthM, waterQualityStatus, riskLevel, areaKm2, createdAt, updatedAt

2. **drought_events** - Emergency drought response coordination
   - Fields: id, tenant_id, name, status, severity, startDate, endDate, affectedPopulation, activatedBoreholes, waterRationing, createdAt, updatedAt

3. **groundwater_monitoring** - Water level & quality time-series
   - Fields: id, aquifer_id, measurementDate, waterLevelM, abstractionMcm, chlorideMg, fluorideMg, nitrateMg, quality_status, createdAt

4. **gender_equity_tracking** - Demographic water access metrics
   - Fields: id, scheme_id, gender, ageGroup, collectionTimeMins, waterHoursPerDay, satisfaction, createdAt

5. **competency_assessments** - Operator certification tracking
   - Fields: id, operator_id, topic, score, maxScore, status, certificationValid, validUntil, createdAt

6. **vulnerable_groups** - Population segmentation
   - Fields: id, scheme_id, groupName, populationCount, accessChallenges, supportMeasures, createdAt

### Core System Tables (37 total)
- Core Registry: schemes, infrastructure
- CRM: crm_customers, crm_invoices, crm_payments
- CMMS: assets, asset_classes, checklists
- Training: courses, certificates
- Audit: audit_events

## How to Export Data

### Option 1: Export as SQL (Complete Backup)
```bash
pg_dump "$DATABASE_URL" > full_backup.sql
```

### Option 2: Export Individual Tables as CSV
```bash
psql "$DATABASE_URL" -c "\COPY aquifers TO 'aquifers.csv' WITH (FORMAT csv, HEADER)"
psql "$DATABASE_URL" -c "\COPY drought_events TO 'drought_events.csv' WITH (FORMAT csv, HEADER)"
psql "$DATABASE_URL" -c "\COPY competency_assessments TO 'assessments.csv' WITH (FORMAT csv, HEADER)"
psql "$DATABASE_URL" -c "\COPY gender_equity_tracking TO 'gender_equity.csv' WITH (FORMAT csv, HEADER)"
```

### Option 3: Access via Node.js
```typescript
import { db } from './server/db';
const aquifers = await db.select().from(schema.aquifers);
const droughts = await db.select().from(schema.droughtEvents);
const assessments = await db.select().from(schema.competencyAssessments);
```

## Import Instructions

To restore schema into new database:
```bash
createdb new_database
psql new_database < database_schema.sql
```

## Database Statistics
- PostgreSQL Version: 16.9
- Extensions: PostGIS for spatial data
- Tables: 40+ (Core system + GW4R modules)
- Multi-tenancy: All tables scoped by tenant_id
