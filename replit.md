# Overview

This project is a hybrid monorepo for the **Rural Water Supply MIS**, a Laravel-based Management Information System. Its primary goal is to enhance operational efficiency, ensure revenue assurance, and improve customer relationship management for water utilities. Key capabilities include multi-tenancy, spatial data integration (PostGIS, MapLibre GL), Role-Based Access Control (RBAC), audit logging, asset and CMMS functionalities, shift management, water quality monitoring, and robust CRM and Revenue Assurance features. The system also supports hydro-meteorological and water sources data, costing, budgeting, and forecasting, alongside scaffolding for monitoring, evaluation, service levels, customer and commercial field service, and community and stakeholder engagement. The latter covers RWSS committee governance, a vendor portal, Grievance Redressal Mechanism (GRM), and open data transparency.

**NEW (Module 18)**: Workflows Engine & SLAs - Production-grade state machine for human-in-the-loop approvals, escalations, timers, and auditability. Integrates with all modules (CMMS, CRM/RA, WQ, Procurement, Projects, Ops Events, etc.) with deterministic execution, multi-tenancy support, and comprehensive observability.

**NEW (GW4R Phase 1 Enhancements)**: 
- **Aquifer Management**: Groundwater sustainability tracking with yield monitoring, recharge rates, abstraction limits, and risk assessment across 7 priority ASAL aquifers
- **Drought Response System**: Emergency response coordination with strategic borehole activation, water rationing, and affected population tracking
- **Gender & Equity Reporting**: Gender-disaggregated water access metrics, vulnerable group segmentation, and equity outcome dashboards
- **Capacity Assessment Framework**: Operator competency evaluation, certification tracking, and training impact measurement

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Application Structure

The project uses a monorepo structure with `/client` (React frontend), `/server` (Express.js backend for React serving and API proxying), `/api` (Laravel API backend), and `/shared` (shared TypeScript schemas). It leverages Vite for the frontend and esbuild for the Node.js backend.

## Workflows Engine (Module 18)

**Core Components**:
- **Data Model**: 8 Drizzle tables (wf_definitions, wf_instances, wf_transitions, wf_tasks, wf_slas, wf_escalations, wf_webhooks, wf_signals)
- **Services**: WfCompiler (spec compilation), WfRuntime (state machine execution), WfNotifier (multi-channel notifications)
- **API Routes**: `/api/v1/workflows/definitions` (CRUD), `/api/v1/workflows/instances` (create/trigger/signal)
- **React UI**: Workflow definitions editor, instances monitor, task board
- **Seeds**: Work Order and Incident template workflows with SLA policies

## GW4R Phase 1 Groundwater Enhancement (Module 19-22)

**Database Schema** (6 new tables):
- **aquifers**: Registry with yield, recharge, depth, geology, water quality, risk level tracking
- **groundwater_monitoring**: Water level, abstraction, yield, quality (chloride/fluoride/nitrate) time-series data
- **drought_events**: Event declaration, severity, population impact, borehole activation tracking
- **gender_equity_tracking**: Demographic water access metrics (gender, age, vulnerability), collection time, satisfaction
- **competency_assessments**: Operator certification with scores, validity dates, topic tracking
- **vulnerable_groups**: Population segmentation with access challenges and support tracking

**UI Modules**:
1. **Aquifer Management** (`/hydromet/aquifers`): Monitor 7 ASAL aquifers with yield curves, recharge tracking, utilization dashboards, sustainability alerts
2. **Drought Response Center** (`/core-ops/droughts`): Declare events, activate emergency boreholes, track affected populations, manage water rationing
3. **Gender & Equity Reporting** (`/me/gender-equity`): Gender-disaggregated dashboards showing collection burden disparity, vulnerable group segmentation
4. **Capacity Assessments** (`/training/assessments`): Evaluate operator competency, track certifications, measure training impact

**Sidebar Integration**: All 4 modules integrated into respective layout sidebars (Hydromet, Core Operations, M&E, Training)

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Radix UI.
- **Backend**: Express.js (Node.js), Laravel 11 (PHP 8.2+).
- **Database**: PostgreSQL (Neon Database) with Drizzle ORM (Node.js) and Eloquent (Laravel).

## Dual-Server Architecture

The MIS operates with two concurrent servers: an Express server (port 5000) serving the React frontend and proxying API requests, and a Laravel API server (port 8001) handling backend logic and database interactions.

## Database Architecture

A dual ORM strategy is employed, using Drizzle ORM for Node.js and Eloquent ORM for Laravel. Multi-tenancy is implemented in Laravel with `tenant_id` scoping for data isolation. PostGIS supports GeoJSON geometries for spatial data.

## Authentication & Authorization

Laravel Sanctum provides API authentication, Spatie Laravel Permission handles granular RBAC, and the system includes two-factor authentication, secure cookie-based sessions, and multi-tenancy hardening.

## Security Features (Laravel)

The system incorporates CSRF protection, strict CORS, secure cookie settings, RBAC enforcement, automatic audit logging, static analysis (PHPStan), and dependency vulnerability scanning.

## API Design

The Express backend offers a RESTful API with request/response logging, JSON parsing, and error handling. The Laravel backend features API versioning (`/api/v1`), resource-based controllers, a service layer pattern, paginated responses, a type-safe API client wrapper, and structured error responses.

## Frontend Architecture

Radix UI is used for accessible components and custom hooks. TanStack Query manages server state and caching. React Router handles routing with protected routes and nested layouts. Module features include CRM, Revenue Assurance, Decision Support & Advanced Analytics, Energy Management, Procurement, Hydro-Meteorological modules with comprehensive error handling, loading states, defensive rendering, and MapLibre GL integration for spatial data. Accessibility is a key focus, including a colorblind-friendly palette, adjustable font sizes, keyboard navigation, ARIA labels, and WCAG compliance.

## Development Workflow

The project includes build scripts, code quality tools (TypeScript strict mode, PHPStan, Laravel Pint), and `.env` files for environment configuration.

## Queue Processing & Notifications

Laravel Horizon is configured for queue processing with Redis, utilizing priority queues for notifications, high-priority tasks, default tasks, and DSA-specific queues. Multi-channel notifications support email (SendGrid), SMS (Twilio), and custom webhooks for asynchronous delivery.

## Mobile Application

A production-ready offline-first iOS/Android companion app is built using React Native Expo Workspace (SDK 51) with TypeScript, NativeWind, and Expo Router. It uses WatermelonDB for offline storage with multi-tenant namespacing, Expo SecureStore for secure token storage, and a sync engine for CRUD mutation queuing and auto-retry. Features include customer management, work orders, asset inspections, and water quality data collection with offline capabilities and multi-tenancy.

## GIS Module

A comprehensive shape file and vector file management system supports uploading, parsing, and managing Shapefile, GeoJSON, and GeoPackage formats. It allows creating styled vector layers with real-time customization of color, opacity, and stroke width, integrates with MapLibre GL, and includes full CRUD operations for files and layers with RBAC enforcement and tenant isolation.

# External Dependencies

## Core Infrastructure

- **Database**: Neon Database (PostgreSQL serverless) with PostGIS.
- **Package Managers**: npm, Composer.

## Key Third-Party Services

- **Frontend Libraries**: Radix UI, TanStack Query, MapLibre GL, React Router.
- **Backend Libraries (Node)**: Express.js, Drizzle ORM, Zod.
- **Backend Libraries (PHP)**: Laravel Framework 11, Laravel Sanctum, Spatie Laravel Permission, Google2FA Laravel, Laravel Eloquent Spatial, laravel-notification-channels/twilio.
- **Mobile Libraries**: React Native, Expo, Expo Router, NativeWind, WatermelonDB, Expo SecureStore, Expo LocalAuthentication.
- **Development Tools**: Vite, esbuild, PostCSS, Autoprefixer, TailwindCSS, EAS Build.
- **Integrations**: SendGrid (email), Twilio (SMS), EAS (native app deployment).