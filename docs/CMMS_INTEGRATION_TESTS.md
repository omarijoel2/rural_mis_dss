# CMMS Integration Tests

## Overview
This document outlines integration tests for the CMMS (Computerized Maintenance Management System) module, covering frontend routes, RBAC permissions, and API integration.

## Testing Infrastructure Status

**Current State**: ✅ Automated testing framework is installed and configured!

**Installed Dependencies**:
- vitest - Test runner
- @testing-library/react - React component testing utilities
- @testing-library/user-event - User interaction simulation
- @testing-library/jest-dom - DOM matchers
- @vitest/ui - Visual test UI
- happy-dom - Lightweight DOM implementation

**Configuration Files**:
- `vitest.config.ts` - Vitest configuration
- `client/src/test/setup.ts` - Test environment setup

**Running Tests**:
```bash
# Run all tests
npx vitest

# Run tests once
npx vitest run

# Run tests with UI
npx vitest --ui
```

**Test Location**: `client/src/__tests__/cmms-integration.test.tsx`

## Frontend Route Tests

### 1. Navigation Tests
Test that all CMMS routes are accessible with proper permissions:

```typescript
describe('CMMS Routes', () => {
  it('should redirect /cmms to /cmms/dashboard', () => {
    // Navigate to /cmms
    // Assert redirects to /cmms/dashboard
  });

  it('should show dashboard with view assets permission', () => {
    // Login with user having 'view assets' permission
    // Navigate to /cmms/dashboard
    // Assert dashboard content is visible
  });

  it('should show assets page with view assets permission', () => {
    // Login with user having 'view assets' permission
    // Navigate to /cmms/assets
    // Assert assets list is visible
  });

  it('should show work orders page with view work orders permission', () => {
    // Login with user having 'view work orders' permission
    // Navigate to /cmms/work-orders
    // Assert work orders list is visible
  });

  it('should show parts page with view parts inventory permission', () => {
    // Login with user having 'view parts inventory' permission
    // Navigate to /cmms/parts
    // Assert parts list is visible
  });

  it('should show asset map with view assets permission', () => {
    // Login with user having 'view assets' permission
    // Navigate to /cmms/map
    // Assert map is rendered
  });

  it('should show asset detail page', () => {
    // Login with proper permissions
    // Navigate to /cmms/assets/1
    // Assert asset details are displayed
  });
});
```

### 2. RBAC Permission Tests

```typescript
describe('CMMS RBAC', () => {
  it('should hide menu items without permission', () => {
    // Login with user having no CMMS permissions
    // Navigate to /cmms
    // Assert navigation sidebar has no items
  });

  it('should show only accessible menu items', () => {
    // Login with user having only 'view assets' permission
    // Navigate to /cmms
    // Assert Assets and Dashboard are visible
    // Assert Work Orders and Parts are hidden
  });

  it('should block access to routes without permission', () => {
    // Login with user having only 'view assets' permission
    // Navigate to /cmms/work-orders
    // Assert redirected or error message shown
  });
});
```

### 3. CRUD Form Tests

```typescript
describe('CMMS Forms', () => {
  describe('Asset Form', () => {
    it('should create new asset with create assets permission', async () => {
      // Login with 'create assets' permission
      // Navigate to /cmms/assets
      // Click "Add Asset" button
      // Fill form with valid data
      // Submit form
      // Assert success message
      // Assert new asset appears in list
    });

    it('should edit existing asset with edit assets permission', async () => {
      // Login with 'edit assets' permission
      // Navigate to /cmms/assets
      // Click edit button on first asset
      // Modify form data
      // Submit form
      // Assert success message
      // Assert changes are reflected
    });

    it('should validate required fields', async () => {
      // Open asset form
      // Submit without filling required fields
      // Assert validation errors are shown
    });
  });

  describe('Work Order Form', () => {
    it('should create new work order', async () => {
      // Login with 'create work orders' permission
      // Navigate to /cmms/work-orders
      // Click "Create Work Order" button
      // Fill form with valid data
      // Submit form
      // Assert success message
    });

    it('should assign work order to user', async () => {
      // Open work order form
      // Fill form and assign to user ID
      // Submit form
      // Assert work order is assigned
    });
  });

  describe('Part Form', () => {
    it('should create new part', async () => {
      // Login with 'create parts inventory' permission
      // Navigate to /cmms/parts
      // Click "Add Part" button
      // Fill form with valid data
      // Submit form
      // Assert success message
    });
  });
});
```

### 4. API Integration Tests

```typescript
describe('CMMS API Integration', () => {
  it('should load assets from API', async () => {
    // Mock API response with assets data
    // Navigate to /cmms/assets
    // Assert API was called
    // Assert assets are displayed
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error response
    // Navigate to /cmms/assets
    // Assert error message is shown
  });

  it('should filter assets by status', async () => {
    // Navigate to /cmms/assets
    // Select status filter
    // Assert API called with filter params
    // Assert filtered results displayed
  });

  it('should paginate assets', async () => {
    // Navigate to /cmms/assets
    // Click next page button
    // Assert API called with page=2
    // Assert next page data displayed
  });
});
```

### 5. Map Integration Tests

```typescript
describe('CMMS Map', () => {
  it('should render map with asset markers', async () => {
    // Navigate to /cmms/map
    // Assert MapLibre GL map is initialized
    // Assert asset markers are displayed
  });

  it('should show asset details on marker click', async () => {
    // Navigate to /cmms/map
    // Click on asset marker
    // Assert asset details popup is shown
  });

  it('should fit bounds to all assets', async () => {
    // Navigate to /cmms/map
    // Assert map zooms to show all assets
  });
});
```

## Test Execution

### Manual Testing Checklist

#### Authentication & Permissions
- [ ] Login as Super Admin - verify all menu items visible
- [ ] Login as Viewer - verify read-only access
- [ ] Login as user without CMMS permissions - verify no access

#### Assets Module
- [ ] View assets list
- [ ] Search assets by code/name
- [ ] Filter assets by status
- [ ] Filter assets by class
- [ ] Paginate through assets
- [ ] Create new asset
- [ ] Edit existing asset
- [ ] View asset details
- [ ] View asset work orders

#### Work Orders Module
- [ ] View work orders list
- [ ] Search work orders
- [ ] Filter by status/kind/priority
- [ ] Create new work order
- [ ] Edit work order
- [ ] Assign work order to user

#### Parts Module
- [ ] View parts list
- [ ] Search parts
- [ ] Create new part
- [ ] Edit existing part
- [ ] View stock levels
- [ ] Identify low stock items

#### Map Module
- [ ] Load map with assets
- [ ] Click asset marker
- [ ] View asset details popup
- [ ] Navigate to asset from map

#### Dashboard
- [ ] View KPI cards
- [ ] Verify counts are accurate
- [ ] Check quick actions links

## API Endpoints to Test

### Assets
- GET /api/v1/assets - List assets
- GET /api/v1/assets/:id - Get asset
- POST /api/v1/assets - Create asset
- PUT /api/v1/assets/:id - Update asset
- DELETE /api/v1/assets/:id - Delete asset

### Work Orders
- GET /api/v1/work-orders - List work orders
- GET /api/v1/work-orders/:id - Get work order
- POST /api/v1/work-orders - Create work order
- PUT /api/v1/work-orders/:id - Update work order
- POST /api/v1/work-orders/:id/assign - Assign work order
- POST /api/v1/work-orders/:id/start - Start work order
- POST /api/v1/work-orders/:id/complete - Complete work order

### Parts
- GET /api/v1/parts - List parts
- GET /api/v1/parts/:id - Get part
- POST /api/v1/parts - Create part
- PUT /api/v1/parts/:id - Update part

### Asset Classes
- GET /api/v1/asset-classes - List asset classes

## Expected Behaviors

### Permission-Based Access
- Users without 'view assets' cannot access /cmms/assets
- Users without 'view work orders' cannot access /cmms/work-orders
- Users without 'view parts inventory' cannot access /cmms/parts
- Create/Edit/Delete actions require corresponding permissions

### Data Validation
- Asset code is required
- Asset name is required
- Asset class is required
- Work order title is required
- Part code is required
- Part name is required

### Error Handling
- Show user-friendly error messages on API failures
- Display validation errors on form submission
- Handle network errors gracefully
- Show loading states during API calls

## Test Data Requirements

### Seed Data Needed
- 10+ assets with different statuses
- 5+ asset classes
- 10+ work orders in different states
- 10+ parts with varying stock levels
- Users with different permission sets

### Test Accounts
- Super Admin (all permissions)
- Manager (view/create/edit permissions)
- Viewer (view-only permissions)
- User without CMMS permissions

## Success Criteria
All tests should pass with:
- ✅ Proper RBAC enforcement
- ✅ Correct data display
- ✅ Form validation working
- ✅ API integration functional
- ✅ Error handling in place
- ✅ Loading states shown
- ✅ User feedback (toasts, messages)
