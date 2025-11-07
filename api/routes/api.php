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

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('organizations', OrganizationController::class);
    Route::apiResource('schemes', SchemeController::class);
    Route::apiResource('facilities', FacilityController::class);
    Route::apiResource('dmas', DmaController::class);
    Route::apiResource('pipelines', PipelineController::class);
    Route::apiResource('zones', ZoneController::class);
    Route::apiResource('addresses', AddressController::class);

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
});
