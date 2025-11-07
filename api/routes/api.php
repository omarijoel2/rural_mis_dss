<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\DmaController;
use App\Http\Controllers\Api\FacilityController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\PipelineController;
use App\Http\Controllers\Api\SchemeController;
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

Route::prefix('v1')->group(function () {
    Route::apiResource('organizations', OrganizationController::class);
    Route::apiResource('schemes', SchemeController::class);
    Route::apiResource('facilities', FacilityController::class);
    Route::apiResource('dmas', DmaController::class);
    Route::apiResource('pipelines', PipelineController::class);
    Route::apiResource('zones', ZoneController::class);
    Route::apiResource('addresses', AddressController::class);
});
