# Mobile App - Laravel API Requirements

This document outlines all the API endpoints required for the mobile app to function properly with the Laravel backend.

## Overview

The mobile app uses a multi-tenant, offline-first architecture. All requests must include the `X-Tenant-ID` header for tenant isolation. The sync engine handles both pulling data from the server and pushing offline mutations (create, update, delete operations).

## Required Endpoints

### 1. Authentication Endpoints
These already exist in the API and are used by the mobile app.

```
POST /api/v1/auth/login
- Body: { email, password }
- Returns: { token, refresh_token, user }

POST /api/v1/auth/refresh
- Returns: { token }

POST /api/v1/auth/logout
- Returns: Success message

GET /api/v1/auth/tenants
- Returns: [ { id, name, county } ]
```

### 2. Customer Endpoints

**GET /api/v1/customers**
- Query Params: `per_page=1000`
- Headers: `X-Tenant-ID: {tenant_id}`
- Returns:
```json
{
  "data": [
    {
      "id": "uuid",
      "account_number": "ACC-001",
      "name": "Customer Name",
      "email": "email@example.com",
      "phone_number": "+254712345678",
      "address": "Physical address",
      "status": "active|suspended|disconnected",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**PUT /api/v1/customers/{id}**
- Headers: `X-Tenant-ID: {tenant_id}`
- Body: Partial customer object with changed fields
- Returns: Updated customer object

**POST /api/v1/customers**
- Headers: `X-Tenant-ID: {tenant_id}`
- Body: New customer object
- Returns: Created customer (with id)

**DELETE /api/v1/customers/{id}**
- Headers: `X-Tenant-ID: {tenant_id}`
- Returns: 204 No Content

### 3. Work Orders Endpoints

**GET /api/v1/work-orders**
- Query Params: `per_page=1000`
- Headers: `X-Tenant-ID: {tenant_id}`
- Returns:
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "WO-001",
      "title": "Repair pump at station X",
      "description": "Detailed work order description",
      "status": "open|in_progress|completed|cancelled",
      "priority": "low|medium|high|urgent",
      "assigned_to": "user@example.com",
      "due_date": "2025-12-31",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**PUT /api/v1/work-orders/{id}**
- Headers: `X-Tenant-ID: {tenant_id}`
- Body: Partial work order object with changed fields
- Returns: Updated work order

**POST /api/v1/work-orders**
- Headers: `X-Tenant-ID: {tenant_id}`
- Body: New work order object
- Returns: Created work order

**DELETE /api/v1/work-orders/{id}**
- Headers: `X-Tenant-ID: {tenant_id}`
- Returns: 204 No Content

**POST /api/v1/work-orders/{id}/photos** (NEW)
- Headers: `X-Tenant-ID: {tenant_id}`, `Content-Type: multipart/form-data`
- Body: `photo` (file), `description` (optional)
- Returns: `{ data: { url, uploaded_at } }`

### 4. Assets Endpoints

**GET /api/v1/assets**
- Query Params: `per_page=1000`
- Headers: `X-Tenant-ID: {tenant_id}`
- Returns:
```json
{
  "data": [
    {
      "id": "uuid",
      "asset_tag": "PUMP-001",
      "name": "Main Pump Station",
      "category": "pump|pipeline|tank|meter|other",
      "status": "operational|maintenance|repair|decommissioned",
      "location": "Zone A, DMA 1",
      "latitude": -1.286389,
      "longitude": 36.817223,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**PUT /api/v1/assets/{id}**
- Headers: `X-Tenant-ID: {tenant_id}`
- Body: Partial asset object with changed fields (including latitude, longitude for GPS updates)
- Returns: Updated asset

**POST /api/v1/assets**
- Headers: `X-Tenant-ID: {tenant_id}`
- Body: New asset object
- Returns: Created asset

**DELETE /api/v1/assets/{id}**
- Headers: `X-Tenant-ID: {tenant_id}`
- Returns: 204 No Content

### 5. Water Quality Tests Endpoints (NEW)

**GET /api/v1/water-quality-tests**
- Query Params: `per_page=1000`
- Headers: `X-Tenant-ID: {tenant_id}`
- Returns:
```json
{
  "data": [
    {
      "id": "uuid",
      "sample_id": "S-20250122-001",
      "location": "Main Source",
      "ph": 7.2,
      "turbidity": 2.5,
      "chlorine": 0.5,
      "e_coli": "Not Detected",
      "test_date": "2025-01-22T10:30:00Z",
      "tested_by": "Field Officer Name",
      "created_at": "2025-01-22T10:30:00Z",
      "updated_at": "2025-01-22T10:30:00Z"
    }
  ]
}
```

**POST /api/v1/water-quality-tests**
- Headers: `X-Tenant-ID: {tenant_id}`
- Body:
```json
{
  "sample_id": "S-20250122-001",
  "location": "Main Source",
  "ph": 7.2,
  "turbidity": 2.5,
  "chlorine": 0.5,
  "e_coli": "Not Detected",
  "test_date": "2025-01-22T10:30:00Z",
  "tested_by": "Field Officer Name"
}
```
- Returns: Created test object

**PUT /api/v1/water-quality-tests/{id}**
- Headers: `X-Tenant-ID: {tenant_id}`
- Body: Partial test object
- Returns: Updated test

**DELETE /api/v1/water-quality-tests/{id}**
- Headers: `X-Tenant-ID: {tenant_id}`
- Returns: 204 No Content

## Implementation Notes

### Tenant Isolation

All endpoints MUST respect the `X-Tenant-ID` header and only return/modify data for that tenant. This is critical for multi-tenancy security.

```php
// In your controller
$tenantId = request()->header('X-Tenant-ID');
$data = Model::where('tenant_id', $tenantId)->get();
```

### Data Validation

Ensure proper validation for all incoming data:

```php
$validated = $request->validate([
    'field_name' => 'required|string|max:255',
    'numeric_field' => 'nullable|numeric',
    'date_field' => 'required|date',
    // ... other rules
]);
```

### Error Responses

Return appropriate HTTP status codes:
- `200` - Success (GET)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (no token)
- `403` - Forbidden (wrong tenant)
- `404` - Not Found
- `500` - Server Error

### Photo Upload Implementation

Work orders need a photo upload endpoint that:
1. Validates the uploaded file
2. Stores it securely
3. Associates it with the work order
4. Returns a URL to the stored photo

```php
Route::post('/work-orders/{id}/photos', [WorkOrderController::class, 'uploadPhoto']);
```

## Mobile App Sync Flow

1. **Pull (Download)**: Mobile app calls `GET /api/v1/{entity}?per_page=1000` to get latest data
2. **Process Offline**: User makes changes offline (stored in WatermelonDB)
3. **Push (Upload)**: When online, mobile app sends queued mutations:
   - CREATE: `POST /api/v1/{entity}` 
   - UPDATE: `PUT /api/v1/{entity}/{id}`
   - DELETE: `DELETE /api/v1/{entity}/{id}`
4. **Retry**: Failed mutations retry up to 5 times automatically

## Headers Required

All authenticated requests must include:

```
Authorization: Bearer {token}
X-Tenant-ID: {tenant_id}
Content-Type: application/json
```

## Testing

Use this curl command to test endpoints:

```bash
curl -X GET http://localhost:8000/api/v1/customers \
  -H "Authorization: Bearer {token}" \
  -H "X-Tenant-ID: {tenant_id}" \
  -H "Content-Type: application/json"
```

## Database Models Required

Ensure your Laravel models exist with these relationships:

```php
class Customer extends Model {
    protected $fillable = ['account_number', 'name', 'email', 'phone_number', 'address', 'status', 'tenant_id'];
}

class WorkOrder extends Model {
    protected $fillable = ['code', 'title', 'description', 'status', 'priority', 'assigned_to', 'due_date', 'tenant_id'];
}

class Asset extends Model {
    protected $fillable = ['asset_tag', 'name', 'category', 'status', 'location', 'latitude', 'longitude', 'tenant_id'];
}

class WaterQualityTest extends Model {
    protected $fillable = ['sample_id', 'location', 'ph', 'turbidity', 'chlorine', 'e_coli', 'test_date', 'tested_by', 'tenant_id'];
}
```

## Migration Script

Create migrations for water quality tests if not already present:

```php
Schema::create('water_quality_tests', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->string('sample_id');
    $table->string('location');
    $table->float('ph')->nullable();
    $table->float('turbidity')->nullable();
    $table->float('chlorine')->nullable();
    $table->string('e_coli')->nullable();
    $table->dateTime('test_date');
    $table->string('tested_by');
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('organizations');
    $table->index(['tenant_id', 'test_date']);
});
```

## Next Steps

1. ✅ Create WaterQualityTestController 
2. Add water quality routes to api.php
3. Ensure all endpoints respect X-Tenant-ID header
4. Add photo upload endpoint to WorkOrderController
5. Test all endpoints with Postman or curl
6. Deploy to production

---

**API Version**: v1  
**Last Updated**: November 22, 2025  
**Mobile App Version**: 1.0.0
