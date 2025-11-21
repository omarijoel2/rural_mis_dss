# Overview

This project is a hybrid monorepo containing two applications: **EcoVillage** (an inactive sustainability education game) and **Rural Water Supply MIS**. The primary focus is the **Rural Water Supply MIS**, a Laravel-based Management Information System designed for rural water infrastructure. Its core mission is to enhance operational efficiency, ensure revenue assurance, and improve customer relationship management for water utilities through multi-tenancy, spatial data, and robust security features.

## Recent Updates (Nov 21, 2025 - Session 3)

### Decision Support & Advanced Analytics Module - PRODUCTION SCAFFOLDING COMPLETED ✅

**Frontend Pages (7 pages - Production Hardened):**
- ✅ **Forecast Studio**: ML-powered time-series forecasting with comprehensive defensive rendering
- ✅ **Scenario Workbench**: Stress testing and resilience planning with loading/error states
- ✅ **Optimization Console**: Multi-resource optimization with null guards throughout
- ✅ **Anomalies Inbox**: ML-based anomaly detection with proper error handling
- ✅ **Aquifer Dashboard**: Hydrogeological analytics with defensive rendering
- ✅ **Tariff Sandbox**: Revenue modeling with comprehensive error states
- ✅ **EWS Console**: Early warning system with loading states and null guards

**Production Hardening COMPLETED:**
- ✅ Added comprehensive defensive rendering (loading/error states, null guards) to ALL 7 DSA pages
- ✅ Marked all demonstration chart data with clear "DEMO DATA" comments
- ✅ Extracted isLoading and error from ALL useQuery hooks
- ✅ Proper null guards for all data access throughout

**Backend API Controllers COMPLETED (7 controllers):**
- ✅ **ForecastController**: GET/POST /forecast, GET /forecast/:id with tenant-scoped queries
- ✅ **ScenarioController**: GET/POST /scenarios, POST /scenarios/:id/run (critical params bug FIXED)
- ✅ **OptimizationController**: GET /optimize, POST /optimize/:type, POST /optimize/:id/publish
- ✅ **AnomalyController**: GET /anomalies (filterable), POST /anomalies/bulk-update, POST /anomalies/:id/create-work-order
- ✅ **HydroController**: GET /hydro/aquifers, GET /hydro/wellfield
- ✅ **TariffController**: GET/POST /tariffs with block tariff validation
- ✅ **EWSController**: GET/POST /ews/rules, GET /ews/alerts, POST /ews/alerts/:id/acknowledge

**Security & Architecture:**
- ✅ All routes protected with auth:sanctum middleware
- ✅ Permission-based authorization on all endpoints
- ✅ Tenant isolation enforced in all queries
- ✅ Comprehensive input validation with Laravel validation rules
- ✅ JSON encoding/decoding for metadata fields
- ✅ UUID primary keys throughout

**Critical Bug Fixes:**
- ✅ **ScenarioController params spread operator bug**: Changed from `...$validated['params'] ?? []` to `array_merge()` pattern
- ✅ All backend service fixes from earlier session (Telemetry, NRW, Pump, KPIs, Outage)

**Database Schema:**
- ✅ Created comprehensive migrations for forecast_jobs, scenarios, optim_runs, anomalies, hydro_kpis, tariff_scenarios, ews_rules, alerts tables

**Documentation:**
- ✅ Updated comprehensive integration guide: `client/src/pages/dsa/README_DSA_INTEGRATION.md`
- ✅ Documented all API endpoints with cURL examples
- ✅ Added testing checklist and migration path
- ✅ Clear separation of completed work vs. Phase 2 requirements

**Architect Review:**
- ✅ Comprehensive review completed
- ✅ Critical ScenarioController bug identified and fixed
- ✅ Security verification passed (no SQL injection, proper tenant isolation)
- ✅ All structural patterns align with existing MIS modules

**Queue Processing & Notifications Infrastructure - COMPLETED ✅**
- ✅ **Laravel Horizon**: Installed and configured for queue processing (v5.40.0)
- ✅ **Redis Queue Connection**: Configured QUEUE_CONNECTION=redis with Predis client
- ✅ **Priority Queues**: notifications → high → default → dsa-forecasts → dsa-scenarios → dsa-optimization → dsa-anomalies
- ✅ **Production Config**: maxProcesses=10, tries=3, timeout=300s
- ✅ **Multi-Channel Notifications**: EWSAlertNotification with email, SMS (Twilio), webhook support
- ✅ **Custom WebhookChannel**: HTTP POST with retries (3x), 10s timeout, comprehensive error logging
- ✅ **Twilio Integration**: Installed laravel-notification-channels/twilio package
- ✅ **Async Delivery**: All notifications queued (ShouldQueue) for non-blocking performance

**Replit Integrations Available:**
- 🔌 SendGrid (email): connector:ccfg_sendgrid_01K69QKAPBPJ4SWD8GQHGY03D5 (ready to setup)
- 🔌 Twilio (SMS): connector:ccfg_twilio_01K69QJTED9YTJFE2SJ7E4SY08 (ready to setup)

**Next Steps (Phase 2):**
- ⏳ Run database migrations: `php artisan migrate`
- ⏳ Test all API endpoints manually
- ⏳ Create DSA permissions in database
- ⏳ Set up SendGrid/Twilio credentials via Replit integrations
- ⏳ Start Horizon: `php artisan horizon` (or use Supervisor for production)
- ⏳ ML engine development (Python microservices for forecasting, simulation, optimization, anomaly detection)

## Recent Updates (Nov 21, 2025 - Session 2)

### CRM Enhancements - COMPLETED
- ✅ **Complaints Tab & Page**: Full CRUD with list/Kanban views, filtering, SLA tracking, and quick actions
- ✅ **Consumption Chart**: 12-month trend visualization with average, trend indicators, and trend analysis
- ✅ **Notes Feature**: Backend (Laravel model/controller/routes) + frontend (create/edit/delete) - migration ready
- ✅ **Interactions Page**: Log and track customer interactions across 6 channels with statistics and filtering
- ✅ **Segmentation Builder**: Dynamic customer segmentation with filtering, CSV export, and sample display
- ✅ **Move-In/Move-Out**: Modal dialogs for account lifecycle management with date, meter readings, and status

### Maintenance Module - Gaps Fixed
- ✅ **Gap 1 - Database Blocker FIXED**: Changed `gl_account_id` from UUID to bigInt in capitalization_entries
- ✅ **Gap 2 - Predictive Rules Engine**: New PredictiveMaintenanceService with health scoring and RUL estimation
- ✅ **Gap 3 - Calendar/Gantt View**: New CalendarPage with monthly grid, priority filtering, and summary cards
- ✅ **Gap 4 - Job Plan Step Tracking**: New migration with job_plan_steps, step executions, and attachments tables
- ✅ **Gap 5 - Automation Scheduler**: Created GeneratePreventiveMaintenance and CheckSlaBreaches console commands
- ⏳ **Gap 6 - Offline Mobile**: Deferred to future phase (requires service worker + SQLite sync)

### Finance, Costing & Energy Module - COMPLETED
- **Status**: MVP delivered for Energy Management and Procurement
- **Ready to Deploy**: GL Accounts, Cost Centers, Allocation Console, Budget Core
- **Energy Management MVP**: Tariff Setup, Readings Upload Console, Cost Dashboard with kWh/m³ tracking
- **Procurement MVP**: Complete requisition → RFQ → LPO workflow with vendor management
- **Comprehensive review document created**: See FINANCE_COSTING_ENERGY_MODULE_REVIEW.md

### Energy Management Module - NEW (Nov 21, 2025)
- ✅ **Backend**: EnergyController with tariff CRUD, readings upload, dashboard endpoints
- ✅ **Tariff Management**: Peak/off-peak rates, demand charges, validity period tracking
- ✅ **Readings Upload**: CSV upload interface with field mapping and validation
- ✅ **Cost Dashboard**: Scheme breakdown, specific energy (kWh/m³) trends, cost analytics
- ✅ **Security**: All routes protected with auth:sanctum middleware and permission checks
- ⚠️ **Note**: MVP uses demonstration data; Phase 2 will add full readings ingestion logic

### Procurement Module - NEW (Nov 21, 2025)
- ✅ **Database**: 11 tables (vendors, requisitions, requisition_items, rfqs, rfq_items, rfq_invitations, bids, bid_items, lpos, lpo_items, lpo_receipts)
- ✅ **Backend**: 4 controllers (Vendor, Requisition, RFQ, LPO) with full CRUD and workflow transitions
- ✅ **Requisition Management**: Multi-item requisitions with budget checks and approval workflow
- ✅ **RFQ Builder**: Vendor invitations, evaluation criteria, bid comparison matrix
- ✅ **LPO Generation**: Winner selection, auto-generate LPO from awarded RFQ, approval chain
- ✅ **Security**: All routes protected with auth:sanctum middleware and permission checks
- ⚠️ **Note**: MVP implements core workflow; Phase 2 will add budget constraint enforcement and advanced validations

### Resolved Issues
- ✅ **Database Migration Blocker**: Fixed FK type mismatch in modeling module (gl_account_id UUID→bigInt)
- ✅ **Training Migration**: Fixed FK type issues (UUID→bigInt for internal references)
- ✅ **Notes Migration**: Fixed to reference 'tenants' instead of 'organizations'

Key capabilities include:
- Comprehensive spatial features (PostGIS integration, MapLibre GL MapConsole).
- Role-Based Access Control (RBAC) and audit logging.
- Asset and CMMS (Computerized Maintenance Management System) functionalities.
- Shift management and event handling for field operations.
- Water quality monitoring and compliance dashboards.
- Production-ready CRM and Revenue Assurance backend and frontend.
- Production-ready Hydro-Meteorological & Water Sources module with GIS integration.
- Production-ready Costing, Budgeting & Forecasts module with comprehensive backend and React service layer.
- Database schemas and placeholder pages for Monitoring, Evaluation & Service Levels, Customer & Commercial Field Service, and Community & Stakeholder Engagement modules.
- Community & Stakeholder module includes RWSS committee governance (directory, profile with tabs, finance tracking), vendor portal (onboarding, bids, deliveries with OTIF tracking), GRM (stakeholder mapping, engagement planning, grievance SLA console), and open data transparency (catalog, dataset builder with privacy filters, public maps).

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Application Structure

The project uses a monorepo structure with distinct components: `/client` (React frontend), `/server` (Express.js backend for serving React and proxying API), `/api` (Laravel API backend), and `/shared` (shared TypeScript schemas). It utilizes a dual build system: Vite for the frontend and esbuild for the Node.js backend.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Radix UI.
- **Backend**: Express.js (Node.js), Laravel 11 (PHP 8.2+).
- **Database**: PostgreSQL (Neon Database) with Drizzle ORM (Node.js) and Eloquent (Laravel).
- **3D Graphics**: React Three Fiber (for EcoVillage, if reactivated).

## Dual-Server Architecture

The MIS operates with two simultaneous servers:
- **Express server (port 5000)**: Serves the React frontend and proxies `/api/*` requests to Laravel.
- **Laravel API server (port 8001)**: Handles backend logic, database interactions, and spatial queries.

## Database Architecture

- **Dual ORM Strategy**: Drizzle ORM for Node.js and Eloquent ORM for Laravel, both interacting with PostgreSQL.
- **Multi-tenancy**: Implemented in Laravel with `tenant_id` scoping on core tables for data isolation.
- **Spatial Data**: PostGIS support for GeoJSON polygons, points, and centroids.

## Authentication & Authorization

- **Express (Game)**: Session-based authentication.
- **Laravel (MIS)**: Laravel Sanctum for API authentication, Spatie Laravel Permission for granular RBAC, two-factor authentication, secure cookie-based sessions, and comprehensive multi-tenancy hardening.

## Security Features (Laravel)

CSRF protection, strict CORS, secure cookie settings, RBAC enforcement for all API endpoints, automatic audit logging for mutation operations, static analysis (PHPStan), and dependency vulnerability scanning.

## API Design

- **Express Backend**: RESTful API with request/response logging, JSON parsing, and error handling.
- **Laravel Backend**: API versioning (`/api/v1`), resource-based controllers, service layer pattern, paginated responses, type-safe API client wrapper, and structured error responses.

## Frontend Architecture

- **Component Design**: Radix UI for accessible components, custom hooks for authentication and abilities.
- **State Management**: Zustand for game state, TanStack Query for server state and caching.
- **Routing**: React Router with protected routes and nested layouts.
- **Module Features**: Production-ready CRM, Revenue Assurance, and Hydro-Meteorological modules with comprehensive error handling, loading states, defensive rendering, and MapLibre GL integration for spatial data.
- **Accessibility**: Colorblind-friendly palette, adjustable font sizes, keyboard navigation, ARIA labels, WCAG compliance focus.

## Development Workflow

Includes build scripts (`npm run dev`, `npm run build`, `npm run start`, `npm run db:push`), code quality tools (TypeScript strict mode, PHPStan, Laravel Pint), and `.env` files for environment configuration.

# External Dependencies

## Core Infrastructure

- **Database**: Neon Database (PostgreSQL serverless).
- **Package Managers**: npm, Composer.

## Key Third-Party Services

- **Frontend Libraries**: Radix UI, TanStack Query, React Three Fiber/Drei, Fontsource, MapLibre GL.
- **Backend Libraries (Node)**: Express.js, Drizzle ORM, Zod.
- **Backend Libraries (PHP)**: Laravel Framework 11, Laravel Sanctum, Spatie Laravel Permission, Google2FA Laravel, Laravel Eloquent Spatial.
- **Development Tools**: Vite, esbuild, PostCSS, Autoprefixer, TailwindCSS, Vitest, @testing-library/react, happy-dom.
- **Security & Monitoring**: GitHub Actions, PHPStan, Composer audit.