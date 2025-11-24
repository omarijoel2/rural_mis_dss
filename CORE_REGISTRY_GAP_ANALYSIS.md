# CORE SERVICE & NETWORK OPERATIONS MODULE — GAP ANALYSIS

**Date:** November 23, 2025  
**Module:** Core Service & Network Operations (Core Registry)  
**Status:** 🔴 **NOT STARTED** — 0% Complete  
**Priority:** ⭐⭐⭐⭐⭐ **CRITICAL** — Required for operational management

---

## EXECUTIVE SUMMARY

The Core Service & Network Operations module is a **production-grade infrastructure management system** that handles water scheme registry, network topology, assets, telemetry/SCADA, pump scheduling, NRW tracking, outages, and dosing control. 

**Current Status:** Specification exists but **zero implementation** in the codebase. This is a **complete greenfield module** requiring ~400+ hours of development across:
- Database schema (20+ tables)
- Laravel backend (20+ models, 15+ controllers)
- React frontend (12+ pages)
- Services layer (6+ service classes)
- API endpoints (40+ endpoints)

---

## MODULE REQUIREMENTS OVERVIEW

### Core Components
1. **Scheme Registry & Topology** - Water supply scheme management with network graphs
2. **Hydraulic Assets** - Pipes, valves, pumps, reservoirs, meters with polymorphic asset system
3. **Network Operations Console** - Real-time operational KPIs and monitoring
4. **Telemetry/SCADA Mapping** - IoT device management and real-time measurements
5. **Pump & Reservoir Scheduling** - Automated scheduling with constraints
6. **NRW & Water Balance** - Non-Revenue Water tracking and interventions
7. **Meter Management** - Consumer and bulk meter management
8. **Leak & Pressure Management** - Pressure/leak detection and reporting
9. **Outage Planner** - Planned and emergency outage management
10. **Dosing Control** - Chemical dosing automation with stock tracking

---

## DETAILED GAP ANALYSIS

### 1. DATABASE SCHEMA — 20+ TABLES REQUIRED

#### 1.1 Schemes & Topology (3 tables)

| Table | Status | Fields Required | Current |
|-------|--------|-----------------|---------|
| `schemes` | ❌ MISSING | id, name, code, type, status, ownership, county, population, connections, capacity, geometry | None |
| `dmas` | ❌ MISSING | id, scheme_id, name, code, status, boundary (PostGIS) | None |
| `network_nodes` | ❌ MISSING | id, scheme_id, type, props (JSONB), geometry (PostGIS) | None |
| `network_edges` | ❌ MISSING | id, from_node, to_node, asset_id, order, geom | None |

**Gap:** Complete absence of water scheme registry and network topology. These are FOUNDATIONAL — everything else depends on them.

**Required Indices:**
```sql
CREATE INDEX idx_schemes_status ON schemes(status);
CREATE INDEX idx_schemes_code ON schemes(code);
CREATE INDEX idx_dmas_scheme ON dmas(scheme_id);
CREATE INDEX idx_nodes_scheme ON network_nodes(scheme_id);
CREATE INDEX idx_edges_from_to ON network_edges(from_node_id, to_node_id);
CREATE INDEX idx_nodes_geom ON network_nodes USING GIST(geom);
```

#### 1.2 Assets & Asset Types (2 tables)

| Table | Status | Fields Required | Current |
|-------|--------|-----------------|---------|
| `asset_types` | ❌ MISSING | id, name (unique), schema (JSONB spec) | None |
| `assets` | ❌ MISSING | id, asset_type_id, scheme_id, code, status, condition, specs (JSONB), geometry | None |

**Gap:** No asset management system. Asset types must support dynamic fields via JSONB schema for:
- Pipes (diameter, material, installation_date, length)
- Pumps (model, power_kw, design_head, efficiency_curve)
- Reservoirs (capacity_m3, overflow_height, material)
- Meters (meter_type, accuracy_class, serial_number)
- Valves (type: isolation/check/prv, diameter, material)
- Chlorinators (model, max_dose_mg_l, feed_type)

**Supported Asset Types:**
```json
{
  "pipe": ["diameter", "material", "length", "installation_date"],
  "pump": ["model", "power_kw", "design_head", "efficiency_curve"],
  "reservoir": ["capacity_m3", "material", "overflow_height"],
  "meter": ["meter_type", "accuracy_class", "serial_number"],
  "valve": ["type", "diameter", "material"],
  "chlorinator": ["model", "max_dose_mg_l", "feed_type"],
  "prv": ["model", "set_pressure_bar"],
  "booster": ["model", "power_kw", "lift_height"]
}
```

#### 1.3 Telemetry & SCADA (2 tables)

| Table | Status | Fields Required | Current |
|-------|--------|-----------------|---------|
| `telemetry_tags` | ❌ MISSING | id, tag (unique), io_type, unit, scale (JSONB), thresholds (JSONB), asset_id | None |
| `telemetry_measurements` | ❌ MISSING | id, telemetry_tag_id, ts, value, meta (JSONB) | None |

**Gap:** Zero telemetry/SCADA support. Must support:
- **AI (Analog Input)**: flow, pressure, tank level, chlorine residual, turbidity
- **DI (Digital Input)**: pump status (on/off), valve position, alarm flags
- **AO (Analog Output)**: pump speed command, dosing rate
- **DO (Digital Output)**: pump start/stop, valve control

**Optional:** TimescaleDB hypertable for `telemetry_measurements` for time-series optimization:
```sql
SELECT create_hypertable('telemetry_measurements', by_range('ts'), if_not_exists => TRUE);
```

**Scale Definition Example:**
```json
{
  "min": 0,
  "max": 100,
  "offset": 0,
  "unit": "bar"
}
```

**Thresholds Example:**
```json
{
  "critical_low": 0.5,
  "warning_low": 1.0,
  "warning_high": 9.0,
  "critical_high": 10.0
}
```

#### 1.4 NRW & Water Balance (2 tables)

| Table | Status | Fields Required | Current |
|-------|--------|-----------------|---------|
| `nrw_snapshots` | ❌ MISSING | id, dma_id, as_of, system_input_m3, billed_authorized_m3, water_loss_m3, nrw_pct | None |
| `interventions` | ❌ MISSING | id, dma_id, type, start_date, end_date, cost, impact | None |

**Gap:** No NRW (Non-Revenue Water) tracking or water balance. IWCO requires this for compliance.

**NRW Calculation:**
```
NRW% = (System Input - Billed Authorized) / System Input × 100
```

**Intervention Types:**
- leak_detection_repair
- meter_audit
- pressure_management
- customer_metering
- active_leakage_control
- passive_leakage_control

#### 1.5 Outages & Rotational Supply (2 tables)

| Table | Status | Fields Required | Current |
|-------|--------|-----------------|---------|
| `outages` | ❌ MISSING | id, scheme_id, cause, state, scheduled_start, scheduled_end, actual_start, actual_end | None |
| `outage_audits` | ❌ MISSING | id, outage_id, user_id, action, notes, created_at | None |

**Gap:** No outage planning or management. States must follow workflow:
```
draft → approved → live → restored → post_mortem → closed
```

**Outage Causes:**
- planned (scheduled maintenance/system flush)
- fault (equipment failure)
- water_quality (contamination)
- power (electricity outage)
- other

#### 1.6 Dosing Control & Chemical Stocks (3 tables)

| Table | Status | Fields Required | Current |
|-------|--------|-----------------|---------|
| `dose_plans` | ❌ MISSING | id, scheme_id, asset_id, flow_bands (JSONB), alarms (JSONB) | None |
| `chemical_stocks` | ❌ MISSING | id, scheme_id, chemical, quantity_l, unit_cost, supplier, expiry_date | None |
| `dose_change_logs` | ❌ MISSING | id, dose_plan_id, ts, old_dose, new_dose, user_id | None |

**Gap:** No automated dosing or chemical inventory. Flow bands example:

```json
{
  "flow_bands": [
    {"min_lps": 0, "max_lps": 50, "target_mg_l": 0.5},
    {"min_lps": 50, "max_lps": 100, "target_mg_l": 0.8},
    {"min_lps": 100, "max_lps": 500, "target_mg_l": 1.0}
  ],
  "alarms": {
    "residual_low": 0.1,
    "residual_high": 2.0,
    "flow_high": 600,
    "pump_fault": true
  }
}
```

#### 1.7 Pump & Reservoir Scheduling (1 table)

| Table | Status | Fields Required | Current |
|-------|--------|-----------------|---------|
| `pump_schedules` | ❌ MISSING | id, asset_id, start_at, end_at, constraints (JSONB) | None |

**Gap:** No scheduling system. Constraints include:
```json
{
  "reservoir_targets": {"min_m3": 100, "max_m3": 500},
  "tariff_bands": [
    {"start_hour": 6, "end_hour": 9, "enabled": false},
    {"start_hour": 18, "end_hour": 22, "enabled": true}
  ],
  "max_run_hours_per_day": 12
}
```

#### 1.8 Meter Management (1 table)

| Table | Status | Fields Required | Current |
|-------|--------|-----------------|---------|
| `meters` | ❌ MISSING | id, asset_id, meter_type, serial, accuracy_class, installation_date, last_read, consumer_id | None |

**Gap:** Meters treated as generic assets but need dedicated tracking for readings and management.

#### 1.9 Leak & Pressure Reports (1 table)

| Table | Status | Fields Required | Current |
|-------|--------|-----------------|---------|
| `leak_pressure_reports` | ❌ MISSING | id, scheme_id, location, type, pressure_bar, reported_date, status, investigation_date | None |

**Gap:** No pressure/leak detection system. Required for SCADA integration.

---

### 2. ELOQUENT MODELS — 15+ REQUIRED

**Missing Models:**

```
✗ App/Domain/CoreOps/Models/Scheme.php
✗ App/Domain/CoreOps/Models/Dma.php
✗ App/Domain/CoreOps/Models/NetworkNode.php
✗ App/Domain/CoreOps/Models/NetworkEdge.php
✗ App/Domain/CoreOps/Models/AssetType.php
✗ App/Domain/CoreOps/Models/Asset.php
✗ App/Domain/CoreOps/Models/TelemetryTag.php
✗ App/Domain/CoreOps/Models/TelemetryMeasurement.php
✗ App/Domain/CoreOps/Models/NrwSnapshot.php
✗ App/Domain/CoreOps/Models/Intervention.php
✗ App/Domain/CoreOps/Models/Outage.php
✗ App/Domain/CoreOps/Models/OutageAudit.php
✗ App/Domain/CoreOps/Models/DosePlan.php
✗ App/Domain/CoreOps/Models/ChemicalStock.php
✗ App/Domain/CoreOps/Models/DoseChangeLog.php
✗ App/Domain/CoreOps/Models/PumpSchedule.php
✗ App/Domain/CoreOps/Models/Meter.php
✗ App/Domain/CoreOps/Models/LeakPressureReport.php
```

**Example Model Requirements:**

```php
// Scheme with PostGIS
class Scheme extends Model {
    use PostgisTrait;
    protected $postgisFields = ['geom'];
    public function dmas() { return $this->hasMany(Dma::class); }
    public function assets() { return $this->hasMany(Asset::class); }
    public function networkNodes() { return $this->hasMany(NetworkNode::class); }
}

// Asset with Polymorphic relationships
class Asset extends Model {
    use PostgisTrait;
    protected $casts = ['specs' => 'array'];
    public function assetType() { return $this->belongsTo(AssetType::class); }
    public function telemetryTags() { return $this->hasMany(TelemetryTag::class); }
}

// Network topology
class NetworkNode extends Model {
    use PostgisTrait;
    public function edges() {
        return $this->hasMany(NetworkEdge::class, 'from_node_id');
    }
}
```

---

### 3. API LAYER — 40+ ENDPOINTS

#### Required Controllers & Routes:

| Controller | Endpoints | Status |
|------------|-----------|--------|
| SchemeController | 5 | ❌ Missing |
| DmaController | 5 | ❌ Missing |
| AssetController | 8 | ❌ Missing |
| TelemetryController | 6 | ❌ Missing |
| TopologyController | 3 | ❌ Missing |
| OperationsController | 4 | ❌ Missing |
| NrwController | 4 | ❌ Missing |
| OutageController | 8 | ❌ Missing |
| DosingController | 6 | ❌ Missing |
| ScheduleController | 5 | ❌ Missing |
| MeterController | 5 | ❌ Missing |

**Total Endpoints:** 40 documented API routes

**Priority Endpoints:**

```php
// Schemes
GET    /api/core-ops/schemes                    // List schemes
POST   /api/core-ops/schemes                    // Create scheme
GET    /api/core-ops/schemes/{id}               // Get scheme
PUT    /api/core-ops/schemes/{id}               // Update scheme
GET    /api/core-ops/schemes/{id}/kpis          // Get KPIs

// Topology
GET    /api/core-ops/topology/trace             // Trace upstream/downstream (node_id, direction)
GET    /api/core-ops/dmas/{dma}/network         // Get DMA network

// Telemetry (high-frequency)
POST   /api/core-ops/telemetry/ingest           // Ingest measurements (batch)
GET    /api/core-ops/telemetry/tags             // List tags
GET    /api/core-ops/assets/{id}/telemetry      // Get asset latest readings

// NRW
GET    /api/core-ops/nrw/dma/{dma}              // Get NRW snapshot
POST   /api/core-ops/nrw/snapshot               // Create snapshot
GET    /api/core-ops/interventions              // List interventions

// Outages
GET    /api/core-ops/outages                    // List outages
POST   /api/core-ops/outages                    // Create outage
POST   /api/core-ops/outages/{id}/approve       // State transition
POST   /api/core-ops/outages/{id}/go-live       // State transition
POST   /api/core-ops/outages/{id}/restore       // Restore service
POST   /api/core-ops/outages/{id}/close         // Close outage

// Operations Console
GET    /api/core-ops/console/kpis               // Real-time KPIs
GET    /api/core-ops/console/alarms             // Active alarms

// Dosing
GET    /api/core-ops/dose-plans                 // List dose plans
POST   /api/core-ops/dose-plans/{id}/log-change // Log dose change
```

---

### 4. HTTP REQUESTS & VALIDATION — 15+ REQUEST CLASSES

**Missing Request Classes:**

```
✗ StoreSchemeRequest.php
✗ UpdateSchemeRequest.php
✗ StoreDmaRequest.php
✗ StoreAssetRequest.php
✗ StoreTelemetryTagRequest.php
✗ IngestTelemetryRequest.php
✗ StoreOutageRequest.php
✗ ApproveOutageRequest.php
✗ StoreDosePlanRequest.php
✗ LogDoseChangeRequest.php
✗ UpdatePumpScheduleRequest.php
```

**Example Validation Rules:**

```php
class StoreSchemeRequest extends FormRequest {
    public function rules(): array {
        return [
            'name' => 'required|string|min:3|max:100',
            'code' => 'required|string|alpha_dash|unique:schemes,code',
            'type' => 'required|in:urban,rural,mixed',
            'status' => 'in:operational,construction,dormant,planned',
            'population_served' => 'nullable|integer|min:1',
            'connections_total' => 'nullable|integer|min:0',
            'design_capacity_m3d' => 'nullable|numeric|min:0.01',
            'geom' => 'nullable|string', // GeoJSON polygon
            'contacts' => 'nullable|json',
        ];
    }
}

class IngestTelemetryRequest extends FormRequest {
    public function rules(): array {
        return [
            'measurements' => 'required|array|min:1|max:1000',
            'measurements.*.tag_id' => 'required|integer|exists:telemetry_tags,id',
            'measurements.*.value' => 'required|numeric',
            'measurements.*.ts' => 'required|date_format:Y-m-d\TH:i:s.u\Z',
        ];
    }
}
```

---

### 5. API RESOURCES — 12+ RESPONSE CLASSES

**Missing Resource Classes:**

```
✗ SchemeResource.php
✗ DmaResource.php
✗ AssetResource.php
✗ TelemetryTagResource.php
✗ TelemetryMeasurementResource.php
✗ NetworkNodeResource.php
✗ OutageResource.php
✗ NrwSnapshotResource.php
✗ DosePlanResource.php
✗ PumpScheduleResource.php
✗ MeterResource.php
```

**Example Resource:**

```php
class SchemeResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'type' => $this->type,
            'status' => $this->status,
            'population_served' => $this->population_served,
            'connections' => [
                'total' => $this->connections_total,
                'active' => $this->connections_active,
            ],
            'capacity_m3d' => $this->design_capacity_m3d,
            'assets_count' => $this->assets_count,
            'dmas' => DmaResource::collection($this->whenLoaded('dmas')),
            'geom' => $this->geom?->toJson(),
            'created_at' => $this->created_at,
        ];
    }
}
```

---

### 6. BUSINESS LOGIC SERVICES — 6+ REQUIRED

**Missing Service Classes:**

```
✗ TelemetryIngestService.php          // Ingest & validate SCADA data
✗ TopologyTraceService.php            // BFS/DFS network tracing
✗ NrwCalculationService.php           // NRW metrics & anomaly detection
✗ DosageCalculationService.php        // Flow-to-dosage converter
✗ OutageStateService.php              // Workflow enforcement
✗ ScheduleOptimizationService.php     // Pump scheduling solver
```

**Example TelemetryIngestService:**

```php
class TelemetryIngestService {
    public function ingest(array $measurements): array {
        $results = [];
        foreach ($measurements as $m) {
            $tag = TelemetryTag::find($m['tag_id']);
            
            // Validate against thresholds
            if ($tag->thresholds) {
                $this->checkThresholds($m['value'], $tag->thresholds);
            }
            
            TelemetryMeasurement::create([
                'telemetry_tag_id' => $m['tag_id'],
                'ts' => $m['ts'],
                'value' => $m['value'],
                'meta' => $m['meta'] ?? []
            ]);
            $results[] = ['status' => 'ok', 'tag_id' => $m['tag_id']];
        }
        return $results;
    }
}
```

---

### 7. POLICIES & RBAC — 8+ POLICY CLASSES

**Missing Policy Classes:**

```
✗ SchemePolicy.php      // view, create, update, delete
✗ AssetPolicy.php       // asset CRUD
✗ OutagePolicy.php      // approval workflow
✗ DosePlanPolicy.php    // dosing management
✗ TelemetryPolicy.php   // data access
✗ OperationsPolicy.php  // console access
✗ NrwPolicy.php         // data access
✗ SchedulePolicy.php    // schedule management
```

**Example Policy:**

```php
class SchemePolicy {
    public function viewAny(User $user): bool {
        return $user->can('core_ops.view');
    }
    
    public function create(User $user): bool {
        return $user->hasAnyRole(['engineer', 'planner', 'admin']);
    }
    
    public function update(User $user, Scheme $scheme): bool {
        return $user->hasAnyRole(['engineer', 'planner', 'admin']);
    }
    
    public function approve(User $user, Scheme $scheme): bool {
        return $user->hasRole('admin');
    }
}
```

---

### 8. FRONTEND PAGES — 12+ REACT PAGES

**Missing React Pages:**

```
✗ /core-ops/schemes              // Scheme registry & map
✗ /core-ops/scheme/{id}/detail   // Scheme detail with DMA list
✗ /core-ops/assets               // Asset inventory
✗ /core-ops/topology             // Network graph viewer
✗ /core-ops/telemetry            // SCADA dashboard & charts
✗ /core-ops/console              // Operations console (KPIs + alarms)
✗ /core-ops/nrw                  // NRW tracking & interventions
✗ /core-ops/outages              // Outage planning & management
✗ /core-ops/dosing               // Dosing plans & chemical stocks
✗ /core-ops/schedules            // Pump schedule viewer
✗ /core-ops/meters               // Meter management
✗ /core-ops/pressure-leaks       // Leak/pressure reports
```

**Page Complexity Estimates:**

| Page | Components | State | Features | Est. LOC |
|------|-----------|-------|----------|---------|
| Schemes | 8 | 5 | CRUD, map, filters | 400 |
| Topology | 6 | 4 | Graph, zoom, trace | 350 |
| Telemetry | 10 | 8 | Charts, trends, alarms | 550 |
| Operations Console | 12 | 10 | Gauges, KPIs, live data | 650 |
| Outages | 8 | 6 | Timeline, workflow, statuses | 450 |
| Dosing | 8 | 6 | Plans, graphs, logs | 400 |
| NRW | 7 | 5 | Snapshots, trends, interventions | 380 |

**Total Frontend LOC:** 3,180+ lines

---

### 9. DATABASE MIGRATIONS

**Missing Migrations:** 12

1. `2025_01_xx_000001_create_schemes_table.php`
2. `2025_01_xx_000002_create_dmas_table.php`
3. `2025_01_xx_000003_create_network_nodes_edges.php`
4. `2025_01_xx_000010_create_asset_types_and_assets.php`
5. `2025_01_xx_000020_create_telemetry_tables.php`
6. `2025_01_xx_000030_create_nrw_and_interventions.php`
7. `2025_01_xx_000040_create_outages.php`
8. `2025_01_xx_000050_create_dosing_and_chemicals.php`
9. `2025_01_xx_000060_create_pump_scheduling.php`
10. `2025_01_xx_000070_create_meters.php`
11. `2025_01_xx_000080_create_leak_pressure_reports.php`
12. `2025_01_xx_000090_alter_for_postgis.php` (create indices, enable PostGIS functions)

---

### 10. PACKAGE DEPENDENCIES

**Required Packages (Laravel):**

| Package | Purpose | Status |
|---------|---------|--------|
| `phaza/laravel-postgis` | PostGIS support | ✅ In schema (needed for Laravel API) |
| `spatie/laravel-permission` | RBAC | ✅ Already installed |
| `laravel/scout` | Full-text search | ⚠️ Optional |
| `meilisearch/meilisearch-php` | Search engine | ⚠️ Optional |
| `laravel/horizon` | Queue dashboard | ✅ Useful for telemetry ingest |

**React Components (already available in project):**
- MapLibre GL (for topology visualization) ✅
- Recharts (for telemetry trends) ✅
- Leaflet (alternative to MapLibre) ✅
- TanStack Query (data fetching) ✅

---

## IMPLEMENTATION ROADMAP

### PHASE 1: FOUNDATION (Weeks 1-2) — 80 hours

**Sprint 1.1: Database Schema & Models**
- [ ] Create 12 database migrations
- [ ] Define 18 Eloquent models with PostGIS traits
- [ ] Set up model relationships & casts
- [ ] Create 10 seeders with sample data
- **Deliverable:** Runnable `php artisan migrate:fresh --seed`
- **Hours:** 20

**Sprint 1.2: Core API Layer**
- [ ] Implement 5 base controllers (Scheme, Dma, Asset, Topology, Telemetry)
- [ ] Create 15 form request classes
- [ ] Create 12 resource classes
- [ ] Set up routing with auth middleware
- **Deliverable:** All CRUD endpoints working
- **Hours:** 20

**Sprint 1.3: Business Logic Services**
- [ ] TelemetryIngestService (validation, threshold checking)
- [ ] TopologyTraceService (BFS/DFS network traversal)
- [ ] NrwCalculationService (water balance metrics)
- [ ] OutageStateService (workflow enforcement)
- **Deliverable:** Core services with unit tests
- **Hours:** 20

**Sprint 1.4: Frontend Foundation**
- [ ] Scheme registry page with map
- [ ] Asset inventory page with filters
- [ ] Network topology viewer (graph visualization)
- [ ] Sidebar integration for CoreOps module
- **Deliverable:** 4 main pages rendering
- **Hours:** 20

### PHASE 2: OPERATIONAL FEATURES (Weeks 3-4) — 80 hours

**Sprint 2.1: Telemetry & Monitoring**
- [ ] Telemetry dashboard with real-time charts
- [ ] SCADA tag management UI
- [ ] Threshold configuration interface
- [ ] Alarm & notification system (integration with Workflows)
- **Deliverable:** Live SCADA data visualization
- **Hours:** 25

**Sprint 2.2: Operations Console**
- [ ] Real-time KPI dashboard (flow, pressure, tank levels)
- [ ] Alarm display & acknowledgment
- [ ] Live alert notifications
- [ ] Console configuration (gauge ranges, thresholds)
- **Deliverable:** Operational dashboard
- **Hours:** 25

**Sprint 2.3: Outage & Maintenance**
- [ ] Outage planner with calendar
- [ ] Approval workflow UI (draft → approved → live)
- [ ] Rotational supply scheduling
- [ ] Outage impact analysis
- **Deliverable:** Complete outage management
- **Hours:** 20

**Sprint 2.4: Dosing Control**
- [ ] Dose plan CRUD interface
- [ ] Flow-band configuration
- [ ] Chemical stock tracking
- [ ] Dose change logging & audit trail
- **Deliverable:** Automated dosing management
- **Hours:** 10

### PHASE 3: ADVANCED ANALYTICS (Weeks 5-6) — 60 hours

**Sprint 3.1: NRW Management**
- [ ] NRW snapshot collection interface
- [ ] Water balance charts (stacked area)
- [ ] Intervention tracking & ROI
- [ ] Anomaly detection alerts
- **Deliverable:** NRW monitoring dashboard
- **Hours:** 20

**Sprint 3.2: Pump Scheduling**
- [ ] Pump schedule editor (Gantt chart)
- [ ] Constraint solver integration
- [ ] Tariff band automation
- [ ] Run-hour optimization
- **Deliverable:** Scheduling optimization
- **Hours:** 20

**Sprint 3.3: Meter Management**
- [ ] Meter CRUD & calibration tracking
- [ ] Meter reading collection
- [ ] Accuracy audit reports
- **Deliverable:** Meter lifecycle management
- **Hours:** 10

**Sprint 3.4: Pressure & Leak Detection**
- [ ] Pressure profile monitoring
- [ ] Leak hotspot mapping
- [ ] Compliance reporting (DWQR/WASREB)
- **Deliverable:** Pressure/leak analytics
- **Hours:** 10

### PHASE 4: INTEGRATION & POLISH (Week 7) — 40 hours

- [ ] Workflows engine integration (outage approvals, alarms)
- [ ] RBAC policy enforcement across all endpoints
- [ ] Multi-tenancy validation for all queries
- [ ] Error handling & graceful degradation
- [ ] Performance optimization (query caching, indices)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Frontend accessibility audit
- [ ] Security testing (SQL injection, CSRF, etc.)

---

## PRIORITY TIERS

### 🔴 CRITICAL (Must-Have for MVP)
1. Schemes & DMAs (network foundation)
2. Assets & Asset Types (inventory system)
3. Scheme Registry page + map
4. Asset list & detail pages
5. Basic CRUD API endpoints

### 🟠 HIGH (Required for v1.0)
6. Telemetry/SCADA integration
7. Operations Console
8. NRW tracking
9. Outage planner
10. Dosing control

### 🟡 MEDIUM (Phase 2)
11. Pump scheduling
12. Meter management
13. Pressure/leak reports
14. Advanced analytics dashboards

### 🟢 LOW (Phase 3+)
15. ML-based anomaly detection
16. Predictive maintenance
17. Advanced optimization

---

## ESTIMATED EFFORT

| Component | Estimate | Priority |
|-----------|----------|----------|
| **Database** | 15 hours | Critical |
| **Models & Migrations** | 20 hours | Critical |
| **API Controllers** | 25 hours | Critical |
| **Form Requests** | 15 hours | High |
| **Services Layer** | 30 hours | High |
| **Frontend Pages** | 80 hours | High |
| **Telemetry Integration** | 25 hours | High |
| **Testing & Docs** | 40 hours | Medium |
| **RBAC & Security** | 20 hours | High |
| **Performance Optimization** | 20 hours | Medium |
| **DevOps / Deployment** | 15 hours | Low |
| **Total** | **305 hours** | **8-10 weeks** |

---

## CURRENT PROJECT STATE vs. SPEC

### What EXISTS (14 tables):
- ✅ Workflows Engine (8 tables)
- ✅ Groundwater/Aquifer Management (6 tables)

### What's MISSING (20+ tables):
- ❌ Schemes (1)
- ❌ DMAs (1)
- ❌ Network Topology (2)
- ❌ Assets & Asset Types (2)
- ❌ Telemetry (2)
- ❌ NRW (2)
- ❌ Outages (2)
- ❌ Dosing (3)
- ❌ Scheduling (1)
- ❌ Meters (1)
- ❌ Leak/Pressure (1)

**Gap:** 100% of Core Registry features

---

## RISK ASSESSMENT

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| PostGIS complexity | High | Medium | Use phaza/laravel-postgis wrapper, study topology patterns |
| Telemetry volume | High | Medium | Use TimescaleDB, batch ingestion, async jobs |
| Real-time updates | Medium | Medium | WebSocket/Horizon for live dashboard updates |
| Network topology performance | High | Medium | Pre-compute paths, cache topology |
| Multi-tenancy isolation | High | Low | Always use tenant_id in queries, policy checks |
| RBAC complexity | Medium | Medium | Use Spatie policies, test all permission scenarios |

---

## NEXT STEPS

1. **Week 1:** Create database schema (migrations & models)
2. **Week 2:** Build API layer (controllers, requests, resources)
3. **Week 3:** Implement frontend pages (Scheme, Assets, Topology)
4. **Week 4:** Add Telemetry & Operations Console
5. **Week 5:** Complete outage & dosing features
6. **Week 6:** Add NRW, scheduling, meters
7. **Week 7:** Testing, optimization, documentation

---

## QUESTIONS FOR STAKEHOLDERS

1. **PostGIS Support:** Should the Node.js layer use Drizzle PostGIS support, or keep spatial data in Laravel-only?
2. **Telemetry Ingestion:** What's the expected measurement frequency? (1/min, 1/sec, real-time streaming?)
3. **TimescaleDB:** Should we use TimescaleDB for time-series optimization or stick with standard PostgreSQL?
4. **Real-time Updates:** Do we need WebSocket/SSE for live telemetry dashboard or polling is fine?
5. **Mobile:** Will field operators need mobile app for outage management?
6. **Integration:** Should Core Registry integrate with Workflows Engine for approval flows?

---

## CONCLUSION

The Core Service & Network Operations module is a **critical infrastructure management system** that requires substantial implementation effort (305+ hours). Currently, **zero code exists** — this is a complete greenfield build. 

**Recommended Approach:**
1. Start with Schemes & Assets (foundational)
2. Build basic API & frontend
3. Gradually add operational features (telemetry, console, outages)
4. Polish with analytics & optimization

**Timeline:** 8-10 weeks for complete implementation with 1 FTE developer

---

**Document Version:** 1.0  
**Last Updated:** November 23, 2025  
**Next Review:** After Phase 1 completion

