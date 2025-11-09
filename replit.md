# Overview

This project is a hybrid monorepo featuring two applications: **EcoVillage** (an inactive sustainability education game) and **Rural Water Supply MIS**. The primary focus is the **Rural Water Supply MIS**, a Laravel-based Management Information System designed for rural water infrastructure. It supports multi-tenancy, spatial data, and robust security features, with a core mission to enhance operational efficiency, ensure revenue assurance, and improve customer relationship management for water utilities.

Key capabilities include:
- Comprehensive spatial features (PostGIS integration, MapLibre GL MapConsole).
- Role-Based Access Control (RBAC) and audit logging.
- Asset and CMMS (Computerized Maintenance Management System) functionalities.
- Shift management and event handling for field operations.
- Water quality monitoring and compliance dashboards.
- A production-ready CRM and Revenue Assurance backend with billing, payments, fraud detection, and dunning workflows.

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
- **State Management**: Zustand for game state, React Query for server state and caching.
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