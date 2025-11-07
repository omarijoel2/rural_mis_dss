<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DmaController;
use App\Http\Controllers\Api\DsrController;
use App\Http\Controllers\Api\FacilityController;
use App\Http\Controllers\Api\KmsController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\PipelineController;
use App\Http\Controllers\Api\RbacController;
use App\Http\Controllers\Api\SchemeController;
use App\Http\Controllers\Api\SecurityAlertController;
use App\Http\Controllers\Api\ZoneController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'service' => 'Rural Water Supply MIS/DSS API',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::prefix('v1/auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verify-2fa', [AuthController::class, 'verifyTwoFactor']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/tenants', [AuthController::class, 'getTenants']);
        Route::post('/switch-tenant', [AuthController::class, 'switchTenant']);
        
        Route::post('/2fa/enroll', [AuthController::class, 'enrollTwoFactor']);
        Route::post('/2fa/enable', [AuthController::class, 'enableTwoFactor']);
        Route::post('/2fa/disable', [AuthController::class, 'disableTwoFactor']);
    });
});

Route::prefix('v1/gis')->group(function () {
    Route::get('/schemes/geojson', [SchemeController::class, 'geojson']);
    Route::get('/dmas/geojson', [DmaController::class, 'geojson']);
    Route::get('/facilities/geojson', [FacilityController::class, 'geojson']);
});

Route::prefix('v1')->middleware(['auth:sanctum', 'audit'])->group(function () {
    Route::apiResource('organizations', OrganizationController::class);
    
    Route::prefix('schemes')->group(function () {
        Route::get('/', [SchemeController::class, 'index'])->middleware('permission:view schemes');
        Route::post('/', [SchemeController::class, 'store'])->middleware('permission:create schemes');
        Route::get('/{scheme}', [SchemeController::class, 'show'])->middleware('permission:view schemes');
        Route::patch('/{scheme}', [SchemeController::class, 'update'])->middleware('permission:edit schemes');
        Route::put('/{scheme}', [SchemeController::class, 'update'])->middleware('permission:edit schemes');
        Route::delete('/{scheme}', [SchemeController::class, 'destroy'])->middleware('permission:delete schemes');
    });
    
    Route::prefix('facilities')->group(function () {
        Route::get('/', [FacilityController::class, 'index'])->middleware('permission:view facilities');
        Route::post('/', [FacilityController::class, 'store'])->middleware('permission:create facilities');
        Route::get('/{facility}', [FacilityController::class, 'show'])->middleware('permission:view facilities');
        Route::patch('/{facility}', [FacilityController::class, 'update'])->middleware('permission:edit facilities');
        Route::put('/{facility}', [FacilityController::class, 'update'])->middleware('permission:edit facilities');
        Route::delete('/{facility}', [FacilityController::class, 'destroy'])->middleware('permission:delete facilities');
    });
    
    Route::prefix('dmas')->group(function () {
        Route::get('/', [DmaController::class, 'index'])->middleware('permission:view dmas');
        Route::post('/', [DmaController::class, 'store'])->middleware('permission:create dmas');
        Route::get('/{dma}', [DmaController::class, 'show'])->middleware('permission:view dmas');
        Route::patch('/{dma}', [DmaController::class, 'update'])->middleware('permission:edit dmas');
        Route::put('/{dma}', [DmaController::class, 'update'])->middleware('permission:edit dmas');
        Route::delete('/{dma}', [DmaController::class, 'destroy'])->middleware('permission:delete dmas');
    });
    
    Route::apiResource('pipelines', PipelineController::class);
    Route::apiResource('zones', ZoneController::class);
    Route::apiResource('addresses', AddressController::class);

    Route::prefix('gis')->group(function () {
        Route::post('/schemes/import', [SchemeController::class, 'importGeojson'])->middleware('permission:import spatial data');
        Route::get('/schemes/export', [SchemeController::class, 'export'])->middleware('permission:export spatial data');
        
        Route::post('/dmas/import', [DmaController::class, 'importGeojson'])->middleware('permission:import spatial data');
        Route::get('/dmas/export', [DmaController::class, 'export'])->middleware('permission:export spatial data');
        
        Route::post('/facilities/import', [FacilityController::class, 'importGeojson'])->middleware('permission:import spatial data');
        Route::get('/facilities/export', [FacilityController::class, 'export'])->middleware('permission:export spatial data');
        
        Route::get('/layers', function (Request $request) {
            return response()->json([
                'layers' => [
                    [
                        'id' => 'schemes',
                        'name' => 'Water Supply Schemes',
                        'type' => 'fill',
                        'source' => url('/api/v1/gis/schemes/geojson'),
                        'paint' => [
                            'fill-color' => ['match', ['get', 'status'], 'active', '#22c55e', 'planning', '#3b82f6', 'decommissioned', '#94a3b8', '#6b7280'],
                            'fill-opacity' => 0.6,
                            'fill-outline-color' => '#000000',
                        ],
                    ],
                    [
                        'id' => 'dmas',
                        'name' => 'District Metered Areas',
                        'type' => 'fill',
                        'source' => url('/api/v1/gis/dmas/geojson'),
                        'paint' => [
                            'fill-color' => ['match', ['get', 'status'], 'active', '#8b5cf6', 'planned', '#06b6d4', 'retired', '#94a3b8', '#6b7280'],
                            'fill-opacity' => 0.5,
                            'fill-outline-color' => '#000000',
                        ],
                    ],
                    [
                        'id' => 'facilities',
                        'name' => 'Facilities',
                        'type' => 'circle',
                        'source' => url('/api/v1/gis/facilities/geojson'),
                        'paint' => [
                            'circle-radius' => 6,
                            'circle-color' => ['match', ['get', 'type'], 'source', '#10b981', 'treatment', '#3b82f6', 'pumpstation', '#f59e0b', 'reservoir', '#06b6d4', '#6b7280'],
                            'circle-stroke-width' => 2,
                            'circle-stroke-color' => '#ffffff',
                        ],
                    ],
                ],
            ]);
        });
    });

    Route::prefix('security')->group(function () {
        Route::get('/audit', [AuditController::class, 'index']);
        Route::get('/audit/entity/{entityType}/{entityId}', [AuditController::class, 'getEntityAuditTrail']);
        Route::get('/audit/high-severity', [AuditController::class, 'getHighSeverityEvents']);
        Route::get('/audit/action/{action}', [AuditController::class, 'getEventsByAction']);
        Route::get('/audit/failed-auth', [AuditController::class, 'getFailedAuthAttempts']);
        Route::get('/audit/suspicious-activity', [AuditController::class, 'detectSuspiciousActivity']);

        Route::get('/rbac/roles', [RbacController::class, 'getRoles']);
        Route::post('/rbac/roles', [RbacController::class, 'createRole']);
        Route::put('/rbac/roles/{id}', [RbacController::class, 'updateRole']);
        Route::delete('/rbac/roles/{id}', [RbacController::class, 'deleteRole']);
        Route::get('/rbac/permissions', [RbacController::class, 'getPermissions']);
        Route::post('/rbac/users/{userId}/roles', [RbacController::class, 'assignRole']);
        Route::delete('/rbac/users/{userId}/roles', [RbacController::class, 'removeRole']);
        Route::get('/rbac/users/{userId}/permissions', [RbacController::class, 'getUserPermissions']);

        Route::get('/dsr', [DsrController::class, 'index']);
        Route::post('/dsr', [DsrController::class, 'store']);
        Route::get('/dsr/{id}', [DsrController::class, 'show']);
        Route::post('/dsr/{id}/process-access', [DsrController::class, 'processAccess']);
        Route::post('/dsr/{id}/process-deletion', [DsrController::class, 'processDeletion']);
        Route::post('/dsr/{id}/process-rectification', [DsrController::class, 'processRectification']);
        Route::post('/dsr/{id}/reject', [DsrController::class, 'reject']);

        Route::get('/alerts', [SecurityAlertController::class, 'index']);
        Route::get('/alerts/unacknowledged', [SecurityAlertController::class, 'getUnacknowledged']);
        Route::get('/alerts/high-severity', [SecurityAlertController::class, 'getHighSeverity']);
        Route::get('/alerts/statistics', [SecurityAlertController::class, 'getStatistics']);
        Route::post('/alerts/{id}/acknowledge', [SecurityAlertController::class, 'acknowledge']);
        Route::post('/alerts/{id}/resolve', [SecurityAlertController::class, 'resolve']);

        Route::get('/kms/keys', [KmsController::class, 'index']);
        Route::post('/kms/keys', [KmsController::class, 'generateKey']);
        Route::post('/kms/keys/{id}/rotate', [KmsController::class, 'rotateKey']);
        Route::get('/kms/keys/needing-rotation', [KmsController::class, 'getKeysNeedingRotation']);
        Route::post('/kms/keys/rotate-expired', [KmsController::class, 'rotateAllExpiredKeys']);
        Route::post('/kms/encrypt', [KmsController::class, 'encrypt']);
        Route::post('/kms/decrypt', [KmsController::class, 'decrypt']);
    });

    Route::prefix('assets')->group(function () {
        Route::get('/', [\App\Http\Controllers\API\V1\AssetController::class, 'index'])->middleware('permission:view assets');
        Route::post('/', [\App\Http\Controllers\API\V1\AssetController::class, 'store'])->middleware('permission:create assets');
        Route::get('/tree', [\App\Http\Controllers\API\V1\AssetController::class, 'tree'])->middleware('permission:view assets');
        Route::get('/nearby', [\App\Http\Controllers\API\V1\AssetController::class, 'nearbyAssets'])->middleware('permission:view assets');
        Route::get('/{asset}', [\App\Http\Controllers\API\V1\AssetController::class, 'show'])->middleware('permission:view assets');
        Route::get('/{asset}/descendants', [\App\Http\Controllers\API\V1\AssetController::class, 'descendants'])->middleware('permission:view assets');
        Route::get('/{asset}/ancestors', [\App\Http\Controllers\API\V1\AssetController::class, 'ancestors'])->middleware('permission:view assets');
        Route::get('/{asset}/location-history', [\App\Http\Controllers\API\V1\AssetController::class, 'locationHistory'])->middleware('permission:view assets');
        Route::get('/{asset}/utilization', [\App\Http\Controllers\API\V1\AssetController::class, 'utilization'])->middleware('permission:view assets');
        Route::patch('/{asset}', [\App\Http\Controllers\API\V1\AssetController::class, 'update'])->middleware('permission:edit assets');
        Route::put('/{asset}', [\App\Http\Controllers\API\V1\AssetController::class, 'update'])->middleware('permission:edit assets');
        Route::delete('/{asset}', [\App\Http\Controllers\API\V1\AssetController::class, 'destroy'])->middleware('permission:delete assets');
    });

    Route::prefix('work-orders')->group(function () {
        Route::get('/', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'index'])->middleware('permission:view work orders');
        Route::post('/', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'store'])->middleware('permission:create work orders');
        Route::get('/overdue', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'overdue'])->middleware('permission:view work orders');
        Route::get('/stats', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'stats'])->middleware('permission:view work orders');
        Route::get('/{workOrder}', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'show'])->middleware('permission:view work orders');
        Route::patch('/{workOrder}', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'update'])->middleware('permission:edit work orders');
        Route::put('/{workOrder}', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'update'])->middleware('permission:edit work orders');
        Route::delete('/{workOrder}', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'destroy'])->middleware('permission:delete work orders');
        Route::post('/{workOrder}/assign', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'assign'])->middleware('permission:edit work orders');
        Route::post('/{workOrder}/start', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'start'])->middleware('permission:edit work orders');
        Route::post('/{workOrder}/complete', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'complete'])->middleware('permission:edit work orders');
        Route::post('/{workOrder}/cancel', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'cancel'])->middleware('permission:edit work orders');
        Route::post('/{workOrder}/parts', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'addParts'])->middleware('permission:edit work orders');
        Route::post('/{workOrder}/labor', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'addLabor'])->middleware('permission:edit work orders');
    });
});
