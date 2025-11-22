# Overview

This project is a hybrid monorepo primarily focused on the **Rural Water Supply MIS**, a Laravel-based Management Information System. Its core mission is to enhance operational efficiency, ensure revenue assurance, and improve customer relationship management for water utilities. Key capabilities include multi-tenancy, spatial data integration (PostGIS, MapLibre GL), Role-Based Access Control (RBAC), audit logging, asset and CMMS functionalities, shift management, water quality monitoring, and robust CRM and Revenue Assurance features. The system also includes modules for Hydro-Meteorological & Water Sources, Costing, Budgeting & Forecasts, and scaffolding for Monitoring, Evaluation & Service Levels, Customer & Commercial Field Service, and Community & Stakeholder Engagement. The latter encompasses RWSS committee governance, a vendor portal, Grievance Redressal Mechanism (GRM), and open data transparency.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Application Structure

The project employs a monorepo structure comprising `/client` (React frontend), `/server` (Express.js backend for serving React and API proxying), `/api` (Laravel API backend), and `/shared` (shared TypeScript schemas). It uses Vite for the frontend and esbuild for the Node.js backend.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Radix UI.
- **Backend**: Express.js (Node.js), Laravel 11 (PHP 8.2+).
- **Database**: PostgreSQL (Neon Database) with Drizzle ORM (Node.js) and Eloquent (Laravel).

## Dual-Server Architecture

The MIS operates with two concurrent servers:
- **Express server (port 5000)**: Serves the React frontend and proxies `/api/*` requests to Laravel.
- **Laravel API server (port 8001)**: Handles backend logic, database interactions, and spatial queries.

## Database Architecture

- **Dual ORM Strategy**: Drizzle ORM for Node.js and Eloquent ORM for Laravel.
- **Multi-tenancy**: Implemented in Laravel with `tenant_id` scoping for data isolation.
- **Spatial Data**: PostGIS support for GeoJSON geometries.

## Authentication & Authorization

- **Laravel (MIS)**: Laravel Sanctum for API authentication, Spatie Laravel Permission for granular RBAC, two-factor authentication, secure cookie-based sessions, and comprehensive multi-tenancy hardening.

## Security Features (Laravel)

CSRF protection, strict CORS, secure cookie settings, RBAC enforcement for all API endpoints, automatic audit logging, static analysis (PHPStan), and dependency vulnerability scanning.

## API Design

- **Express Backend**: RESTful API with request/response logging, JSON parsing, and error handling.
- **Laravel Backend**: API versioning (`/api/v1`), resource-based controllers, service layer pattern, paginated responses, type-safe API client wrapper, and structured error responses.

## Frontend Architecture

- **Component Design**: Radix UI for accessible components, custom hooks.
- **State Management**: TanStack Query for server state and caching.
- **Routing**: React Router with protected routes and nested layouts.
- **Module Features**: Production-ready CRM, Revenue Assurance, Decision Support & Advanced Analytics, Energy Management, Procurement, Hydro-Meteorological modules with comprehensive error handling, loading states, defensive rendering, and MapLibre GL integration for spatial data.
- **Accessibility**: Colorblind-friendly palette, adjustable font sizes, keyboard navigation, ARIA labels, WCAG compliance focus.

## Development Workflow

Includes build scripts, code quality tools (TypeScript strict mode, PHPStan, Laravel Pint), and `.env` files for environment configuration.

## Queue Processing & Notifications

- **Laravel Horizon**: Configured for queue processing with Redis.
- **Priority Queues**: Notifications, high, default, DSA-specific queues.
- **Multi-Channel Notifications**: EWSAlertNotification supports email, SMS (Twilio), and custom webhooks for async delivery.

# Recent Updates (Nov 22, 2025)

## Loading State Fixes Across All Pages
Fixed **5 major pages** to display page structure (headers, filters, buttons) during loading/error states instead of fullscreen overlays:
- **CustomersPage**: Now shows header and search while loading, error message in content area
- **TwoFactorSetupPage**: Loading indicator displays with 2FA header visible
- **AssetDetailPage**: Maintains back button and header while loading asset details
- **SchemesPage**: Grid loading with header, filters, and buttons always visible
- **ZonesPage, PipelinesPage, DmasPage**: Added proper TypeScript type annotations for form mutations

## TypeScript Type Fixes
- Added explicit type annotations for mutation functions to fix inference errors
- Corrected form state types to match API field enumerations (Pipeline materials, DMA statuses)
- Fixed conditional rendering syntax in SchemesPage (replaced div with Fragment for proper nesting)

## Code Quality Improvements
- All LSP diagnostics resolved (0 remaining errors)
- Consistent error handling pattern: inline error boxes with bg-destructive/10 styling
- Loading states use centered text with py-12 for consistent spacing
- Pages maintain functional layout during any backend unavailability

# External Dependencies

## Core Infrastructure

- **Database**: Neon Database (PostgreSQL serverless).
- **Package Managers**: npm, Composer.

## Key Third-Party Services

- **Frontend Libraries**: Radix UI, TanStack Query, MapLibre GL.
- **Backend Libraries (Node)**: Express.js, Drizzle ORM, Zod.
- **Backend Libraries (PHP)**: Laravel Framework 11, Laravel Sanctum, Spatie Laravel Permission, Google2FA Laravel, Laravel Eloquent Spatial, laravel-notification-channels/twilio.
- **Development Tools**: Vite, esbuild, PostCSS, Autoprefixer, TailwindCSS.
- **Integrations**: SendGrid (email), Twilio (SMS).