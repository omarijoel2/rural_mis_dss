# Decision Support & Advanced Analytics Module - Integration Guide

## Current Status

The DSA module includes 7 frontend pages created for the following features:
1. **Forecast Studio** - Time-series forecasting with ML models
2. **Scenario Workbench** - Stress testing and resilience planning  
3. **Optimization Console** - AI-powered resource optimization
4. **Anomalies Inbox** - ML-based anomaly detection and triage
5. **Aquifer Dashboard** - Hydrogeological analytics
6. **Tariff Sandbox** - Revenue modeling and equity analysis
7. **EWS Console** - Early warning system with threshold rules

## Known Issues & Required Improvements

### 1. Defensive Rendering (CRITICAL)

**Problem**: Pages currently lack comprehensive loading/error states for all async data sources.

**Required Changes**:
- Extract `isLoading` and `error` from ALL useQuery hooks
- Add loading spinners for each data dependency
- Add error messages with retry buttons
- Guard all data access with null checks

**Pattern to Apply**:
```typescript
const { data, isLoading, error } = useQuery({...});

// In JSX:
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage error={error} />}
{data && data.items && (
  // Only render when data is confirmed available
)}
```

**Files Needing Updates**:
- [ ] ForecastStudioPage.tsx (partially done)
- [ ] ScenarioWorkbenchPage.tsx
- [ ] OptimizationConsolePage.tsx
- [ ] AnomaliesInboxPage.tsx
- [ ] AquiferDashboardPage.tsx
- [ ] TariffSandboxPage.tsx
- [ ] EWSConsolePage.tsx

### 2. DTO Transformation Layers (CRITICAL)

**Problem**: Form submissions send UI state directly to API without transformation, causing 422/500 errors.

**Required Changes**:
- Define TypeScript interfaces matching backend DTOs
- Create transformation functions: `formDataToDTO()` and `dtoToFormData()`
- Validate payloads before submission
- Add success/error handling with proper user feedback

**Example**:
```typescript
interface ForecastJobDTO {
  metric: string;
  scheme_id: string;
  horizon_days: number;
  model_family: 'arima' | 'ets' | 'prophet' | 'lstm' | 'auto';
  exogenous_drivers?: string[];
}

const formDataToDTO = (formData: typeof formData): ForecastJobDTO => ({
  metric: formData.metric,
  scheme_id: formData.entity_id, // Transform field names
  horizon_days: formData.horizon,
  model_family: formData.model,
  exogenous_drivers: formData.exogenous_drivers.length > 0 
    ? formData.exogenous_drivers 
    : undefined,
});
```

**Files Needing DTO Mappers**:
- [ ] ForecastStudioPage.tsx (forecast job creation)
- [ ] ScenarioWorkbenchPage.tsx (scenario creation)
- [ ] OptimizationConsolePage.tsx (optimization runs)
- [ ] TariffSandboxPage.tsx (tariff simulations)
- [ ] EWSConsolePage.tsx (rule creation)

### 3. Demonstration Data Handling

**Problem**: Pages use hard-coded placeholder data for visualizations, misleading users.

**Options**:
A. **Feature Flag Approach** (Recommended):
```typescript
const DEMO_MODE = import.meta.env.VITE_DSA_DEMO_MODE === 'true';

const chartData = DEMO_MODE 
  ? DEMO_AFFORDABILITY_DATA 
  : apiData?.affordability || [];
```

B. **Comment-Based Approach**:
```typescript
// DEMO DATA - Replace with API integration in Tasks 18-23
const affordabilityData = [
  { quintile: 'Q1', current: 8, proposed: 6 },
  ...
];
```

C. **API-First Approach** (Best for production):
- Remove all static data
- Show empty states with "No data available" messages
- Only display charts when API returns data

**Files with Demonstration Data**:
- [ ] AquiferDashboardPage.tsx (trend data, cross-section profile)
- [ ] TariffSandboxPage.tsx (affordability data, revenue data)
- [ ] ForecastStudioPage.tsx (combined chart data)
- [ ] ScenarioWorkbenchPage.tsx (comparison data, radar data)

### 4. Type Safety Improvements

**Problem**: Excessive use of `(res as any)` type assertions bypasses TypeScript safety.

**Required Changes**:
- Define proper response interfaces for all API endpoints
- Use typed API client wrapper
- Add runtime validation with Zod schemas

**Example**:
```typescript
interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    total: number;
  };
}

interface ForecastJob {
  id: string;
  metric: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scores?: {
    mape: number;
    rmse: number;
    mae: number;
  };
}

const { data } = await apiClient.get<ApiResponse<ForecastJob[]>>('/api/v1/dsa/forecast');
```

## Backend Integration Tasks (Not Yet Started)

These pages await the following backend implementation tasks:

- [ ] **Task 18**: Forecast API endpoints (`/api/v1/dsa/forecast`)
- [ ] **Task 19**: Scenario simulation API (`/api/v1/dsa/scenarios`)
- [ ] **Task 20**: Optimization engine API (`/api/v1/dsa/optimize`)
- [ ] **Task 21**: Anomaly detection API (`/api/v1/dsa/anomalies`)
- [ ] **Task 22**: Hydrogeological API (`/api/v1/dsa/hydro`)
- [ ] **Task 23**: Tariff simulation API (`/api/v1/dsa/tariffs`)
- [ ] **Task 24**: EWS rules & alerts API (`/api/v1/dsa/ews`)

## Testing Requirements

Before marking DSA pages as production-ready:

1. **Unit Tests**: Test DTO transformations and data guards
2. **Integration Tests**: Mock API responses and test error handling
3. **E2E Tests**: Full user workflows with Playwright
4. **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation
5. **Performance**: Lazy loading for heavy visualizations

## Migration Path

**Phase 1: Defensive Rendering** (Immediate)
- Add loading/error states to all pages
- Guard all data access with null checks
- Add empty state handling

**Phase 2: DTO & Type Safety** (Before backend integration)
- Define all DTOs matching backend contracts
- Implement transformation layers
- Add runtime validation

**Phase 3: Backend Integration** (Tasks 18-24)
- Connect pages to real APIs
- Replace demonstration data
- End-to-end testing

**Phase 4: Production Hardening**
- Performance optimization
- Error tracking integration
- User acceptance testing

## Notes

- All pages follow established MIS patterns (TanStack Query, Radix UI, Recharts)
- Navigation integration already complete in sidebar
- Database migrations created (`2025_11_21_create_dsa_tables.php`)
- Pages designed for non-technical water utility staff
