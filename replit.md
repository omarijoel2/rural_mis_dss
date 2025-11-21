# Overview

This project is a hybrid monorepo containing two applications: **EcoVillage** (an inactive sustainability education game) and **Rural Water Supply MIS**. The primary focus is the **Rural Water Supply MIS**, a Laravel-based Management Information System designed for rural water infrastructure. Its core mission is to enhance operational efficiency, ensure revenue assurance, and improve customer relationship management for water utilities through multi-tenancy, spatial data, and robust security features.

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

### Finance, Costing & Energy Module - Reviewed
- **Status**: 65% production ready - Costing core is solid, Energy & Procurement need UI work
- **Ready to Deploy**: GL Accounts, Cost Centers, Allocation Console, Budget Core
- **High Priority Gaps**: Allocation Wizard, Variance Dashboard, Energy Management UI, Procurement MVP
- **Comprehensive review document created**: See FINANCE_COSTING_ENERGY_MODULE_REVIEW.md

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