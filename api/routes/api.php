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
use App\Http\Controllers\Api\V1\Operations\EventController;
use App\Http\Controllers\Api\Crm\CustomerController;
use App\Http\Controllers\Api\Crm\PremiseController;
use App\Http\Controllers\Api\Crm\MeterController;
use App\Http\Controllers\Api\Crm\Account360Controller;
use App\Http\Controllers\Api\Crm\RaCaseController;
use App\Http\Controllers\Api\Crm\RaRuleController;
use App\Http\Controllers\Api\Crm\DunningController;
use App\Http\Controllers\Api\Crm\ImportController;
use App\Http\Controllers\Api\Crm\InteractionController;
use App\Http\Controllers\Api\Crm\ComplaintController;
use App\Http\Controllers\Api\Hydromet\SourceController;
use App\Http\Controllers\Api\Hydromet\StationController;
use App\Http\Controllers\Api\V1\Costing\BudgetController;
use App\Http\Controllers\Api\V1\Costing\AllocationController;
use App\Http\Controllers\Api\V1\Costing\CostingKpiController;
use App\Http\Controllers\Api\ZoneController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\InvestmentController;
use App\Http\Controllers\LandController;
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

Route::prefix('v1')->group(function () {
    Route::apiResource('organizations', OrganizationController::class);
    
    Route::prefix('schemes')->group(function () {
        Route::get('/', [SchemeController::class, 'index']);
        Route::post('/', [SchemeController::class, 'store']);
        Route::get('/{scheme}', [SchemeController::class, 'show']);
        Route::patch('/{scheme}', [SchemeController::class, 'update']);
        Route::put('/{scheme}', [SchemeController::class, 'update']);
        Route::delete('/{scheme}', [SchemeController::class, 'destroy']);
    });
    
    Route::prefix('facilities')->group(function () {
        Route::get('/', [FacilityController::class, 'index']);
        Route::post('/', [FacilityController::class, 'store']);
        Route::get('/{facility}', [FacilityController::class, 'show']);
        Route::patch('/{facility}', [FacilityController::class, 'update']);
        Route::put('/{facility}', [FacilityController::class, 'update']);
        Route::delete('/{facility}', [FacilityController::class, 'destroy']);
    });
    
    Route::prefix('dmas')->group(function () {
        Route::get('/', [DmaController::class, 'index']);
        Route::post('/', [DmaController::class, 'store']);
        Route::get('/{dma}', [DmaController::class, 'show']);
        Route::patch('/{dma}', [DmaController::class, 'update']);
        Route::put('/{dma}', [DmaController::class, 'update']);
        Route::delete('/{dma}', [DmaController::class, 'destroy']);
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
        
        Route::get('/tiles/schemes/{z}/{x}/{y}.mvt', [App\Http\Controllers\Api\VectorTileController::class, 'schemeTiles']);
        Route::get('/tiles/dmas/{z}/{x}/{y}.mvt', [App\Http\Controllers\Api\VectorTileController::class, 'dmaTiles']);
        Route::get('/tiles/facilities/{z}/{x}/{y}.mvt', [App\Http\Controllers\Api\VectorTileController::class, 'facilityTiles']);
        Route::get('/tiles/pipelines/{z}/{x}/{y}.mvt', [App\Http\Controllers\Api\VectorTileController::class, 'pipelineTiles']);
        Route::get('/tiles/network-nodes/{z}/{x}/{y}.mvt', [App\Http\Controllers\Api\VectorTileController::class, 'networkNodeTiles']);
        Route::get('/tiles/network-edges/{z}/{x}/{y}.mvt', [App\Http\Controllers\Api\VectorTileController::class, 'networkEdgeTiles']);
        
        Route::get('/layers', function (Request $request) {
            return response()->json([
                'layers' => [
                    [
                        'id' => 'schemes',
                        'name' => 'Water Supply Schemes',
                        'type' => 'fill',
                        'source' => url('/api/v1/gis/schemes/geojson'),
                        'tile_source' => url('/api/v1/gis/tiles/schemes/{z}/{x}/{y}.mvt'),
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
                        'tile_source' => url('/api/v1/gis/tiles/dmas/{z}/{x}/{y}.mvt'),
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
                        'tile_source' => url('/api/v1/gis/tiles/facilities/{z}/{x}/{y}.mvt'),
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
        Route::post('/{workOrder}/approve', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'approve'])->middleware('permission:edit work orders');
        Route::post('/{workOrder}/qa', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'qa'])->middleware('permission:edit work orders');
        Route::post('/{workOrder}/checklist', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'addChecklist'])->middleware('permission:edit work orders');
        Route::patch('/checklist-items/{itemId}', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'updateChecklistItem'])->middleware('permission:edit work orders');
        Route::post('/{workOrder}/attachments', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'addAttachment'])->middleware('permission:edit work orders');
        Route::post('/{workOrder}/assignments', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'addAssignment'])->middleware('permission:edit work orders');
        Route::post('/{workOrder}/comments', [\App\Http\Controllers\API\V1\WorkOrderController::class, 'addComment'])->middleware('permission:view work orders');
    });

    Route::prefix('cmms')->group(function () {
        Route::prefix('job-plans')->group(function () {
            Route::get('/', [\App\Http\Controllers\API\V1\Cmms\JobPlanController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\API\V1\Cmms\JobPlanController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\API\V1\Cmms\JobPlanController::class, 'show']);
            Route::patch('/{id}', [\App\Http\Controllers\API\V1\Cmms\JobPlanController::class, 'update']);
            Route::put('/{id}', [\App\Http\Controllers\API\V1\Cmms\JobPlanController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\API\V1\Cmms\JobPlanController::class, 'destroy']);
            Route::post('/{id}/version', [\App\Http\Controllers\API\V1\Cmms\JobPlanController::class, 'createVersion']);
            Route::post('/{id}/activate', [\App\Http\Controllers\API\V1\Cmms\JobPlanController::class, 'activate']);
        });

        Route::prefix('pm')->group(function () {
            Route::get('/templates', [\App\Http\Controllers\API\V1\Cmms\PmController::class, 'index']);
            Route::post('/templates', [\App\Http\Controllers\API\V1\Cmms\PmController::class, 'store']);
            Route::get('/templates/{id}', [\App\Http\Controllers\API\V1\Cmms\PmController::class, 'show']);
            Route::patch('/templates/{id}', [\App\Http\Controllers\API\V1\Cmms\PmController::class, 'update']);
            Route::put('/templates/{id}', [\App\Http\Controllers\API\V1\Cmms\PmController::class, 'update']);
            Route::delete('/templates/{id}', [\App\Http\Controllers\API\V1\Cmms\PmController::class, 'destroy']);
            Route::post('/generate', [\App\Http\Controllers\API\V1\Cmms\PmController::class, 'generate']);
            Route::post('/logs/{logId}/defer', [\App\Http\Controllers\API\V1\Cmms\PmController::class, 'defer']);
            Route::get('/compliance', [\App\Http\Controllers\API\V1\Cmms\PmController::class, 'compliance']);
        });

        Route::prefix('condition-monitoring')->group(function () {
            Route::get('/tags', [\App\Http\Controllers\API\V1\Cmms\ConditionMonitoringController::class, 'index']);
            Route::post('/tags', [\App\Http\Controllers\API\V1\Cmms\ConditionMonitoringController::class, 'store']);
            Route::get('/tags/{id}', [\App\Http\Controllers\API\V1\Cmms\ConditionMonitoringController::class, 'show']);
            Route::patch('/tags/{id}', [\App\Http\Controllers\API\V1\Cmms\ConditionMonitoringController::class, 'update']);
            Route::put('/tags/{id}', [\App\Http\Controllers\API\V1\Cmms\ConditionMonitoringController::class, 'update']);
            Route::delete('/tags/{id}', [\App\Http\Controllers\API\V1\Cmms\ConditionMonitoringController::class, 'destroy']);
            Route::post('/tags/{tagId}/readings', [\App\Http\Controllers\API\V1\Cmms\ConditionMonitoringController::class, 'ingestReading']);
            Route::post('/alarms/{alarmId}/acknowledge', [\App\Http\Controllers\API\V1\Cmms\ConditionMonitoringController::class, 'acknowledgeAlarm']);
            Route::post('/alarms/{alarmId}/clear', [\App\Http\Controllers\API\V1\Cmms\ConditionMonitoringController::class, 'clearAlarm']);
            Route::get('/assets/{assetId}/health', [\App\Http\Controllers\API\V1\Cmms\ConditionMonitoringController::class, 'assetHealth']);
            Route::post('/rules/evaluate', [\App\Http\Controllers\API\V1\Cmms\ConditionMonitoringController::class, 'evaluateRules']);
        });

        Route::prefix('stores')->group(function () {
            Route::get('/', [\App\Http\Controllers\API\V1\Cmms\StoresController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\API\V1\Cmms\StoresController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\API\V1\Cmms\StoresController::class, 'show']);
            Route::patch('/{id}', [\App\Http\Controllers\API\V1\Cmms\StoresController::class, 'update']);
            Route::put('/{id}', [\App\Http\Controllers\API\V1\Cmms\StoresController::class, 'update']);
            Route::post('/{storeId}/bins', [\App\Http\Controllers\API\V1\Cmms\StoresController::class, 'createBin']);
            Route::post('/receive', [\App\Http\Controllers\API\V1\Cmms\StoresController::class, 'receiveStock']);
            Route::post('/issue', [\App\Http\Controllers\API\V1\Cmms\StoresController::class, 'issueStock']);
            Route::get('/valuation', [\App\Http\Controllers\API\V1\Cmms\StoresController::class, 'valuation']);
            Route::get('/low-stock', [\App\Http\Controllers\API\V1\Cmms\StoresController::class, 'lowStock']);
        });

        Route::prefix('fleet')->group(function () {
            Route::get('/', [\App\Http\Controllers\API\V1\Cmms\FleetController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\API\V1\Cmms\FleetController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\API\V1\Cmms\FleetController::class, 'show']);
            Route::patch('/{id}', [\App\Http\Controllers\API\V1\Cmms\FleetController::class, 'update']);
            Route::put('/{id}', [\App\Http\Controllers\API\V1\Cmms\FleetController::class, 'update']);
            Route::post('/{fleetAssetId}/service-schedules', [\App\Http\Controllers\API\V1\Cmms\FleetController::class, 'createServiceSchedule']);
            Route::post('/{fleetAssetId}/fuel-logs', [\App\Http\Controllers\API\V1\Cmms\FleetController::class, 'logFuel']);
            Route::post('/{fleetAssetId}/uptime-logs', [\App\Http\Controllers\API\V1\Cmms\FleetController::class, 'logUptime']);
            Route::get('/utilization', [\App\Http\Controllers\API\V1\Cmms\FleetController::class, 'utilization']);
            Route::get('/{fleetAssetId}/fuel-efficiency', [\App\Http\Controllers\API\V1\Cmms\FleetController::class, 'fuelEfficiency']);
        });

        Route::prefix('contractors')->group(function () {
            Route::get('/contracts', [\App\Http\Controllers\API\V1\Cmms\ContractorController::class, 'index']);
            Route::post('/contracts', [\App\Http\Controllers\API\V1\Cmms\ContractorController::class, 'store']);
            Route::get('/contracts/{id}', [\App\Http\Controllers\API\V1\Cmms\ContractorController::class, 'show']);
            Route::patch('/contracts/{id}', [\App\Http\Controllers\API\V1\Cmms\ContractorController::class, 'update']);
            Route::put('/contracts/{id}', [\App\Http\Controllers\API\V1\Cmms\ContractorController::class, 'update']);
            Route::post('/contracts/{contractId}/violations', [\App\Http\Controllers\API\V1\Cmms\ContractorController::class, 'recordViolation']);
            Route::post('/contracts/{contractId}/payments', [\App\Http\Controllers\API\V1\Cmms\ContractorController::class, 'recordPayment']);
            Route::get('/vendor-score', [\App\Http\Controllers\API\V1\Cmms\ContractorController::class, 'vendorScore']);
            Route::get('/active', [\App\Http\Controllers\API\V1\Cmms\ContractorController::class, 'activeContracts']);
            Route::get('/expiring', [\App\Http\Controllers\API\V1\Cmms\ContractorController::class, 'expiring']);
        });

        Route::prefix('hse')->group(function () {
            Route::get('/permits', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'permits']);
            Route::post('/permits', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'storePermit']);
            Route::get('/permits/{id}', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'showPermit']);
            Route::post('/permits/{id}/approve', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'approvePermit']);
            Route::post('/permits/{id}/close', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'closePermit']);
            
            Route::post('/risk-assessments', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'storeRiskAssessment']);
            Route::patch('/risk-assessments/{id}', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'updateRiskAssessment']);
            Route::put('/risk-assessments/{id}', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'updateRiskAssessment']);
            
            Route::get('/incidents', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'incidents']);
            Route::post('/incidents', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'storeIncident']);
            Route::post('/incidents/{id}/investigate', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'investigateIncident']);
            Route::post('/incidents/{id}/close', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'closeIncident']);
            Route::get('/incidents/stats', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'incidentStats']);
            
            Route::get('/capas', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'capas']);
            Route::post('/capas', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'storeCapa']);
            Route::post('/capas/{id}/complete', [\App\Http\Controllers\API\V1\Cmms\HseController::class, 'completeCapa']);
        });
    });

    Route::prefix('operations')->group(function () {
        Route::prefix('events')->group(function () {
            Route::get('/', [EventController::class, 'index'])->middleware('permission:view events');
            Route::post('/ingest', [EventController::class, 'ingest'])->middleware('permission:ingest events');
            Route::get('/{event}', [EventController::class, 'show'])->middleware('permission:view events');
            Route::post('/{event}/acknowledge', [EventController::class, 'acknowledge'])->middleware('permission:acknowledge events');
            Route::post('/{event}/resolve', [EventController::class, 'resolve'])->middleware('permission:resolve events');
            Route::post('/{event}/link', [EventController::class, 'link'])->middleware('permission:edit events');
        });

        Route::prefix('shifts')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\Operations\ShiftController::class, 'index'])->middleware('permission:view shifts');
            Route::post('/', [\App\Http\Controllers\Api\V1\Operations\ShiftController::class, 'store'])->middleware('permission:create shifts');
            Route::get('/{shift}', [\App\Http\Controllers\Api\V1\Operations\ShiftController::class, 'show'])->middleware('permission:view shifts');
            Route::post('/{shift}/close', [\App\Http\Controllers\Api\V1\Operations\ShiftController::class, 'close'])->middleware('permission:edit shifts');
            Route::post('/{shift}/entries', [\App\Http\Controllers\Api\V1\Operations\ShiftController::class, 'addEntry'])->middleware('permission:create shift entries');
        });

        Route::prefix('playbooks')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\Operations\PlaybookController::class, 'index'])->middleware('permission:view playbooks');
            Route::post('/', [\App\Http\Controllers\Api\V1\Operations\PlaybookController::class, 'store'])->middleware('permission:create playbooks');
            Route::get('/find-matching', [\App\Http\Controllers\Api\V1\Operations\PlaybookController::class, 'findMatching'])->middleware('permission:view playbooks');
            Route::get('/{playbook}', [\App\Http\Controllers\Api\V1\Operations\PlaybookController::class, 'show'])->middleware('permission:view playbooks');
            Route::patch('/{playbook}', [\App\Http\Controllers\Api\V1\Operations\PlaybookController::class, 'update'])->middleware('permission:edit playbooks');
            Route::put('/{playbook}', [\App\Http\Controllers\Api\V1\Operations\PlaybookController::class, 'update'])->middleware('permission:edit playbooks');
            Route::delete('/{playbook}', [\App\Http\Controllers\Api\V1\Operations\PlaybookController::class, 'destroy'])->middleware('permission:delete playbooks');
        });

        Route::prefix('checklists')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\Operations\ChecklistController::class, 'index'])->middleware('permission:view checklists');
            Route::post('/', [\App\Http\Controllers\Api\V1\Operations\ChecklistController::class, 'store'])->middleware('permission:create checklists');
            Route::get('/{checklist}', [\App\Http\Controllers\Api\V1\Operations\ChecklistController::class, 'show'])->middleware('permission:view checklists');
            Route::patch('/{checklist}', [\App\Http\Controllers\Api\V1\Operations\ChecklistController::class, 'update'])->middleware('permission:edit checklists');
            Route::put('/{checklist}', [\App\Http\Controllers\Api\V1\Operations\ChecklistController::class, 'update'])->middleware('permission:edit checklists');
            Route::delete('/{checklist}', [\App\Http\Controllers\Api\V1\Operations\ChecklistController::class, 'destroy'])->middleware('permission:delete checklists');
            
            Route::post('/{checklist}/start', [\App\Http\Controllers\Api\V1\Operations\ChecklistController::class, 'startRun'])->middleware('permission:create checklist runs');
        });

        Route::prefix('checklist-runs')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\Operations\ChecklistController::class, 'runs'])->middleware('permission:view checklist runs');
            Route::patch('/{run}', [\App\Http\Controllers\Api\V1\Operations\ChecklistController::class, 'updateRun'])->middleware('permission:edit checklist runs');
            Route::put('/{run}', [\App\Http\Controllers\Api\V1\Operations\ChecklistController::class, 'updateRun'])->middleware('permission:edit checklist runs');
            Route::post('/{run}/complete', [\App\Http\Controllers\Api\V1\Operations\ChecklistController::class, 'completeRun'])->middleware('permission:edit checklist runs');
        });
    });

    Route::prefix('water-quality')->group(function () {
        Route::prefix('parameters')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\WqParameterController::class, 'index'])->middleware('permission:view water quality parameters');
            Route::post('/', [\App\Http\Controllers\Api\WqParameterController::class, 'store'])->middleware('permission:create water quality parameters');
            Route::get('/{parameterId}', [\App\Http\Controllers\Api\WqParameterController::class, 'show'])->middleware('permission:view water quality parameters');
            Route::patch('/{parameterId}', [\App\Http\Controllers\Api\WqParameterController::class, 'update'])->middleware('permission:edit water quality parameters');
            Route::put('/{parameterId}', [\App\Http\Controllers\Api\WqParameterController::class, 'update'])->middleware('permission:edit water quality parameters');
            Route::delete('/{parameterId}', [\App\Http\Controllers\Api\WqParameterController::class, 'destroy'])->middleware('permission:delete water quality parameters');
        });

        Route::prefix('sampling-points')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\WqSamplingPointController::class, 'index'])->middleware('permission:view water quality sampling points');
            Route::post('/', [\App\Http\Controllers\Api\WqSamplingPointController::class, 'store'])->middleware('permission:create water quality sampling points');
            Route::get('/{pointId}', [\App\Http\Controllers\Api\WqSamplingPointController::class, 'show'])->middleware('permission:view water quality sampling points');
            Route::patch('/{pointId}', [\App\Http\Controllers\Api\WqSamplingPointController::class, 'update'])->middleware('permission:edit water quality sampling points');
            Route::put('/{pointId}', [\App\Http\Controllers\Api\WqSamplingPointController::class, 'update'])->middleware('permission:edit water quality sampling points');
            Route::delete('/{pointId}', [\App\Http\Controllers\Api\WqSamplingPointController::class, 'destroy'])->middleware('permission:delete water quality sampling points');
        });

        Route::prefix('plans')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\WqPlanController::class, 'index'])->middleware('permission:view water quality plans');
            Route::post('/', [\App\Http\Controllers\Api\WqPlanController::class, 'store'])->middleware('permission:create water quality plans');
            Route::get('/{planId}', [\App\Http\Controllers\Api\WqPlanController::class, 'show'])->middleware('permission:view water quality plans');
            Route::post('/{planId}/rules', [\App\Http\Controllers\Api\WqPlanController::class, 'addRule'])->middleware('permission:edit water quality plans');
            Route::post('/{planId}/activate', [\App\Http\Controllers\Api\WqPlanController::class, 'activate'])->middleware('permission:edit water quality plans');
            Route::post('/{planId}/generate-tasks', [\App\Http\Controllers\Api\WqPlanController::class, 'generateTasks'])->middleware('permission:create water quality samples');
        });

        Route::prefix('samples')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\WqSampleController::class, 'index'])->middleware('permission:view water quality samples');
            Route::post('/', [\App\Http\Controllers\Api\WqSampleController::class, 'store'])->middleware('permission:create water quality samples');
            Route::get('/barcode/{barcode}', [\App\Http\Controllers\Api\WqSampleController::class, 'byBarcode'])->middleware('permission:view water quality samples');
            Route::get('/{sampleId}', [\App\Http\Controllers\Api\WqSampleController::class, 'show'])->middleware('permission:view water quality samples');
            Route::post('/{sampleId}/collect', [\App\Http\Controllers\Api\WqSampleController::class, 'collect'])->middleware('permission:edit water quality samples');
            Route::post('/{sampleId}/receive-lab', [\App\Http\Controllers\Api\WqSampleController::class, 'receiveLab'])->middleware('permission:edit water quality samples');
        });

        Route::prefix('results')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\WqResultController::class, 'index'])->middleware('permission:view water quality results');
            Route::post('/', [\App\Http\Controllers\Api\WqResultController::class, 'store'])->middleware('permission:create water quality results');
            Route::post('/import-csv', [\App\Http\Controllers\Api\WqResultController::class, 'importCsv'])->middleware('permission:import water quality results');
        });

        Route::prefix('compliance')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\WqComplianceController::class, 'index'])->middleware('permission:view water quality compliance');
            Route::get('/summary', [\App\Http\Controllers\Api\WqComplianceController::class, 'summary'])->middleware('permission:view water quality compliance');
            Route::post('/compute', [\App\Http\Controllers\Api\WqComplianceController::class, 'compute'])->middleware('permission:compute water quality compliance');
            Route::post('/compute-all', [\App\Http\Controllers\Api\WqComplianceController::class, 'computeAll'])->middleware('permission:compute water quality compliance');
        });
    });

    Route::prefix('crm')->group(function () {
        Route::prefix('customers')->group(function () {
            Route::get('/', [CustomerController::class, 'index'])->middleware('permission:view customers');
            Route::post('/', [CustomerController::class, 'store'])->middleware('permission:create customers');
            Route::get('/{id}', [CustomerController::class, 'show'])->middleware('permission:view customers');
            Route::patch('/{id}', [CustomerController::class, 'update'])->middleware('permission:edit customers');
            Route::put('/{id}', [CustomerController::class, 'update'])->middleware('permission:edit customers');
            Route::delete('/{id}', [CustomerController::class, 'destroy'])->middleware('permission:delete customers');
        });

        Route::prefix('premises')->group(function () {
            Route::get('/', [PremiseController::class, 'index'])->middleware('permission:view premises');
            Route::post('/', [PremiseController::class, 'store'])->middleware('permission:create premises');
            Route::get('/nearby', [PremiseController::class, 'nearby'])->middleware('permission:view premises');
            Route::get('/{id}', [PremiseController::class, 'show'])->middleware('permission:view premises');
            Route::patch('/{id}', [PremiseController::class, 'update'])->middleware('permission:edit premises');
            Route::put('/{id}', [PremiseController::class, 'update'])->middleware('permission:edit premises');
        });

        Route::prefix('meters')->group(function () {
            Route::post('/', [MeterController::class, 'store'])->middleware('permission:create meters');
            Route::get('/{meterId}/reads', [MeterController::class, 'reads'])->middleware('permission:view meters');
            Route::post('/reads', [MeterController::class, 'recordRead'])->middleware('permission:record meter reads');
            Route::get('/{meterId}/anomalies', [MeterController::class, 'anomalies'])->middleware('permission:view meters');
            Route::post('/{meterId}/replace', [MeterController::class, 'replace'])->middleware('permission:create meters');
        });

        Route::prefix('accounts')->group(function () {
            Route::get('/{accountNo}/overview', [Account360Controller::class, 'overview'])->middleware('permission:view service connections');
            Route::get('/{accountNo}/billing', [Account360Controller::class, 'billingHistory'])->middleware('permission:view invoices');
            Route::get('/{accountNo}/analytics', [Account360Controller::class, 'consumptionAnalytics'])->middleware('permission:view service connections');
        });

        Route::prefix('ra')->group(function () {
            Route::get('/cases', [RaCaseController::class, 'index'])->middleware('permission:view ra cases');
            Route::get('/cases/high-priority', [RaCaseController::class, 'highPriority'])->middleware('permission:view ra cases');
            Route::post('/cases/run-rules', [RaCaseController::class, 'runRules'])->middleware('permission:run ra rules');
            Route::post('/cases/{caseId}/triage', [RaCaseController::class, 'triage'])->middleware('permission:triage ra cases');
            Route::post('/cases/{caseId}/dispatch', [RaCaseController::class, 'dispatchField'])->middleware('permission:dispatch ra cases');
            Route::post('/cases/{caseId}/resolve', [RaCaseController::class, 'resolve'])->middleware('permission:resolve ra cases');
            Route::post('/cases/{caseId}/close', [RaCaseController::class, 'close'])->middleware('permission:close ra cases');

            Route::get('/rules', [RaRuleController::class, 'index'])->middleware('permission:view ra rules');
            Route::post('/rules', [RaRuleController::class, 'store'])->middleware('permission:create ra rules');
            Route::patch('/rules/{id}', [RaRuleController::class, 'update'])->middleware('permission:edit ra rules');
            Route::put('/rules/{id}', [RaRuleController::class, 'update'])->middleware('permission:edit ra rules');
            Route::delete('/rules/{id}', [RaRuleController::class, 'destroy'])->middleware('permission:delete ra rules');
        });

        Route::prefix('dunning')->group(function () {
            Route::get('/aging', [DunningController::class, 'agingReport'])->middleware('permission:view dunning reports');
            Route::get('/disconnection-list', [DunningController::class, 'disconnectionList'])->middleware('permission:view dunning reports');
            Route::post('/notices', [DunningController::class, 'generateNotices'])->middleware('permission:generate dunning notices');
            Route::post('/mark-disconnect', [DunningController::class, 'markForDisconnection'])->middleware('permission:mark for disconnection');
            Route::post('/disconnect', [DunningController::class, 'disconnect'])->middleware('permission:disconnect accounts');
            Route::post('/reconnect', [DunningController::class, 'reconnect'])->middleware('permission:reconnect accounts');
            Route::get('/payments/{accountNo}', [DunningController::class, 'paymentHistory'])->middleware('permission:view payments');
        });

        Route::prefix('import')->group(function () {
            Route::post('/billing', [ImportController::class, 'importBilling'])->middleware('permission:import billing data');
            Route::post('/mpesa', [ImportController::class, 'importMpesa'])->middleware('permission:import mpesa data');
        });

        Route::prefix('interactions')->group(function () {
            Route::get('/', [InteractionController::class, 'index'])->middleware('permission:view interactions');
            Route::post('/', [InteractionController::class, 'store'])->middleware('permission:create interactions');
            Route::get('/{id}', [InteractionController::class, 'show'])->middleware('permission:view interactions');
        });

        Route::prefix('complaints')->group(function () {
            Route::get('/', [ComplaintController::class, 'index'])->middleware('permission:view complaints');
            Route::post('/', [ComplaintController::class, 'store'])->middleware('permission:create complaints');
            Route::get('/{id}', [ComplaintController::class, 'show'])->middleware('permission:view complaints');
            Route::patch('/{id}', [ComplaintController::class, 'update'])->middleware('permission:assign complaints');
            Route::put('/{id}', [ComplaintController::class, 'update'])->middleware('permission:assign complaints');
        });
    });

    Route::prefix('hydromet')->group(function () {
        Route::prefix('sources')->group(function () {
            Route::get('/', [SourceController::class, 'index'])->middleware('permission:view sources');
            Route::post('/', [SourceController::class, 'store'])->middleware('permission:create sources');
            Route::get('/nearby', [SourceController::class, 'nearby'])->middleware('permission:view sources');
            Route::get('/in-bounds', [SourceController::class, 'inBounds'])->middleware('permission:view sources');
            Route::get('/{id}', [SourceController::class, 'show'])->middleware('permission:view sources');
            Route::patch('/{id}', [SourceController::class, 'update'])->middleware('permission:edit sources');
            Route::put('/{id}', [SourceController::class, 'update'])->middleware('permission:edit sources');
            Route::delete('/{id}', [SourceController::class, 'destroy'])->middleware('permission:delete sources');
            Route::post('/{id}/abstraction', [SourceController::class, 'logAbstraction'])->middleware('permission:log abstraction');
            Route::get('/{id}/abstraction/history', [SourceController::class, 'abstractionHistory'])->middleware('permission:view sources');
            Route::get('/{id}/abstraction/total', [SourceController::class, 'totalAbstraction'])->middleware('permission:view sources');
        });

        Route::prefix('stations')->group(function () {
            Route::get('/', [StationController::class, 'index'])->middleware('permission:view stations');
            Route::post('/', [StationController::class, 'store'])->middleware('permission:create stations');
            Route::get('/nearby', [StationController::class, 'nearby'])->middleware('permission:view stations');
            Route::get('/in-bounds', [StationController::class, 'inBounds'])->middleware('permission:view stations');
            Route::get('/{id}', [StationController::class, 'show'])->middleware('permission:view stations');
            Route::patch('/{id}', [StationController::class, 'update'])->middleware('permission:edit stations');
            Route::put('/{id}', [StationController::class, 'update'])->middleware('permission:edit stations');
            Route::delete('/{id}', [StationController::class, 'destroy'])->middleware('permission:delete stations');
            Route::post('/{id}/activate', [StationController::class, 'activate'])->middleware('permission:edit stations');
            Route::post('/{id}/deactivate', [StationController::class, 'deactivate'])->middleware('permission:edit stations');
            Route::get('/{id}/sensors', [StationController::class, 'sensors'])->middleware('permission:view sensors');
            Route::post('/{id}/sensors', [StationController::class, 'addSensor'])->middleware('permission:create sensors');
            Route::patch('/{stationId}/sensors/{sensorId}', [StationController::class, 'updateSensor'])->middleware('permission:edit sensors');
            Route::put('/{stationId}/sensors/{sensorId}', [StationController::class, 'updateSensor'])->middleware('permission:edit sensors');
            Route::delete('/{stationId}/sensors/{sensorId}', [StationController::class, 'deleteSensor'])->middleware('permission:delete sensors');
        });
    });

    Route::prefix('costing')->group(function () {
        Route::prefix('budgets')->group(function () {
            Route::get('/', [BudgetController::class, 'index'])->middleware('permission:view budgets');
            Route::post('/', [BudgetController::class, 'store'])->middleware('permission:create budgets');
            Route::get('/{id}', [BudgetController::class, 'show'])->middleware('permission:view budgets');
            Route::patch('/{id}', [BudgetController::class, 'update'])->middleware('permission:edit budgets');
            Route::put('/{id}', [BudgetController::class, 'update'])->middleware('permission:edit budgets');
            Route::delete('/{id}', [BudgetController::class, 'destroy'])->middleware('permission:delete budgets');
            Route::post('/{id}/approve', [BudgetController::class, 'approve'])->middleware('permission:approve budgets');
            Route::get('/{id}/lines', [BudgetController::class, 'getLines'])->middleware('permission:view budgets');
            Route::post('/{id}/lines', [BudgetController::class, 'upsertLines'])->middleware('permission:edit budgets');
            Route::get('/{id}/summary', [BudgetController::class, 'getSummary'])->middleware('permission:view budgets');
        });

        Route::prefix('allocation-rules')->group(function () {
            Route::get('/', [AllocationController::class, 'indexRules'])->middleware('permission:view allocations');
            Route::post('/', [AllocationController::class, 'storeRule'])->middleware('permission:create allocations');
            Route::patch('/{id}', [AllocationController::class, 'updateRule'])->middleware('permission:edit allocations');
            Route::put('/{id}', [AllocationController::class, 'updateRule'])->middleware('permission:edit allocations');
            Route::delete('/{id}', [AllocationController::class, 'destroyRule'])->middleware('permission:delete allocations');
        });

        Route::prefix('allocation-runs')->group(function () {
            Route::get('/', [AllocationController::class, 'indexRuns'])->middleware('permission:view allocations');
            Route::post('/', [AllocationController::class, 'executeRun'])->middleware('permission:execute allocations');
            Route::get('/{id}', [AllocationController::class, 'showRun'])->middleware('permission:view allocations');
            Route::delete('/{id}', [AllocationController::class, 'destroyRun'])->middleware('permission:delete allocations');
        });

        Route::prefix('cost-to-serve')->group(function () {
            Route::get('/', [CostingKpiController::class, 'index'])->middleware('permission:view cost to serve');
            Route::post('/', [CostingKpiController::class, 'calculate'])->middleware('permission:edit cost to serve');
            Route::get('/summary', [CostingKpiController::class, 'summary'])->middleware('permission:view cost to serve');
            Route::get('/dma-league/{period}', [CostingKpiController::class, 'dmaLeague'])->middleware('permission:view cost to serve');
            Route::get('/trends', [CostingKpiController::class, 'trends'])->middleware('permission:view cost to serve');
        });
    });

    Route::prefix('projects')->group(function () {
        Route::get('/', [ProjectController::class, 'index'])->middleware('permission:view projects');
        Route::post('/', [ProjectController::class, 'store'])->middleware('permission:create projects');
        Route::get('/dashboard', [ProjectController::class, 'dashboard'])->middleware('permission:view projects');
        Route::get('/{id}', [ProjectController::class, 'show'])->middleware('permission:view projects');
        Route::patch('/{id}', [ProjectController::class, 'update'])->middleware('permission:edit projects');
        Route::put('/{id}', [ProjectController::class, 'update'])->middleware('permission:edit projects');
        Route::delete('/{id}', [ProjectController::class, 'destroy'])->middleware('permission:delete projects');
    });

    Route::prefix('investments')->group(function () {
        Route::get('/', [InvestmentController::class, 'index'])->middleware('permission:view investments');
        Route::post('/', [InvestmentController::class, 'store'])->middleware('permission:create investments');
        Route::get('/{id}', [InvestmentController::class, 'show'])->middleware('permission:view investments');
        Route::patch('/{id}', [InvestmentController::class, 'update'])->middleware('permission:edit investments');
        Route::put('/{id}', [InvestmentController::class, 'update'])->middleware('permission:edit investments');
        Route::delete('/{id}', [InvestmentController::class, 'destroy'])->middleware('permission:delete investments');
        Route::post('/{id}/score', [InvestmentController::class, 'score'])->middleware('permission:score investments');
        Route::get('/{id}/scores', [InvestmentController::class, 'scores'])->middleware('permission:view investments');
        Route::post('/{id}/appraisal', [InvestmentController::class, 'appraisal'])->middleware('permission:appraise investments');
        Route::get('/{id}/appraisals', [InvestmentController::class, 'appraisals'])->middleware('permission:view investments');
        Route::post('/{id}/convert', [InvestmentController::class, 'convert'])->middleware('permission:convert investments');
    });

    Route::prefix('land')->group(function () {
        Route::get('/', [LandController::class, 'index'])->middleware('permission:view land parcels');
        Route::post('/', [LandController::class, 'store'])->middleware('permission:create land parcels');
        Route::get('/in-bounds', [LandController::class, 'inBounds'])->middleware('permission:view land parcels');
        Route::get('/dashboard', [LandController::class, 'dashboard'])->middleware('permission:view land parcels');
        Route::get('/{id}', [LandController::class, 'show'])->middleware('permission:view land parcels');
        Route::patch('/{id}', [LandController::class, 'update'])->middleware('permission:edit land parcels');
        Route::put('/{id}', [LandController::class, 'update'])->middleware('permission:edit land parcels');
        Route::delete('/{id}', [LandController::class, 'destroy'])->middleware('permission:delete land parcels');
        
        Route::prefix('{parcelId}')->group(function () {
            Route::post('/wayleaves', [LandController::class, 'storeWayleave'])->middleware('permission:create wayleaves');
            Route::patch('/wayleaves/{id}', [LandController::class, 'updateWayleave'])->middleware('permission:edit wayleaves');
            Route::put('/wayleaves/{id}', [LandController::class, 'updateWayleave'])->middleware('permission:edit wayleaves');
            Route::delete('/wayleaves/{id}', [LandController::class, 'destroyWayleave'])->middleware('permission:delete wayleaves');
            
            Route::post('/compensations', [LandController::class, 'storeCompensation'])->middleware('permission:create compensations');
            Route::patch('/compensations/{id}', [LandController::class, 'updateCompensation'])->middleware('permission:edit compensations');
            Route::put('/compensations/{id}', [LandController::class, 'updateCompensation'])->middleware('permission:edit compensations');
            Route::patch('/compensations/{id}/payment', [LandController::class, 'updatePayment'])->middleware('permission:edit compensations');
            Route::put('/compensations/{id}/payment', [LandController::class, 'updatePayment'])->middleware('permission:edit compensations');
            Route::delete('/compensations/{id}', [LandController::class, 'destroyCompensation'])->middleware('permission:delete compensations');
            
            Route::post('/disputes', [LandController::class, 'storeDispute'])->middleware('permission:create disputes');
            Route::patch('/disputes/{id}', [LandController::class, 'updateDispute'])->middleware('permission:edit disputes');
            Route::put('/disputes/{id}', [LandController::class, 'updateDispute'])->middleware('permission:edit disputes');
            Route::delete('/disputes/{id}', [LandController::class, 'destroyDispute'])->middleware('permission:delete disputes');
        });
    });

    // Core Operations & Network Management
    Route::prefix('core-ops')->middleware(['core_ops.monitor', 'auth:sanctum'])->group(function () {
        // Network Topology
        Route::get('/network/nodes', [\App\Http\Controllers\Api\TopologyController::class, 'nodes'])->middleware('permission:view network topology');
        Route::post('/network/nodes', [\App\Http\Controllers\Api\TopologyController::class, 'storeNode'])->middleware('permission:edit network topology');
        Route::get('/network/edges', [\App\Http\Controllers\Api\TopologyController::class, 'edges'])->middleware('permission:view network topology');
        Route::post('/network/edges', [\App\Http\Controllers\Api\TopologyController::class, 'storeEdge'])->middleware('permission:edit network topology');
        Route::get('/network/trace/{node}', [\App\Http\Controllers\Api\TopologyController::class, 'traceUpstream'])->middleware('permission:view network topology');

        // Telemetry & SCADA
        Route::get('/telemetry/tags', [\App\Http\Controllers\Api\TelemetryController::class, 'tags'])->middleware('permission:view telemetry');
        Route::post('/telemetry/tags', [\App\Http\Controllers\Api\TelemetryController::class, 'storeTag'])->middleware('permission:manage telemetry');
        Route::get('/telemetry/measurements', [\App\Http\Controllers\Api\TelemetryController::class, 'measurements'])->middleware('permission:view telemetry');
        Route::post('/telemetry/ingest', [\App\Http\Controllers\Api\TelemetryController::class, 'ingest'])->middleware('permission:ingest telemetry');

        // NRW & Interventions
        Route::get('/nrw/snapshots', [\App\Http\Controllers\Api\NrwController::class, 'snapshots'])->middleware('permission:view nrw');
        Route::post('/nrw/snapshots', [\App\Http\Controllers\Api\NrwController::class, 'storeSnapshot'])->middleware('permission:manage nrw');
        Route::get('/nrw/interventions', [\App\Http\Controllers\Api\NrwController::class, 'interventions'])->middleware('permission:view nrw');
        Route::post('/nrw/interventions', [\App\Http\Controllers\Api\NrwController::class, 'storeIntervention'])->middleware('permission:manage nrw');

        // Outage Management
        Route::get('/outages', [\App\Http\Controllers\Api\OutageController::class, 'index'])->middleware('permission:view outages');
        Route::post('/outages', [\App\Http\Controllers\Api\OutageController::class, 'store'])->middleware('permission:manage outages');
        Route::get('/outages/{outage}', [\App\Http\Controllers\Api\OutageController::class, 'show'])->middleware('permission:view outages');
        Route::patch('/outages/{outage}', [\App\Http\Controllers\Api\OutageController::class, 'update'])->middleware('permission:manage outages');
        Route::post('/outages/{outage}/state', [\App\Http\Controllers\Api\OutageController::class, 'changeState'])->middleware('permission:manage outages');
        Route::delete('/outages/{outage}', [\App\Http\Controllers\Api\OutageController::class, 'destroy'])->middleware('permission:delete outages');

        // Dosing Control
        Route::get('/dosing/plans', [\App\Http\Controllers\Api\DosingController::class, 'plans'])->middleware('permission:view dosing');
        Route::post('/dosing/plans', [\App\Http\Controllers\Api\DosingController::class, 'storePlan'])->middleware('permission:manage dosing');
        Route::get('/dosing/stocks', [\App\Http\Controllers\Api\DosingController::class, 'stocks'])->middleware('permission:view dosing');
        Route::post('/dosing/stocks', [\App\Http\Controllers\Api\DosingController::class, 'storeStock'])->middleware('permission:manage dosing');

        // Pump Scheduling
        Route::get('/schedule', [\App\Http\Controllers\Api\ScheduleController::class, 'index'])->middleware('permission:view pump schedules');
        Route::post('/schedule', [\App\Http\Controllers\Api\ScheduleController::class, 'store'])->middleware('permission:manage pump schedules');
        Route::patch('/schedule/{schedule}', [\App\Http\Controllers\Api\ScheduleController::class, 'update'])->middleware('permission:manage pump schedules');

        // Operations Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Api\OperationsController::class, 'dashboard'])->middleware('permission:view operations dashboard');
        Route::get('/alarms', [\App\Http\Controllers\Api\OperationsController::class, 'alarms'])->middleware('permission:view operations dashboard');
    });
});
