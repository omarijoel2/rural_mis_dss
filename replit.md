# Overview

This project is a hybrid monorepo for the **Rural Water Supply MIS**, a Laravel-based Management Information System. Its primary goal is to enhance operational efficiency, ensure revenue assurance, and improve customer relationship management for water utilities. Key capabilities include multi-tenancy, spatial data integration (PostGIS, MapLibre GL), Role-Based Access Control (RBAC), audit logging, asset and CMMS functionalities, shift management, water quality monitoring, and robust CRM and Revenue Assurance features. The system also supports hydro-meteorological and water sources data, costing, budgeting, and forecasting, alongside scaffolding for monitoring, evaluation, service levels, customer and commercial field service, and community and stakeholder engagement (RWSS committee governance, vendor portal, Grievance Redressal Mechanism (GRM), and open data transparency).

Recent enhancements include a complete Integration & Platform Services Module with 21 REST API endpoints, 4 service layers (encryption, notifications, device sync, observability), and an API client layer. A production-grade Workflows Engine and SLAs module provides state machine capabilities for approvals and escalations. Groundwater management, drought response, gender & equity reporting, and capacity assessment frameworks have been added as part of GW4R Phase 1. A new Settings & Configuration Module allows dynamic management of 14 modules and role-based menu access. The Community & Stakeholder Module (Phase 1) introduces 13 Drizzle ORM tables, 15 API endpoints, and enhanced pages for committees, vendors, grievances, and open data, including a full MapLibre GL viewer and a dataset builder. Predictive analytics features for asset failure, NRW anomaly detection, demand forecasting, pump optimization, and outage impact are partially implemented, with a live frontend and API endpoints.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Application Structure

The project uses a monorepo structure with `/client` (React frontend), `/server` (Express.js backend for React serving and API proxying), `/api` (Laravel API backend), and `/shared` (shared TypeScript schemas). It leverages Vite for the frontend and esbuild for the Node.js backend.

## Integration & Platform Services Module

This module features an Express.js backend with modular routing, 4 independent service layers (encryption, notifications, devices, observability), and a robust API client with 35+ methods. It ensures full TypeScript type safety and multi-tenancy support across all 21 REST endpoints, covering API Gateway, Master Data Management, EDRMS, Data Warehouse, Notifications, Device Registry, Observability, Backup/DR, and Secrets Vault functionalities.

## Workflows Engine

The Workflows Engine utilizes 8 Drizzle tables for data modeling, with core services for workflow compilation, state machine execution, and multi-channel notifications. It exposes API routes for CRUD operations on workflow definitions and instances, and provides a React UI for workflow editing, monitoring, and task management.

## GW4R Phase 1 Groundwater Enhancement

This enhancement introduces 6 new database tables for aquifer management, groundwater monitoring, drought events, gender & equity tracking, competency assessments, and vulnerable groups. It includes UI modules for Aquifer Management, a Drought Response Center, Gender & Equity Reporting, and Capacity Assessments, all integrated into the application's sidebars.

## Technology Stack

-   **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Radix UI.
-   **Backend**: Express.js (Node.js), Laravel 11 (PHP 8.2+).
-   **Database**: PostgreSQL (Neon Database) with PostGIS, Drizzle ORM (Node.js), and Eloquent (Laravel).

## Dual-Server Architecture

The MIS uses two concurrent servers: an Express server (port 5000) for the React frontend and API proxying, and a Laravel API server (port 8000) for backend logic and database interactions.

## Database Architecture

A dual ORM strategy is employed, using Drizzle ORM for Node.js and Eloquent ORM for Laravel. Multi-tenancy is implemented in Laravel with `current_tenant_id` scoping in the users table. PostGIS supports GeoJSON geometries for spatial data.

### Migration Order
- Tenants table is created first (0001_01_00_000000) before the users table
- Users table (0001_01_01_000000) references tenants via `current_tenant_id`
- FK constraints added separately (0001_01_01_000001) after both tables exist
- Core registry tables check for existing tenants to avoid duplicates

### Tenant Model
Each tenant includes: name, short_code, county (for Kenya county-based organization), country, timezone, currency, status.

## Authentication & Authorization

Laravel Sanctum provides API authentication, Spatie Laravel Permission handles granular RBAC, and the system includes two-factor authentication, secure cookie-based sessions, and multi-tenancy hardening. Security features include CSRF protection, strict CORS, and audit logging.

## API Design

The Express backend offers a RESTful API with request/response logging, JSON parsing, and error handling. The Laravel backend features API versioning, resource-based controllers, a service layer pattern, paginated responses, a type-safe API client wrapper, and structured error responses.

## Frontend Architecture

Radix UI is used for accessible components. TanStack Query manages server state. React Router handles routing with protected routes. Key modules include CRM, Revenue Assurance, Decision Support, Energy Management, Procurement, and Hydro-Meteorological, all featuring robust error handling, loading states, defensive rendering, and MapLibre GL integration. Accessibility is a core focus, including a colorblind-friendly palette, adjustable font sizes, keyboard navigation, ARIA labels, and WCAG compliance.

## Queue Processing & Notifications

Laravel Horizon is configured for Redis-based queue processing with priority queues for various tasks. Multi-channel notifications support email (SendGrid), SMS (Twilio), and custom webhooks.

## Mobile Application

A production-ready offline-first iOS/Android companion app is built using React Native Expo Workspace, TypeScript, NativeWind, and Expo Router. It uses WatermelonDB for offline storage with multi-tenant namespacing, Expo SecureStore for secure token storage, and a sync engine.

## GIS Module

A comprehensive GIS module supports uploading, parsing, and managing Shapefile, GeoJSON, and GeoPackage formats. It allows creating styled vector layers with real-time customization, integrates with MapLibre GL, and includes full CRUD operations with RBAC and tenant isolation.

# External Dependencies

## Core Infrastructure

-   **Database**: Neon Database (PostgreSQL serverless) with PostGIS.
-   **Package Managers**: npm, Composer.

## Key Third-Party Services

-   **Frontend Libraries**: Radix UI, TanStack Query, MapLibre GL, React Router.
-   **Backend Libraries (Node)**: Express.js, Drizzle ORM, Zod.
-   **Backend Libraries (PHP)**: Laravel Framework 11, Laravel Sanctum, Spatie Laravel Permission, Google2FA Laravel, Laravel Eloquent Spatial, laravel-notification-channels/twilio.
-   **Mobile Libraries**: React Native, Expo, Expo Router, NativeWind, WatermelonDB, Expo SecureStore, Expo LocalAuthentication.
-   **Development Tools**: Vite, esbuild, PostCSS, Autoprefixer, TailwindCSS, EAS Build.
-   **Integrations**: SendGrid (email), Twilio (SMS), EAS (native app deployment).