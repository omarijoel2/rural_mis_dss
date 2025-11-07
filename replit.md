# Overview

This is a hybrid application combining two distinct systems:

1. **EcoVillage** - A browser-based sustainability education game built with React and Express, featuring a lunch-break-friendly resource management experience with accessibility features
2. **Rural Water Supply MIS** - A Laravel-based Management Information System for rural water infrastructure with multi-tenancy, spatial data support, and comprehensive security features

The application uses a monorepo structure with separate frontend (React/Vite), backend (Express + Laravel), and shared TypeScript schema definitions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Application Structure

**Monorepo Organization:**
- `/client` - React frontend application (Vite + TypeScript)
- `/server` - Express.js backend server
- `/api` - Laravel API backend
- `/shared` - Shared TypeScript schemas and types
- Dual build system: Vite for frontend, esbuild for backend

**Technology Stack:**
- Frontend: React 18, TypeScript, Vite, TailwindCSS, Radix UI components
- Backend: Express.js (Node), Laravel 11 (PHP 8.2+)
- Database: PostgreSQL with Drizzle ORM (Node side) and Eloquent (Laravel side)
- 3D Graphics: React Three Fiber, Drei, postprocessing
- Build Tools: Vite, esbuild, Laravel Mix

## Database Architecture

**Dual ORM Strategy:**
- Drizzle ORM configured for PostgreSQL (Node/Express side)
- Schema defined in `shared/schema.ts` for type safety
- Laravel Eloquent ORM (PHP side) for MIS features
- Database migrations managed via Drizzle Kit
- Neon Database serverless PostgreSQL support

**Multi-tenancy (Laravel side):**
- Tenant isolation with tenant_id on core tables
- Organizations, schemes, and facilities scoped per tenant
- Spatial data support via `matanyadaev/laravel-eloquent-spatial` package
- GeoJSON support for polygons, points, centroids

## Authentication & Authorization

**Dual Auth System:**

1. **Express Side (Game):**
   - Session-based authentication with `connect-pg-simple`
   - In-memory storage layer with `MemStorage` class
   - User schema with username/password

2. **Laravel Side (MIS):**
   - Laravel Sanctum for API authentication
   - Spatie Laravel Permission for role-based access control (RBAC)
   - Two-factor authentication via `pragmarx/google2fa-laravel`
   - Cookie-based sessions with strict CORS policies
   - Protected routes with permission and role guards

**Security Features (Laravel):**
- CSRF protection (X-CSRF-TOKEN, X-XSRF-TOKEN headers)
- Strict CORS configuration with whitelisted origins
- Secure cookie settings (HttpOnly, SameSite)
- Comprehensive security scanning workflow (SAST, dependency scanning, secrets detection)
- PHPStan static analysis for code quality

## Frontend Architecture

**Component Design:**
- Radix UI primitives for accessible UI components
- Custom hooks for authentication (`useAuth`, `useAbility`)
- Permission-based component rendering (`RequirePerm`, `ProtectedRoute`)
- Zustand state management for game state (`useSustainability`, `useAudio`)
- React Query for server state and caching

**Accessibility Features:**
- Colorblind-friendly palette with CSS custom properties
- Adjustable font sizes
- Keyboard navigation support
- ARIA labels and semantic HTML
- Screen reader compatible
- WCAG compliance focus

**3D Rendering:**
- WebGL-based 3D scenes via React Three Fiber
- GLTF/GLB model support
- GLSL shader support via vite-plugin-glsl
- Post-processing effects
- Audio file support (MP3, OGG, WAV)

## API Design

**Express Backend:**
- RESTful API pattern with `/api` prefix
- Request/response logging middleware
- JSON body parsing
- Error handling middleware with status codes
- Development HMR via Vite middleware

**Laravel Backend:**
- API versioning (`/api/v1`)
- Resource-based controllers
- Service layer pattern (`facilityService`, `schemeService`)
- Paginated responses for list endpoints
- Type-safe API client wrapper
- Structured error responses with validation errors

## Development Workflow

**Build & Dev Scripts:**
- `npm run dev` - Runs Express server with TypeScript execution (tsx)
- `npm run build` - Vite build + esbuild server bundle
- `npm run start` - Production server execution
- `npm run db:push` - Apply Drizzle schema migrations
- Concurrent Laravel/Node development support

**Code Quality:**
- TypeScript strict mode enabled
- Path aliases (`@/*` for client, `@shared/*` for shared code)
- ESM module format throughout
- Incremental compilation with tsBuildInfoFile
- PHPStan level 9 static analysis (Laravel)
- Laravel Pint code style enforcement

**Environment Configuration:**
- `DATABASE_URL` for Postgres connection
- `VITE_API_BASE_URL` for API endpoint configuration
- `CORS_ALLOWED_ORIGINS` for cross-origin requests
- Separate `.env` files for Laravel and Node environments

# External Dependencies

## Core Infrastructure

**Database:**
- Neon Database (PostgreSQL serverless)
- Connection via `@neondatabase/serverless` driver
- Spatial data extensions (PostGIS compatible via Laravel)

**Package Managers:**
- npm/composer for dependency management
- No bundled vendor files in version control

## Key Third-Party Services

**Frontend Libraries:**
- Radix UI - Accessible component primitives
- TanStack Query - Server state management
- React Three Fiber/Drei - 3D rendering
- Fontsource - Web font delivery

**Backend Libraries (Node):**
- Express.js - HTTP server framework
- Drizzle ORM - Type-safe database queries
- Zod - Runtime schema validation

**Backend Libraries (PHP):**
- Laravel Framework 11
- Laravel Sanctum - API authentication
- Spatie Laravel Permission - RBAC
- Google2FA Laravel - Two-factor auth
- Laravel Eloquent Spatial - Geospatial queries

**Development Tools:**
- Vite - Frontend build tool and dev server
- esbuild - Fast JavaScript/TypeScript bundler
- PostCSS + Autoprefixer - CSS processing
- TailwindCSS - Utility-first CSS framework

**Security & Monitoring:**
- GitHub Actions - CI/CD workflows
- PHPStan - PHP static analysis
- Composer audit - Dependency vulnerability scanning
- Custom security scan workflows