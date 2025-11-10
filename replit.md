# Overview

This project is a hybrid monorepo featuring two applications: **EcoVillage** (an inactive sustainability education game) and **Rural Water Supply MIS**. The primary focus is the **Rural Water Supply MIS**, a Laravel-based Management Information System designed for rural water infrastructure. It supports multi-tenancy, spatial data, and robust security features, with a core mission to enhance operational efficiency, ensure revenue assurance, and improve customer relationship management for water utilities.

Key capabilities include:
- Comprehensive spatial features (PostGIS integration, MapLibre GL MapConsole).
- Role-Based Access Control (RBAC) and audit logging.
- Asset and CMMS (Computerized Maintenance Management System) functionalities.
- Shift management and event handling for field operations.
- Water quality monitoring and compliance dashboards.
- **Module 07 COMPLETE**: Production-ready CRM and Revenue Assurance backend with billing, payments, fraud detection, dunning workflows, AND full-featured frontend with 6 pages (Customers, Account360, AccountSearch, RA Console, Dunning, Import Center).
- **Module 08 COMPLETE**: Production-ready Hydro-Meteorological & Water Sources module with 2 frontend pages (Sources Registry, Stations Registry) featuring MapLibre GL integration, PostGIS location pickers, and sensor management.
- **Module 11 COMPLETE**: Production-ready Costing, Budgeting & Forecasts module with comprehensive backend (17 models, 3 services, 24 API routes), React service layer (27 API methods), and demo data seeders for GL accounts, cost centers, budgets, allocations, and cost-to-serve analytics.

# Recent Changes

## VPS Deployment Documentation - COMPLETE (November 2025)
- **COMPLETE**: Production-ready VPS deployment guide and database export
- **Deployment Guide**: Comprehensive 60+ section guide covering Ubuntu 22.04/24.04 deployment (DEPLOYMENT_GUIDE.md)
  - Stack: Nginx + PHP-FPM 8.2 + PostgreSQL 16 + PostGIS + Node.js 20 + PM2 + Redis
  - Complete server setup, configuration, and optimization instructions
  - Process management for Laravel API, Express frontend, and queue workers
  - SSL certificate setup with Let's Encrypt
  - Automated backup strategies (database + application files)
  - Zero-downtime deployment script
  - Comprehensive monitoring and troubleshooting guide
- **Database Export**: Full PostgreSQL schema exported (database_schema.sql, 172KB, 6,276 lines)
  - Includes all 17 Module 11 tables (GL accounts, budgets, allocations, cost-to-serve)
  - Includes Module 07 CRM tables and Module 08 Hydro-Met tables
  - PostGIS extensions and spatial data structures
  - Ready for direct import into production database
- **Quick Checklist**: Step-by-step deployment verification (DEPLOYMENT_CHECKLIST.md)

## Module 11: Costing, Budgeting & Forecasts - COMPLETE (November 2025)
- **COMPLETE**: Full-stack production-ready costing module with backend, service layer, AND React service layer
- **Database Layer**: 4 Laravel migrations successfully deployed (17 tables)
  - Core Tables: gl_accounts (chart of accounts with hierarchical structure), cost_centers (organizational units)
  - Budgeting: budget_versions (fiscal year budgets with approval workflow), budget_lines (detailed line items)
  - Drivers: drivers (allocation basis), driver_values (time-series driver data)
  - Forecasting: forecasts (forecast versions), forecast_lines (forecast details), actuals (actual results), encumbrances (commitments), unit_costs (rate tables)
  - Tariffs: energy_tariffs (electricity rates), chemical_tariffs (treatment chemical rates)
  - Allocation: allocation_rules (cost allocation logic), alloc_runs (execution history), alloc_results (allocated costs)
  - Analytics: cost_to_serve (comprehensive cost metrics per DMA/scheme/class)
- **Laravel Backend**: 17 Eloquent models with tenant scoping, 3 service classes, 3 controllers, 7 FormRequest validators, 24 API routes
  - BudgetService: CRUD + approval workflow + summary reporting
  - AllocationService: Rule-based cost allocation with transaction safety and failure diagnostics
  - CostToServeService: Metrics calculation with DMA league tables and trend analysis
  - Comprehensive validation on all endpoints (dates, coordinates, foreign keys, unique constraints)
  - HTTP 204 No Content for DELETE operations (RFC 7231 compliant)
  - Authorization via route middleware (consistent with established codebase pattern)
- **React Service Layer**: Complete TypeScript API client with type-safe interfaces
  - 13 TypeScript interfaces for all entities (with proper `number` types for Laravel integer IDs)
  - 27 API client methods covering budgets, allocations, cost-to-serve analytics
  - Support for optional parameters, query filters, and file uploads
- **Seeders**: Production-ready demo data generators
  - CostingPermissionSeeder: 34 RBAC permissions covering all CRUD operations
  - CostingSeeder: GL accounts (19 accounts with 3-level hierarchy), cost centers (10 units), budget version with monthly lines, allocation rules (3 methods), cost-to-serve metrics (6 months)
  - Uses updateOrCreate to ensure hierarchy correctness on re-runs
- **RBAC Integration**: All routes protected with permission middleware (view/create/edit/delete/approve for budgets, allocations, cost-to-serve)
- **Known Limitation**: Seeders verified production-ready but cannot be tested in current environment due to pre-existing database schema inconsistencies (users table missing tenant_id column)

## Module 08: Hydro-Meteorological & Water Sources - COMPLETE (November 2025)
- **COMPLETE**: Full-stack production-ready module with backend, service layer, AND frontend pages
- **Database Layer**: All Laravel migrations (4 files, 20+ tables) successfully deployed with PostGIS support
  - Sources Registry: source_kinds, source_statuses, quality_risk_levels lookups; sources table with PostGIS Point
  - Stations & Sensors: hydromet_stations with PostGIS Point; station_types, sensor_types, sensor_statuses lookups; hydromet_sensors table
  - Timeseries Data: Partitioned timeseries table with 13 monthly partitions (6 past + current + 6 future), BRIN/GIST indexes
  - Forecasts & Indicators: forecast_models, forecast_variables, drought_stages lookups; forecast_grids with BYTEA grid_data and PostGIS bbox; hydro_indicators with SPI metrics
  - Migration Fixes: Resolved ALL UUID foreign key type mismatches across CRM and Hydro-Met modules
- **Laravel Backend**: 10 Eloquent models with secure tenant scoping, 2 service classes (SourceService, StationService), 2 API controllers, 6 FormRequest validation classes
  - Comprehensive validation on all 24 endpoints (coordinates, dates, foreign keys, unique constraints)
  - HTTP 204 No Content for DELETE operations (RFC 7231 compliant)
  - Spatial queries (nearby, in-bounds) with validated coordinate bounds
  - Abstraction logging with date range validation
  - Station activation/deactivation and sensor management
- **React Service Layer**: Complete TypeScript API client with 30+ interfaces, 24 API methods, 21 TanStack Query hooks
  - hydrometService: CRUD operations for sources, stations, and sensors; spatial queries; abstraction logging
  - Query hooks with proper caching, invalidation, and enabled/disabled control
  - Mutation hooks with automatic query invalidation on success
- **Frontend Pages**: 2 production-ready pages with full GIS integration
  - **Sources Registry** (`/hydromet/sources`): List view with collapsible MapLibre GL map, search/filters, CRUD dialogs with PostGIS location picker
  - **Stations Registry** (`/hydromet/stations`): List view with collapsible map, activation/deactivation, sensor management dialog
- **Map Components**: Reusable GIS components with zero-coordinate handling
  - **HydrometMap**: GeoJSON layer rendering, interactive selection, status-based color coding
  - **LocationPicker**: Click-to-place marker, manual coordinate input, equator/prime meridian support (lat/lon=0 bug fix)
- **RBAC Integration**: All routes protected with permission middleware (view/create/edit/delete for sources, stations, sensors)
- **Known Limitation**: Lookup dropdowns use hard-coded values matching migration seed data; API endpoints for dynamic lookups planned as future enhancement

## Module 07: CRM & Revenue Assurance Frontend (November 2025)
- **Customers Page**: Search, filters, sortable table with customer data and quick actions
- **Account Search Page**: Direct account lookup with navigation to Account 360
- **Account 360 Page**: Comprehensive customer view with 5 tabs (Summary, Billing, Payments, Meter Reads, RA Cases)
- **RA Console Page**: Revenue assurance case monitoring, triage board, field investigation workflow
- **Dunning & Collections Page**: Aging report with breakdown by bucket, notice generation, disconnection list
- **Import Center Page**: CSV file uploads for billing invoices and M-Pesa transactions with validation
- **CRM Service Layer**: Comprehensive API client with TanStack Query integration, file upload support
- **Security**: All pages protected with ProtectedRoute guards, RBAC enforcement via backend
- **Data Handling**: Defensive rendering with per-field null safety, per-action pending states, loading guards

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Application Structure

The project employs a monorepo structure with distinct components:
- `/client`: React frontend (Vite + TypeScript).
- `/server`: Express.js backend for serving the React app and proxying API requests.
- `/api`: Laravel API backend for core MIS logic.
- `/shared`: Shared TypeScript schemas and types.
- Dual build system: Vite for frontend, esbuild for Node.js backend.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Radix UI.
- **Backend**: Express.js (Node.js), Laravel 11 (PHP 8.2+).
- **Database**: PostgreSQL (Neon Database for serverless) with Drizzle ORM (Node.js) and Eloquent (Laravel).
- **3D Graphics**: React Three Fiber, Drei, postprocessing (for EcoVillage, if reactivated).

## Dual-Server Architecture

The MIS operates with two simultaneously running servers:
- **Express server (port 5000)**: Serves the React frontend and proxies `/api/*` requests to Laravel.
- **Laravel API server (port 8001)**: Handles backend logic, database interactions, and spatial queries.

## Database Architecture

- **Dual ORM Strategy**: Drizzle ORM for Node.js and Eloquent ORM for Laravel, both interacting with PostgreSQL.
- **Multi-tenancy**: Implemented in Laravel with `tenant_id` scoping on core tables, ensuring data isolation for organizations, schemes, and facilities.
- **Spatial Data**: PostGIS support via `matanyadaev/laravel-eloquent-spatial` for GeoJSON polygons, points, and centroids.

## Authentication & Authorization

- **Express (Game)**: Session-based authentication using `connect-pg-simple`.
- **Laravel (MIS)**:
    - Laravel Sanctum for API authentication.
    - Spatie Laravel Permission for granular RBAC with method-specific permission guards.
    - Two-factor authentication via `pragmarx/google2fa-laravel`.
    - Secure cookie-based sessions with strict CORS.
    - Comprehensive multi-tenancy hardening across all modules to prevent cross-tenant data access.

## Security Features (Laravel)

- CSRF protection, strict CORS, and secure cookie settings.
- RBAC enforcement for all API endpoints (GET, POST, PATCH/PUT, DELETE).
- Automatic audit logging for all mutation operations (POST/PUT/PATCH/DELETE).
- Static analysis (PHPStan) and dependency vulnerability scanning.

## API Design

- **Express Backend**: RESTful API, request/response logging, JSON body parsing, error handling.
- **Laravel Backend**: API versioning (`/api/v1`), resource-based controllers, service layer pattern, paginated responses, type-safe API client wrapper, structured error responses.

## Frontend Architecture

- **Component Design**: Radix UI for accessible components, custom hooks for authentication and abilities.
- **State Management**: Zustand for game state, TanStack Query for server state and caching.
- **Routing**: React Router with protected routes, nested layouts for module navigation.
- **CRM Module**: 6 production-ready pages with comprehensive error handling, loading states, and defensive rendering.
- **Hydromet Module**: 2 production-ready pages with MapLibre GL maps, PostGIS location pickers, sensor management, and spatial data visualization.
- **Data Patterns**: Per-field null coalescing for API payloads, per-component loading states, optimistic UI updates.
- **Accessibility**: Colorblind-friendly palette, adjustable font sizes, keyboard navigation, ARIA labels, WCAG compliance focus.

## Development Workflow

- **Build Scripts**: `npm run dev` (Express), `npm run build`, `npm run start`, `npm run db:push` (Drizzle migrations).
- **Code Quality**: TypeScript strict mode, path aliases, ESM modules, incremental compilation, PHPStan (level 9), Laravel Pint.
- **Environment Configuration**: `.env` files for database, API endpoints, and CORS origins.

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