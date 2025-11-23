# Core Operations Module - Gap Analysis
## Operations Logbook & Events vs Prompt Requirements

**Analysis Date:** November 23, 2025  
**Current Status:** 40% Implementation  
**Target:** 100% Production-Ready Implementation

---

## Executive Summary

The Core Operations module has a **solid foundation** with data models, basic APIs, and console UI, but is missing **critical operational features** needed for production use. The gap is primarily in:
- Event ingestion diversity (only generic endpoint exists)
- Correlation/deduplication logic
- SLA tracking & escalation automation
- Shift management completeness
- Checklist/Playbook execution UI
- Mobile offline support
- Comprehensive testing & observability

---

## 1. DATA MODEL & DATABASE (90% Complete)

### ✅ IMPLEMENTED
- **Shifts table** with tenant scoping, facility/scheme/DMA associations, supervisor
- **ShiftEntry table** with kind enum (note/reading/checklist/handover), text, tags, geom point, attachments
- **Event table** with source enum (scada/ami/nrw/energy/manual/webhook), severity, status, location (PostGIS Point), correlation_key, sla_due_at
- **EventAction table** for audit trail
- **EventLink table** for linking to Work Orders/anomalies
- **Playbook table** with steps jsonb
- **Checklist & ChecklistRun tables**
- **Alarm table** (minimal - from CMMS)
- **AuditEvent table** for logging

### ⚠️ MISSING / INCOMPLETE
1. **EscalationPolicy table**
   - Status: NOT CREATED
   - Needed for: Time-based escalation rules, on-call targeting
   - Prompt requirement: Escalation policies with rules jsonb
   
2. **Notification table**
   - Status: PARTIAL (exists but not fully wired)
   - Missing: Channel enum (email/sms/webhook/push), status tracking, sent_at, meta
   - Needed for: Multi-channel notification delivery

3. **Database Indexes**
   - Status: PARTIAL
   - Missing indexes on: (status, severity, detected_at DESC), partial index for open events
   - Performance impact: Could be slow with large event volumes

4. **Spatial Geometry**
   - Status: ✅ Event.location uses PostGIS Point(4326)
   - Missing: ShiftEntry.geom not being used in queries

5. **Multi-tenancy scoping**
   - Status: ✅ Global scopes implemented
   - Verified in: Event, Shift models with tenant_id checks

---

## 2. EVENT INGESTION & CORRELATION (35% Complete)

### ✅ IMPLEMENTED
- Generic event ingest endpoint: `POST /api/events/ingest`
- Basic validation (source, severity, category)
- Event storage with external_id tracking

### ⚠️ MISSING
1. **Specialized Ingestion Endpoints** (Prompt requires all 3)
   - `POST /api/events/ingest/scada` — NOT CREATED
   - `POST /api/events/ingest/ami` — NOT CREATED
   - `POST /api/events/ingest/webhook` — Generic handler exists but no specific implementation
   - Impact: Cannot ingest SCADA/AMI-specific payloads with proper schema validation

2. **Correlation & Deduplication** (CRITICAL)
   - Status: NOT IMPLEMENTED
   - Requirement: correlation_key (facility+category+time window), merge duplicates, extend SLA
   - Missing: EventService doesn't have correlation logic
   - Code location needed: `api/app/Services/Operations/EventService.php` needs `correlateEvents()` method

3. **External ID Uniqueness Constraint**
   - Status: Database schema has unique (source, external_id) but not enforced in code
   - Missing: Deduplication logic in ingest handler

4. **Event Lifecycle Management**
   - Status: PARTIAL
   - Implemented: acknowledge, resolve endpoints
   - Missing: Full state machine (new→ack→in_progress→resolved→closed)
   - Current transitions: Direct from new to ack/resolved (no in_progress state transitions)

---

## 3. BACKEND APIS (60% Complete)

### ✅ IMPLEMENTED
```
Shifts:
✅ GET    /api/v1/shifts
✅ POST   /api/v1/shifts
✅ GET    /api/v1/shifts/{id}
✅ POST   /api/v1/shifts/{id}/close
✅ POST   /api/v1/shifts/{id}/entries (addEntry method exists)

Events:
✅ GET    /api/v1/events (with filters: status, severity, source, category, facility_id, bbox)
✅ POST   /api/v1/events/ingest
✅ GET    /api/v1/events/{id}
✅ POST   /api/v1/events/{id}/acknowledge
✅ POST   /api/v1/events/{id}/resolve
✅ POST   /api/v1/events/{id}/link
```

### ⚠️ MISSING
1. **Shift Entry Management**
   - Missing: `GET /api/v1/shifts/{id}/entries` (list endpoint)
   - Existing: addEntry works but needs retrieve endpoints
   - Impact: Frontend can't fetch shift entries for display

2. **Shift Handover & Closing**
   - Status: Close endpoint exists but lacks handover logic
   - Missing: Handover notes, checklist verification before close
   - Missing: PDF export for handover reports
   - Code location: ShiftController.close() needs enhancement

3. **Playbook Endpoints**
   - Status: Controllers exist but routes may not be registered
   - Required endpoints:
     ```
     GET    /api/v1/playbooks
     POST   /api/v1/playbooks
     PATCH  /api/v1/playbooks/{id}
     DELETE /api/v1/playbooks/{id}
     POST   /api/v1/playbooks/{id}/execute (not in prompt but logical)
     ```

4. **Checklist Endpoints**
   - Status: Controllers exist but incomplete
   - Missing:
     ```
     GET    /api/v1/checklists
     POST   /api/v1/checklists
     GET    /api/v1/checklists/{id}
     POST   /api/v1/checklists/{id}/run
     GET    /api/v1/checklist-runs/{id} (get run results)
     ```

5. **Escalation Policy Endpoints** (NOT IMPLEMENTED)
   ```
   GET    /api/v1/escalation-policies
   POST   /api/v1/escalation-policies
   PATCH  /api/v1/escalation-policies/{id}
   DELETE /api/v1/escalation-policies/{id}
   ```

6. **Notification Endpoints** (NOT IMPLEMENTED)
   ```
   GET    /api/v1/notifications?status=queued
   PATCH  /api/v1/notifications/{id}/resend
   ```

7. **Spatial/Bbox Filters**
   - Status: ✅ Implemented in Event index with ST_Within
   - Working: `?bbox=minX,minY,maxX,maxY` filters events in bounding box

---

## 4. SERVICES & BUSINESS LOGIC (45% Complete)

### ✅ IMPLEMENTED
- **ShiftService**: getActiveShift, getShiftHistory, createShift, closeShift, addEntry
- **EventService**: ingestEvent, acknowledgeEvent, resolveEvent, linkEvent, getEventsByBbox
- **PlaybookService**: exists but minimal implementation
- **ChecklistService**: exists but minimal implementation

### ⚠️ MISSING / INCOMPLETE

1. **EventService Enhancements** (CRITICAL)
   ```php
   // Missing methods:
   - correlateEvents() // Dedup on correlation_key
   - extractCorrelationKey() // facility+category+time_window
   - mergeEvents() // Combine duplicate events
   - checkAndEscalate() // SLA tracking
   - getEventsByCategory()
   - getEventsBySeverity()
   ```

2. **NotificationService** (NOT IMPLEMENTED)
   - Status: No service file exists
   - Required: Send via email/SMS/webhook/push
   - Integration: Should queue NotifyJob for async delivery

3. **PlaybookService** (Minimal - 10% Complete)
   - Status: Service exists but mostly empty
   - Missing:
     ```php
     - executePlaybook($event)
     - applyPlaybookForCategory($category, $severity)
     - parseSteps($steps_jsonb)
     - handleNotificationStep()
     - handleCreateWorkOrder()
     - handleRequestFieldVerify()
     ```

4. **SLA Management** (NOT IMPLEMENTED)
   - Missing: calculateSlaWindow() - should set sla_due_at based on severity
   - Missing: Job to check SLA breaches and escalate
   - Business rule: SLA depends on severity & facility
     - Critical: 15 minutes
     - High: 1 hour
     - Medium: 4 hours
     - Low: 24 hours

5. **ChecklistService** (Minimal - 20% Complete)
   - Missing:
     ```php
     - runChecklist()
     - scoreChecklist()
     - validateRunData()
     - getComplianceRate()
     ```

6. **ShiftService Enhancements**
   - Missing:
     ```php
     - generateHandoverReport() // PDF export
     - validateShiftClosure() // Ensure required entries
     - getShiftByDate() // For daily operations
     ```

---

## 5. JOBS & QUEUE PROCESSING (0% Complete)

### ❌ NOT IMPLEMENTED

1. **IngestEventJob**
   - Purpose: Async processing of event ingestion
   - Missing: Correlation, SLA calculation, playbook trigger
   - Location needed: `api/app/Jobs/Operations/IngestEventJob.php`

2. **EscalateEventJob** (CRITICAL)
   - Purpose: Monitor SLA_due_at and trigger escalations
   - Missing: Scheduler to run this job periodically
   - Logic needed:
     ```php
     - Check open events where sla_due_at <= now
     - Execute escalation_policy rules
     - Trigger notifications
     - Create alerts
     ```

3. **ApplyPlaybookJob**
   - Purpose: Execute playbook steps when event created/acknowledged
   - Missing: Queue handler, step execution logic

4. **NotifyJob**
   - Purpose: Send notifications async
   - Missing: Multi-channel support (email, SMS, webhook)

5. **ChecklistRunJob**
   - Purpose: Track checklist completion and scoring

---

## 6. FRONTEND REACT PAGES (30% Complete)

### ✅ IMPLEMENTED
1. **OperationsConsole.tsx** (70% complete)
   - ✅ Real-time SSE connection for live alarms
   - ✅ Dashboard with metrics, outages, dosing, scheduling
   - ✅ Live alarm feed with severity color coding
   - ⚠️ Missing: Map overlay for events, event list table, details drawer

2. **TopologyViewer.tsx** (Placeholder)
3. **TelemetryDashboard.tsx** (Placeholder)
4. **OutagePlanner.tsx** (Placeholder)
5. **NRWDashboard.tsx** (Placeholder)
6. **DosingControl.tsx** (Placeholder)
7. **PumpScheduling.tsx** (Placeholder)
8. **PressureLeakPage.tsx** (Placeholder)

### ❌ MISSING CRITICAL PAGES

1. **Shift Management** (`/ops/shifts`)
   - Status: NOT CREATED
   - Required screens:
     - Active shifts list with supervisor
     - Create new shift form
     - Shift details with entry timeline
     - Handover checklist UI
     - Shift close form
     - PDF export button
   - Components needed:
     ```tsx
     ShiftsList
     ShiftForm
     ShiftDetails
     ShiftTimeline
     HandoverReport
     ```

2. **Shift Log Entries** (Sub-page of Shift Details)
   - Status: NOT CREATED
   - Features:
     - Rich text editor for notes
     - Reading data entry (sensor readings, meter readings)
     - Checklist runs display
     - Handover notes
     - File upload for attachments
     - Tag chips (equipment, location)
     - Timestamp & geolocation

3. **Events Console** (`/ops/events`)
   - Status: MISSING (only OperationsConsole partial)
   - Required:
     - Event list with infinite scroll or pagination
     - Filters: status, severity, source, time range, facility, bbox
     - Event details drawer with:
       - Timeline of actions
       - Current status & severity
       - Location map pin
       - Related work orders
       - Linked anomalies
     - Bulk actions: acknowledge, assign, escalate
     - Create event button

4. **Checklists UI** (`/ops/checklists`)
   - Status: NOT CREATED
   - Required screens:
     - Checklist builder (JSON Schema visual editor)
     - Frequency selector (hourly/daily/weekly/custom)
     - Run history with scoring
     - Photos & geotag evidence
     - Pass/fail/NA options
     - Compliance dashboard

5. **Playbooks UI** (`/ops/playbooks`)
   - Status: NOT CREATED
   - Required screens:
     - Playbook editor with step builder
     - Step types: notify, create WO, add checklist, webhook, wait, branch
     - Condition builder for branching
     - Preview/test button
     - Category & severity targeting

6. **Events Map Overlay**
   - Status: MISSING from OperationsConsole
   - Required:
     - MapLibre GL integration
     - Event pins with severity symbology
     - Click to show event details
     - Bbox filtering

---

## 7. MOBILE (React Native) - 0% Complete

### ❌ NOT IMPLEMENTED
- My Shifts screen
- Log entry creation (offline)
- Checklist run (offline)
- Event viewer near me
- Photo capture for evidence
- QR code scanner for assets
- Sync queue for offline changes
- Conflict resolution

---

## 8. TESTING & CI (0% Complete)

### ❌ NOT IMPLEMENTED
1. **Feature Tests**
   ```php
   - EventIngestTest: dedup, correlation
   - ShiftClosureTest: handover verification
   - ChecklistScoringTest: scoring logic
   - PlaybookExecutionTest: step execution
   - SLAEscalationTest: timer & escalation
   ```

2. **E2E Tests (Playwright)**
   - Operations console interactions
   - Event acknowledgment flow
   - Shift lifecycle
   - Playbook execution

3. **CI Pipeline**
   - GitHub Actions for Laravel tests
   - Vite build test
   - Database migration validation
   - Performance tests

---

## 9. OBSERVABILITY & MONITORING (0% Complete)

### ❌ NOT IMPLEMENTED
1. **OpenTelemetry Spans**
   - Event ingestion spans
   - Correlation spans
   - Escalation spans
   - SLA timer spans

2. **Distributed Tracing**
   - Track event lifecycle across services
   - Correlate with user actions

---

## 10. SEEDING DATA (0% Complete)

### ❌ NOT IMPLEMENTED

Should create:
- 6 facilities with pump stations, treatment plants, reservoirs
- 10 shifts (5 active, 5 closed) per facility
- Hourly checklists for pump stations
- 200 events over 30 days (SCADA, AMI, manual)
- 5 playbooks for different event categories
- Escalation policies with on-call rotation
- Sample notifications (via Mailpit)

Location needed: `api/database/seeders/OperationsSeeder.php`

---

## 11. DOCUMENTATION (0% Complete)

### ❌ NOT IMPLEMENTED
- OpenAPI/Swagger spec for all endpoints
- Postman collection
- Architecture diagrams
- Runbook/Playbook templates
- SLA policies documentation

---

## 12. API ROUTES & REGISTRATIONS (60% Complete)

### ✅ REGISTERED (in api/routes/api.php)
```php
Route::prefix('events')->group(...)  // ✅ Registered
Route::prefix('shifts')->group(...)  // ✅ Registered
```

### ⚠️ MISSING REGISTRATIONS
```php
Route::prefix('checklists')->group(...)        // ❌ Not found
Route::prefix('playbooks')->group(...)         // ❌ Not found
Route::prefix('escalation-policies')->group... // ❌ Not found
Route::prefix('notifications')->group(...)     // ❌ Not found
```

---

## Priority Fix List (for MVP Readiness)

### **P0 - Critical (Blocks Operations)**
1. ✅ Event Correlation & Deduplication (EventService.correlateEvents)
2. ✅ SLA Tracking & Escalation Job (EscalateEventJob)
3. ✅ Shift Entries List API (GET /api/v1/shifts/{id}/entries)
4. ✅ Events Console Page (React) with map overlay
5. ✅ Playbook Execution Service (ApplyPlaybookJob)

### **P1 - High (For Operational Use)**
1. Specialized ingestion endpoints (SCADA, AMI)
2. Shift Handover & PDF export
3. Checklists builder & run UI
4. Playbooks editor UI
5. NotificationService & NotifyJob
6. EscalationPolicy model & service

### **P2 - Medium (Polish)**
1. Mobile offline shift/log support
2. Database indexes for performance
3. Seeding data
4. Tests & CI pipelines
5. OpenTelemetry instrumentation

### **P3 - Nice-to-Have**
1. OpenAPI/Postman docs
2. Advanced reporting (MTTA/MTTR)
3. Real-time WebSocket for events (vs SSE)

---

## Estimated Effort

| Component | Current | Target | Effort | Timeline |
|-----------|---------|--------|--------|----------|
| Models/DB | 90% | 100% | 2 hrs | Quick |
| APIs | 60% | 100% | 4 hrs | Medium |
| Services | 45% | 100% | 6 hrs | Medium |
| Jobs | 0% | 100% | 3 hrs | Medium |
| Frontend | 30% | 100% | 8 hrs | High |
| Mobile | 0% | 50% | 6 hrs | High |
| Testing | 0% | 80% | 4 hrs | Medium |
| Docs | 0% | 100% | 2 hrs | Quick |
| **TOTAL** | **33%** | **100%** | **35 hrs** | **1-2 weeks** |

---

## Recommendations

1. **Immediate (Today):**
   - Create EscalationPolicy model & migration
   - Implement EventService.correlateEvents()
   - Build EscalateEventJob for SLA tracking
   - Add missing API routes

2. **This Week:**
   - Create React components for Shifts, Events, Checklists, Playbooks
   - Implement specialized ingestion endpoints
   - Implement Playbook execution service
   - Add basic seeding data

3. **Next Week:**
   - Mobile offline functionality
   - Testing & CI pipeline
   - OpenAPI documentation
   - Performance optimization

---

## Files to Create

```
Backend:
✅ api/app/Models/EscalationPolicy.php
✅ api/app/Models/Notification.php (enhance)
✅ api/database/migrations/xxxx_create_escalation_policies_table.php
✅ api/database/migrations/xxxx_enhance_notifications_table.php
✅ api/app/Services/Operations/NotificationService.php
✅ api/app/Jobs/Operations/IngestEventJob.php
✅ api/app/Jobs/Operations/EscalateEventJob.php
✅ api/app/Jobs/Operations/ApplyPlaybookJob.php
✅ api/database/seeders/OperationsSeeder.php

Frontend:
✅ client/src/pages/core-ops/ShiftsPage.tsx
✅ client/src/pages/core-ops/EventsPage.tsx
✅ client/src/pages/core-ops/ChecklistsPage.tsx
✅ client/src/pages/core-ops/PlaybooksPage.tsx
✅ client/src/components/core-ops/ShiftsList.tsx
✅ client/src/components/core-ops/ShiftForm.tsx
✅ client/src/components/core-ops/EventsList.tsx
✅ client/src/components/core-ops/EventDetails.tsx
✅ client/src/components/core-ops/ChecklistBuilder.tsx
✅ client/src/components/core-ops/PlaybookEditor.tsx

Tests:
✅ api/tests/Feature/Operations/EventIngestTest.php
✅ api/tests/Feature/Operations/ShiftClosureTest.php
✅ tests/e2e/operations-console.spec.ts
```

---

## Conclusion

The Core Operations module has solid **foundations** but needs **substantial work** on event correlation, SLA automation, shift lifecycle, UI components, and testing before it's production-ready. The main gaps are in the **service layer** (correlation, escalation) and **frontend** (event/shift/checklist/playbook pages). With focused effort, MVP-ready in 1 week, production-ready in 2 weeks.
