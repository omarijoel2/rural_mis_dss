# Overview

This is a hybrid monorepo containing two distinct applications:

1. **EcoVillage** - A browser-based sustainability education game (currently inactive)
2. **Rural Water Supply MIS** (Active) - A Laravel-based Management Information System for rural water infrastructure with multi-tenancy, spatial data support, and comprehensive security features

**Current Focus**: Rural Water Supply MIS - Module 04 Backend Complete! Ready for Frontend Implementation.

**Recent Completions**:
- ✅ Module 01: Spatial features, PostGIS integration, MapLibre GL MapConsole
- ✅ **Module 02 (Complete - Nov 7, 2024)**: All 4 epics architect-verified
  - Epic 1: Import/Export pipelines (GeoJSON + CSV) for schemes, DMAs, facilities
  - Epic 2: RBAC enforcement with method-specific permission guards
  - Epic 3: Audit logging middleware on all mutation routes
  - Epic 4: OpenAPI/Swagger documentation scaffolding
- ✅ **Module 04 Backend (Complete - Nov 8, 2024)**: Comprehensive Asset/CMMS System
  - 15 CMMS database tables (asset_classes, assets, parts, work_orders, pm_policies, etc.)
  - 13 fully aligned Eloquent models with relationships
  - 3 service classes (AssetService, WorkOrderService, InventoryService)
  - 2 API controllers with 20+ RBAC-protected endpoints
  - 14 CMMS permissions integrated
  - 100 assets + 10 parts + demo data seeded
  - Complete API testing documentation and scripts

The application uses a monorepo structure with separate frontend (React/Vite), backend (Express + Laravel), and shared TypeScript schema definitions.

## Dual-Server Architecture

The MIS requires two servers running simultaneously:
- **Express server** (port 5000) - Serves React frontend, proxies API requests to Laravel
- **Laravel API server** (port 8001) - Handles backend logic, database, spatial queries

### Starting Both Servers

**Step 1**: Click "Run" button (starts Express on port 5000)

**Step 2**: Open Shell and start Laravel manually:
```bash
cd api && php artisan serve --host=0.0.0.0 --port=8001
```

**⚠️ Important**: 
- Both servers must be running for full MIS functionality
- Express proxies all `/api/*` requests to Laravel
- If Laravel isn't running, MapConsole and API endpoints will fail with "Laravel API unavailable" error
- Proxy automatically adds helpful error messages with startup instructions

### Testing the Servers

```bash
# Test Express (should always work)
curl http://localhost:5000/

# Test Laravel health endpoint (requires Laravel running)
curl http://localhost:5000/api/health

# Test GeoJSON endpoints (requires Laravel + seeded data)
curl http://localhost:5000/api/v1/gis/schemes/geojson
```

### Troubleshooting

**"Laravel API unavailable" errors:**
- Laravel process is not running or has terminated
- Restart Laravel: `cd api && php artisan serve --host=0.0.0.0 --port=8001`
- Background processes don't persist in Replit - must keep terminal open

**GeoJSON endpoints return HTML errors:**
- Check Laravel logs for PHP errors
- Verify database has seeded data: `cd api && php artisan db:seed`
- Ensure PostGIS extension is installed

**Map Console shows "Loading..." forever:**
- Open browser DevTools Console to see React Query errors
- Verify both Express and Laravel are running
- Check network tab for failed API requests

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
- Method-specific RBAC enforcement (GET=view, POST=create, PATCH/PUT=edit, DELETE=delete)
- Audit logging on all POST/PUT/PATCH/DELETE operations
- Comprehensive security scanning workflow (SAST, dependency scanning, secrets detection)
- PHPStan static analysis for code quality

**Module 02 Implementation Details:**

*Import/Export Features:*
- GeoJSON import: Max 500 features (schemes/DMAs), 1000 (facilities), 10MB file limit
- CSV export: Preserves UUIDs, includes centroid coordinates or WKT geometry
- Validation: Geometry type checks, required field validation, tenant isolation
- All routes authenticated with permission-based access control

*RBAC Permission Structure:*
- Granular permissions: view/create/edit/delete for schemes, DMAs, facilities
- Special permissions: 'import spatial data', 'export spatial data'
- 7 Roles: Super Admin, Admin, Manager, Operator, Viewer, Security Officer, Privacy Officer
- Routes split by HTTP method with exact permission requirements (no OR logic)

*Audit Trail:*
- AuditMiddleware captures: user_id, tenant_id, action, entity_type, entity_id, changes, IP, user_agent
- Automatic logging of all mutations (POST/PUT/PATCH/DELETE)
- Entity-level audit service available for fine-grained tracking

*API Documentation:*
- darkaonline/l5-swagger package installed
- OpenAPI 3.0 annotations configured
- Base documentation at /api/documentation
- Tags: Schemes, DMAs, Facilities, GIS, Auth

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